/**
 * AI Study Assistant Agent - Frontend Client Script
 * 
 * Manages user interactions:
 * - Submitting questions to the backend agent API
 * - Managing loading state ("AI is thinking...")
 * - Handling errors ("Unable to generate a response. Please try again.")
 * - Rendering structured responses (Definition, Explanation, Example, Important Points)
 * - Displaying and clearing chat history
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const questionForm = document.getElementById('questionForm');
  const questionInput = document.getElementById('questionInput');
  const askButton = document.getElementById('askButton');
  const clearInputBtn = document.getElementById('clearInputBtn');

  // Status Indicators
  const loadingIndicator = document.getElementById('loadingIndicator');
  const errorMessage = document.getElementById('errorMessage');
  const errorDetail = document.getElementById('errorDetail');
  const dismissErrorBtn = document.getElementById('dismissErrorBtn');
  const statusText = document.getElementById('statusText');

  // Response Section
  const latestResponseSection = document.getElementById('latestResponseSection');
  const responseQuestionTitle = document.getElementById('responseQuestionTitle');
  const responseCategoryBadge = document.getElementById('responseCategoryBadge');
  const definitionContent = document.getElementById('definitionContent');
  const explanationContent = document.getElementById('explanationContent');
  const exampleContent = document.getElementById('exampleContent');
  const pointsContent = document.getElementById('pointsContent');

  // Chat History
  const historyContainer = document.getElementById('historyContainer');
  const emptyHistoryNotice = document.getElementById('emptyHistoryNotice');
  const clearChatBtn = document.getElementById('clearChatBtn');

  // Quick Chips
  const chipButtons = document.querySelectorAll('.chip-btn');

  // -------------------------------------------------------------
  // Initialization
  // -------------------------------------------------------------
  checkBackendHealth();
  fetchChatHistory();

  // -------------------------------------------------------------
  // Event Listeners
  // -------------------------------------------------------------

  // Question Submission
  questionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const question = questionInput.value.trim();
    if (!question) return;

    await submitQuestion(question);
  });

  // Clear Input Button
  clearInputBtn.addEventListener('click', () => {
    questionInput.value = '';
    questionInput.focus();
  });

  // Dismiss Error Message
  dismissErrorBtn.addEventListener('click', () => {
    errorMessage.classList.add('hidden');
  });

  // Clear Chat History Button
  clearChatBtn.addEventListener('click', async () => {
    await clearChatHistory();
  });

  // Sample Question Chips
  chipButtons.forEach((chip) => {
    chip.addEventListener('click', () => {
      const sampleQuestion = chip.getAttribute('data-question');
      questionInput.value = sampleQuestion;
      questionInput.focus();
    });
  });

  // -------------------------------------------------------------
  // Core Functions
  // -------------------------------------------------------------

  /**
   * Submits student question to the backend agent
   * Workflow:
   * 1. Display loading state: "AI is thinking..."
   * 2. Send question to backend API
   * 3. Handle response or error
   * 4. Update UI & History
   */
  async function submitQuestion(question) {
    // Set UI to loading state
    setLoadingState(true);
    hideError();

    try {
      const response = await fetch('/api/study-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        // AI request failed
        throw new Error(result.error || 'Unable to generate a response. Please try again.');
      }

      // Display the structured response
      displayResponse(result.data);

      // Refresh chat history
      await fetchChatHistory();

    } catch (err) {
      console.error('Submission error:', err);
      // Display standard error message as required
      showError('Unable to generate a response. Please try again.', err.message);
    } finally {
      setLoadingState(false);
    }
  }

  /**
   * Sets UI loading state ("AI is thinking...")
   */
  function setLoadingState(isLoading) {
    if (isLoading) {
      loadingIndicator.classList.remove('hidden');
      askButton.disabled = true;
      askButton.innerHTML = '<span class="btn-icon">⏳</span> Thinking...';
    } else {
      loadingIndicator.classList.add('hidden');
      askButton.disabled = false;
      askButton.innerHTML = '<span class="btn-icon">⚡</span> Ask AI';
    }
  }

  /**
   * Shows error banner
   */
  function showError(message, detail = '') {
    errorMessage.classList.remove('hidden');
    // If backend provided details in development, show as helper note
    if (detail && detail !== message) {
      errorDetail.textContent = `Note: ${detail}`;
    } else {
      errorDetail.textContent = '';
    }
  }

  /**
   * Hides error banner
   */
  function hideError() {
    errorMessage.classList.add('hidden');
    errorDetail.textContent = '';
  }

  /**
   * Renders the structured response in the main response card
   */
  function displayResponse(data) {
    const { question, category, sections } = data;

    responseQuestionTitle.textContent = question;
    responseCategoryBadge.textContent = category || 'Academic Topic';

    // 1. Definition
    definitionContent.innerHTML = formatMarkdownText(sections.definition || 'Definition provided in explanation.');

    // 2. Explanation
    explanationContent.innerHTML = formatMarkdownText(sections.explanation || 'Refer to full explanation.');

    // 3. Example
    exampleContent.innerHTML = formatMarkdownText(sections.example || 'Example provided above.');

    // 4. Important Points
    pointsContent.innerHTML = formatPointsText(sections.importantPoints || 'Review definition and explanation.');

    // Reveal response section smoothly
    latestResponseSection.classList.remove('hidden');
    latestResponseSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Fetches full chat history from backend
   */
  async function fetchChatHistory() {
    try {
      const response = await fetch('/api/history');
      const data = await response.json();

      if (data.success && Array.isArray(data.history)) {
        renderHistoryList(data.history);
      }
    } catch (err) {
      console.warn('Could not fetch chat history:', err);
    }
  }

  /**
   * Clears chat history via backend API
   */
  async function clearChatHistory() {
    try {
      const response = await fetch('/api/history', { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        renderHistoryList([]);
      }
    } catch (err) {
      console.error('Error clearing chat history:', err);
    }
  }

  /**
   * Renders the list of previous Q&A pairs
   */
  function renderHistoryList(history) {
    if (!history || history.length === 0) {
      emptyHistoryNotice.classList.remove('hidden');
      historyContainer.innerHTML = '';
      historyContainer.appendChild(emptyHistoryNotice);
      return;
    }

    emptyHistoryNotice.classList.add('hidden');
    historyContainer.innerHTML = '';

    // Render items in reverse chronological order (newest on top)
    const reversed = [...history].reverse();

    reversed.forEach((item, index) => {
      const historyCard = document.createElement('div');
      historyCard.className = 'history-item';

      const timeStr = item.timestamp 
        ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        : '';

      historyCard.innerHTML = `
        <div class="history-item-header" onclick="this.nextElementSibling.classList.toggle('hidden')">
          <span class="history-item-title">
            <span>❓</span> ${escapeHtml(item.question)}
          </span>
          <span class="history-item-meta">
            <span class="badge badge-accent">${escapeHtml(item.category || 'Study Q&A')}</span>
            <span>${timeStr}</span>
            <span>▼</span>
          </span>
        </div>
        <div class="history-item-body ${index === 0 ? '' : 'hidden'}">
          <div class="response-box section-definition">
            <div class="box-heading"><span>📖</span> <strong>Definition</strong></div>
            <div>${formatMarkdownText(item.sections?.definition || '')}</div>
          </div>
          <div class="response-box section-explanation">
            <div class="box-heading"><span>💡</span> <strong>Explanation</strong></div>
            <div>${formatMarkdownText(item.sections?.explanation || '')}</div>
          </div>
          <div class="response-box section-example">
            <div class="box-heading"><span>💻</span> <strong>Example</strong></div>
            <div>${formatMarkdownText(item.sections?.example || '')}</div>
          </div>
          <div class="response-box section-points">
            <div class="box-heading"><span>📌</span> <strong>Important Points</strong></div>
            <div>${formatPointsText(item.sections?.importantPoints || '')}</div>
          </div>
        </div>
      `;

      historyContainer.appendChild(historyCard);
    });
  }

  /**
   * Checks backend status and displays connection health
   */
  async function checkBackendHealth() {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      if (data.status === 'online') {
        statusText.textContent = data.apiKeyConfigured 
          ? `Agent Ready (${data.provider})` 
          : 'Agent Ready (Set AI_API_KEY)';
      }
    } catch {
      statusText.textContent = 'Server Offline';
    }
  }

  // -------------------------------------------------------------
  // Formatting Helpers
  // -------------------------------------------------------------

  /**
   * Helper to format markdown code blocks, backticks, and bold text
   */
  function formatMarkdownText(text) {
    if (!text) return '<p class="text-muted">None provided.</p>';

    let formatted = escapeHtml(text);

    // Code blocks ```lang\ncode\n```
    formatted = formatted.replace(/```(?:[a-zA-Z0-9]+)?\n([\s\S]*?)```/g, (match, code) => {
      return `<pre><code>${code.trim()}</code></pre>`;
    });

    // Inline code `code`
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold text **text**
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Convert line breaks into paragraphs or <br>
    const paragraphs = formatted.split(/\n\n+/);
    return paragraphs.map(p => {
      if (p.startsWith('<pre>')) return p;
      return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    }).join('');
  }

  /**
   * Formats bullet points into a clean HTML unordered list
   */
  function formatPointsText(text) {
    if (!text) return '<p class="text-muted">None provided.</p>';

    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const listItems = [];

    lines.forEach(line => {
      // Remove leading dash, asterisk, or number bullet
      const cleaned = line.replace(/^[\s*•\-\d.]+\s*/, '').trim();
      if (cleaned) {
        listItems.push(`<li>${formatMarkdownText(cleaned)}</li>`);
      }
    });

    if (listItems.length > 0) {
      return `<ul class="points-list">${listItems.join('')}</ul>`;
    }

    return formatMarkdownText(text);
  }

  /**
   * HTML escape utility to avoid XSS
   */
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
