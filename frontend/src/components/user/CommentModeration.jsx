import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  CircularProgress,
  TextField,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import commentService from '../../services/commentService';

const CommentModeration = () => {
  const theme = useTheme();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState({ text: '', author: '', postId: '' });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await commentService.getComments();
      setComments(response.data);
    } catch (err) {
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitNew = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await commentService.analyzeComment(newComment);
      setNewComment({ text: '', author: '', postId: '' });
      await loadComments();
    } catch (err) {
      setError('Failed to analyze comment');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (commentId, newStatus, override = false) => {
    try {
      await commentService.updateCommentStatus(commentId, newStatus, override);
      await loadComments();
    } catch (err) {
      setError('Failed to update comment status');
    }
  };

  const handleOverrideClick = (comment) => {
    setSelectedComment(comment);
    setOpenDialog(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Comment Moderation
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Add New Comment
          </Typography>
          <form onSubmit={handleSubmitNew}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Comment Text"
                  value={newComment.text}
                  onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Author Username"
                  value={newComment.author}
                  onChange={(e) => setNewComment({ ...newComment, author: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Post ID"
                  value={newComment.postId}
                  onChange={(e) => setNewComment({ ...newComment, postId: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Analyze Comment'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {comments.map((comment) => (
          <Grid item xs={12} key={comment._id}>
            <Card
              sx={{
                borderLeft: 6,
                borderColor: comment.toxicityAnalysis.isToxic
                  ? theme.palette.error.main
                  : theme.palette.success.main
              }}
            >
              <CardContent>
                <Typography variant="body1" gutterBottom>
                  {comment.text}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Author: {comment.author} | Post ID: {comment.postId}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="success"
                    onClick={() => handleStatusUpdate(comment._id, 'approved')}
                    sx={{ mr: 1 }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleStatusUpdate(comment._id, 'rejected')}
                    sx={{ mr: 1 }}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleOverrideClick(comment)}
                  >
                    Override Analysis
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Override Toxicity Analysis</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to override the toxicity analysis for this comment?
            This action will be logged.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={() => {
              handleStatusUpdate(selectedComment._id, selectedComment.status, true);
              setOpenDialog(false);
            }}
            color="primary"
          >
            Confirm Override
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommentModeration;