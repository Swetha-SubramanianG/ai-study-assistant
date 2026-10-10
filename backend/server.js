/**
 * Express Server for AI Study Assistant Agent
 * 
 * Features:
 * - Loads environment variables from .env
 * - Serves frontend static assets (HTML, CSS, JS)
 * - API route to invoke the AI Study Assistant Agent
 * - In-memory chat history management (list & clear)
 * - Robust error handling
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from project root .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { processStudentQuestion } = require('./agent');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from the frontend directory
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// In-memory chat history store
let chatHistory = [];

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.AI_API_KEY && process.env.AI_API_KEY !== 'your_api_key_here');
  res.json({
    status: 'online',
    service: 'AI Study Assistant Agent',
    apiKeyConfigured: hasKey,
    provider: process.env.AI_PROVIDER || (hasKey && process.env.AI_API_KEY.startsWith('sk-') ? 'openai' : 'gemini'),
    historyCount: chatHistory.length
  });
});

/**
 * POST /api/study-agent
 * Accepts user's question, runs through prompt engineering workflow,
 * calls the AI model, stores the result in chat history, and returns it.
 */
app.post('/api/study-agent', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid academic question.'
      });
    }

    console.log(`[Agent Workflow] Received question: "${question.trim()}"`);

    // Execute the agent workflow
    const result = await processStudentQuestion(question);

    // Create a history item with unique id
    const historyItem = {
      id: Date.now().toString(),
      ...result
    };

    // Store in history
    chatHistory.push(historyItem);

    console.log(`[Agent Workflow] Successfully generated structured answer for: "${question.trim()}"`);

    return res.status(200).json({
      success: true,
      data: historyItem
    });
  } catch (error) {
    console.error('[Agent Workflow Error]:', error.message);

    // Standard error message as required: "Unable to generate a response. Please try again."
    return res.status(500).json({
      success: false,
      error: 'Unable to generate a response. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/history
 * Returns the current chat history
 */
app.get('/api/history', (req, res) => {
  res.json({
    success: true,
    history: chatHistory
  });
});

/**
 * DELETE /api/history
 * Clears the chat history
 */
app.delete('/api/history', (req, res) => {
  chatHistory = [];
  res.json({
    success: true,
    message: 'Chat history cleared successfully'
  });
});

// Fallback for SPA/direct navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Start listening
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  AI Study Assistant Agent is running!`);
  console.log(`  Local URL: http://localhost:${PORT}`);
  console.log(`  API Key Configured: ${Boolean(process.env.AI_API_KEY && process.env.AI_API_KEY !== 'your_api_key_here')}`);
  console.log(`=======================================================`);
});
