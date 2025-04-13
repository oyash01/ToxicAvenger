const Comment = require('../models/Comment');
const groqHelper = require('../utils/groqHelper');
const logger = require('../utils/logger');

exports.analyzeComment = async (req, res) => {
  try {
    const { text, author, postId } = req.body;

    // Analyze comment using Groq
    const analysis = await groqHelper.classifyComment(text, author);

    const comment = await Comment.create({
      text,
      author,
      userId: req.user._id,
      postId,
      toxicityAnalysis: {
        isToxic: !analysis.STATUS,
        analyzedAt: new Date()
      }
    });

    return res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    logger.error(`Comment analysis error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error analyzing comment'
    });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { postId, status } = req.query;
    const query = { userId: req.user._id };
    
    if (postId) query.postId = postId;
    if (status) query.status = status;

    const comments = await Comment.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      data: comments
    });
  } catch (error) {
    logger.error(`Get comments error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving comments'
    });
  }
};

exports.updateCommentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, override } = req.body;

    const comment = await Comment.findById(id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment'
      });
    }

    comment.status = status;
    
    if (override) {
      comment.toxicityAnalysis.overriddenBy = req.user._id;
      comment.toxicityAnalysis.overriddenAt = new Date();
      comment.toxicityAnalysis.isToxic = !comment.toxicityAnalysis.isToxic;
    }

    await comment.save();

    return res.status(200).json({
      success: true,
      data: comment
    });
  } catch (error) {
    logger.error(`Update comment status error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error updating comment status'
    });
  }
};