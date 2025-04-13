const { Groq } = require("groq-sdk");
const ApiKey = require('../models/ApiKey');
const logger = require('./logger');

class GroqHelper {
  constructor() {
    this.groq = new Groq();
  }

  async getActiveApiKey() {
    const activeKeys = await ApiKey.find({ isActive: true })
      .sort({ failureCount: 1, lastUsed: 1 });
    
    if (!activeKeys.length) {
      throw new Error('No active API keys available');
    }
    
    return activeKeys[0];
  }

  async classifyComment(commentText, authorUsername) {
    let currentKey;
    try {
      currentKey = await this.getActiveApiKey();
      this.groq.apiKey = currentKey.keyHash;

      const messages = [
        {
          role: "system",
          content: `You are an assistant that checks if a given comment is toxic or not. You ONLY reply in JSON format like this: {"STATUS": boolean_value, "Author": "${authorUsername}"} if it's okay to post. Base the result on the INTENT of the message. Do not add any other text outside the JSON structure.`
        },
        {
          role: "user",
          content: commentText
        }
      ];

      const completion = await this.groq.chat.completions.create({
        messages,
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 100
      });

      // Update last used timestamp
      await ApiKey.findByIdAndUpdate(currentKey._id, {
        lastUsed: new Date(),
        failureCount: 0
      });

      return JSON.parse(completion.choices[0].message.content);

    } catch (error) {
      logger.error(`Groq API error: ${error.message}`);
      
      if (currentKey) {
        // Increment failure count
        await ApiKey.findByIdAndUpdate(currentKey._id, {
          $inc: { failureCount: 1 }
        });

        // Deactivate key if too many failures
        if (currentKey.failureCount >= 5) {
          await ApiKey.findByIdAndUpdate(currentKey._id, {
            isActive: false
          });
        }
      }

      throw error;
    }
  }
}

module.exports = new GroqHelper();