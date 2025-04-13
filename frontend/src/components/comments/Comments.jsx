import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Stack,
  useTheme
} from '@mui/material';
import {
  Send as SendIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Reply as ReplyIcon,
  ThumbUp as LikeIcon,
  AttachFile as AttachmentIcon,
  InsertEmoticon as EmojiIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import EmojiPicker from 'emoji-picker-react';
import { useComments } from '../../hooks/useComments';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../context/SnackbarContext';
import LoadingScreen from '../common/LoadingScreen';
import EmptyState from '../common/EmptyState';

const Comments = ({ projectId, resourceId, resourceType }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { 
    comments, 
    loading, 
    error, 
    addComment, 
    updateComment, 
    deleteComment, 
    likeComment 
  } = useComments(projectId, resourceId, resourceType);
  const { showSnackbar } = useSnackbar();

  // State
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [emojiPickerAnchorEl, setEmojiPickerAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);
  
  // Refs
  const fileInputRef = useRef(null);
  const commentInputRef = useRef(null);

  const handleMenuOpen = (event, comment) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedComment(null);
  };

  const handleEmojiPickerOpen = (event) => {
    setEmojiPickerAnchorEl(event.currentTarget);
  };

  const handleEmojiPickerClose = () => {
    setEmojiPickerAnchorEl(null);
  };

  const handleEmojiSelect = (emojiData) => {
    setNewComment(prev => prev + emojiData.emoji);
    handleEmojiPickerClose();
    commentInputRef.current?.focus();
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleRemoveAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const content = newComment.trim();

    if (!content && attachments.length === 0) return;

    try {
      await addComment({
        content,
        attachments,
        parentId: replyTo?.id
      });

      setNewComment('');
      setAttachments([]);
      setReplyTo(null);
      showSnackbar('Comment added successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to add comment', 'error');
    }
  };

  const handleEdit = (comment) => {
    setEditingComment(comment);
    setNewComment(comment.content);
    handleMenuClose();
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setNewComment('');
  };

  const handleUpdate = async () => {
    const content = newComment.trim();
    if (!content) return;

    try {
      await updateComment(editingComment.id, {
        content,
        attachments: [...editingComment.attachments, ...attachments]
      });
      
      setEditingComment(null);
      setNewComment('');
      setAttachments([]);
      showSnackbar('Comment updated successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to update comment', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComment(selectedComment.id);
      showSnackbar('Comment deleted successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to delete comment', 'error');
    }
    setDeleteDialogOpen(false);
    handleMenuClose();
  };

  const handleLike = async (comment) => {
    try {
      await likeComment(comment.id);
    } catch (error) {
      showSnackbar('Failed to like comment', 'error');
    }
  };

  const handleReply = (comment) => {
    setReplyTo(comment);
    commentInputRef.current?.focus();
    handleMenuClose();
  };

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <EmptyState
        title="Error Loading Comments"
        description={error.message}
        action={
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <Box>
      {/* Comment Input */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Avatar src={user.photoURL} alt={user.displayName} />
            <Box sx={{ flex: 1 }}>
              {replyTo && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1,
                    p: 1,
                    bgcolor: 'action.hover',
                    borderRadius: 1
                  }}
                >
                  <Typography variant="caption">
                    Replying to {replyTo.user.name}
                  </Typography>
                  <IconButton size="small" onClick={() => setReplyTo(null)}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder={replyTo ? 'Write a reply...' : 'Write a comment...'}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                inputRef={commentInputRef}
              />
              {attachments.length > 0 && (
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  {attachments.map((file, index) => (
                    <Chip
                      key={index}
                      label={file.name}
                      onDelete={() => handleRemoveAttachment(index)}
                      size="small"
                    />
                  ))}
                </Stack>
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Box>
              <input
                type="file"
                multiple
                hidden
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <Tooltip title="Add attachment">
                <IconButton onClick={handleAttachmentClick}>
                  <AttachmentIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Add emoji">
                <IconButton onClick={handleEmojiPickerOpen}>
                  <EmojiIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              disabled={!newComment.trim() && attachments.length === 0}
              type="submit"
            >
              {editingComment ? 'Update' : 'Send'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Comments List */}
      {comments.length === 0 ? (
        <EmptyState
          title="No Comments Yet"
          description="Be the first to leave a comment"
          icon={CommentIcon}
        />
      ) : (
        <Stack spacing={2}>
          {comments.map((comment) => (
            <Paper
              key={comment.id}
              sx={{
                p: 2,
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Avatar src={comment.user.avatar} alt={comment.user.name} />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="subtitle2">
                        {comment.user.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        {comment.edited && ' (edited)'}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, comment)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  <Typography sx={{ mt: 1 }}>
                    {comment.content}
                  </Typography>

                  {comment.attachments?.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Stack direction="row" spacing={1}>
                        {comment.attachments.map((attachment, index) => (
                          <Chip
                            key={index}
                            label={attachment.name}
                            onClick={() => window.open(attachment.url)}
                            icon={<AttachmentIcon />}
                            size="small"
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 2 }}>
                    <Button
                      size="small"
                      startIcon={<LikeIcon />}
                      onClick={() => handleLike(comment)}
                      color={comment.liked ? 'primary' : 'inherit'}
                    >
                      {comment.likes} Like{comment.likes !== 1 && 's'}
                    </Button>
                    <Button
                      size="small"
                      startIcon={<ReplyIcon />}
                      onClick={() => handleReply(comment)}
                    >
                      Reply
                    </Button>
                  </Box>

                  {/* Replies */}
                  {comment.replies?.length > 0 && (
                    <Box sx={{ ml: 4, mt: 2 }}>
                      <Stack spacing={2}>
                        {comment.replies.map((reply) => (
                          <Box
                            key={reply.id}
                            sx={{
                              display: 'flex',
                              gap: 2,
                              p: 2,
                              bgcolor: 'background.default',
                              borderRadius: 1
                            }}
                          >
                            <Avatar
                              src={reply.user.avatar}
                              alt={reply.user.name}
                              sx={{ width: 32, height: 32 }}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2">
                                {reply.user.name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                              </Typography>
                              <Typography sx={{ mt: 1 }}>
                                {reply.content}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Emoji Picker */}
      <Menu
        anchorEl={emojiPickerAnchorEl}
        open={Boolean(emojiPickerAnchorEl)}
        onClose={handleEmojiPickerClose}
      >
        <EmojiPicker onEmojiClick={handleEmojiSelect} />
      </Menu>

      {/* Comment Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEdit(selectedComment)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleReply(selectedComment)}>
          <ListItemIcon>
            <ReplyIcon fontSize="small" />
          </ListItemIcon>
          Reply
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setDeleteDialogOpen(true);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Comment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this comment? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Comments;