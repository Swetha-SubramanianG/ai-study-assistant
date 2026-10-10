/**
 * AI Study Assistant Agent
 * 
 * Workflow:
 * 1. Understand Question: Validate input and determine topic context
 * 2. Build Structured Prompt: Incorporate system instructions and structure directives
 * 3. Send Prompt to AI Model: Call external AI model via API (Gemini or OpenAI)
 * 4. Receive AI Response: Capture generated text
 * 5. Format Response: Parse into Definition, Explanation, Example, and Important Points
 */

// Core System Prompt as specified in the project requirements
const SYSTEM_PROMPT = `You are an AI Study Assistant for college students.
Explain academic topics in simple English.
Understand the user's question first.
Give a short definition, step-by-step explanation, one simple example, and important points.
If the question is programming-related, provide beginner-friendly code and explain the code step by step.
Do not use unnecessarily complicated terminology.`;

// Formatting instructions appended to guarantee consistent structure across models
const FORMAT_INSTRUCTIONS = `
Please format your response strictly using the following four section headings:

Definition:
<A concise, simple 1-2 sentence definition of the concept in plain English>

Explanation:
<Step-by-step explanation broken down into simple, easy-to-understand points>

Example:
<One clear real-world example or beginner-friendly code snippet with step-by-step code explanation>

Important Points:
<Concise bullet points highlighting key takeaways for students>
`;

/**
 * Step 1: Understand Question
 * Validates the question and extracts metadata
 * @param {string} question 
 * @returns {object} Analysis result
 */
function understandQuestion(question) {
  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    throw new Error('Question cannot be empty');
  }

  const cleanQuestion = question.trim();
  const lower = cleanQuestion.toLowerCase();

  // Basic classification to give the agent semantic context
  const isProgramming = /(code|program|java|python|c\+\+|javascript|html|css|sql|function|class|array|loop|variable|oop|pointer|recursion|stack|queue)/i.test(lower);
  const isScience = /(photosynthesis|cell|newton|gravity|energy|atom|reaction|physics|chemistry|biology)/i.test(lower);
  const isMath = /(calculus|matrix|derivative|integral|algebra|equation|probability|theorem)/i.test(lower);

  let category = 'General Academic';
  if (isProgramming) category = 'Computer Science / Programming';
  else if (isScience) category = 'Science';
  else if (isMath) category = 'Mathematics';

  return {
    originalQuestion: cleanQuestion,
    category,
    isProgramming
  };
}

/**
 * Step 2: Build Structured Prompt
 * Applies prompt engineering rules to guide the model towards simple, structured answers
 * @param {object} analysis Analysis from understandQuestion
 * @returns {object} { systemPrompt, userPrompt }
 */
function buildStructuredPrompt(analysis) {
  const userPrompt = `Student Question: "${analysis.originalQuestion}"
Subject Context: ${analysis.category}

Please answer the student's question adhering strictly to your role and format:
${FORMAT_INSTRUCTIONS}
`;

  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: userPrompt
  };
}

/**
 * Step 3 & 4: Send Prompt to AI Model & Receive AI Response
 * Connects to external AI model API (Google Gemini or OpenAI) using environment variables
 * @param {string} systemPrompt 
 * @param {string} userPrompt 
 * @returns {Promise<string>} Raw text response from AI model
 */
async function callAIModel(systemPrompt, userPrompt) {
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
  const mockMode = process.env.AI_MOCK_MODE === 'true';

  // Check if mock mode is explicitly enabled for offline testing/demos
  if (mockMode || apiKey === 'mock_key_for_testing') {
    return generateMockResponse(userPrompt);
  }

  if (!apiKey || apiKey === 'your_api_key_here') {
    console.error('[AI Agent Error] No valid AI_API_KEY found in environment variables.');
    throw new Error('AI_API_KEY is not configured. Please set AI_API_KEY in your .env file.');
  }

  // Detect provider: Gemini or OpenAI
  const provider = (process.env.AI_PROVIDER || '').toLowerCase();
  const isOpenAI = provider === 'openai' || apiKey.startsWith('sk-');

  if (isOpenAI) {
    return await callOpenAI(apiKey, systemPrompt, userPrompt);
  } else {
    return await callGemini(apiKey, systemPrompt, userPrompt);
  }
}

/**
 * Calls Google Gemini API
 */
async function callGemini(apiKey, systemPrompt, userPrompt) {
  const model = process.env.AI_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const payload = {
    system_instruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }]
      }
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1200
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error(`[Gemini API Error] HTTP ${response.status}:`, errorData);
    throw new Error(`Gemini API returned status ${response.status}`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Empty response received from Gemini API');
  }

  return text;
}

/**
 * Calls OpenAI API (or any OpenAI-compatible API)
 */
async function callOpenAI(apiKey, systemPrompt, userPrompt) {
  const model = process.env.AI_MODEL || 'gpt-4o-mini';
  const baseUrl = process.env.AI_BASE_URL || 'https://api.openai.com/v1';

  const payload = {
    model: model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.4,
    max_tokens: 1200
  };

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error(`[OpenAI API Error] HTTP ${response.status}:`, errorData);
    throw new Error(`OpenAI API returned status ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error('Empty response received from OpenAI API');
  }

  return text;
}

/**
 * Step 5: Format Response
 * Parses the raw AI response into structured sections:
 * - Definition
 * - Explanation
 * - Example
 * - Important Points
 * @param {string} rawText 
 * @returns {object} Formatted response object
 */
function formatResponse(rawText) {
  const sections = {
    definition: '',
    explanation: '',
    example: '',
    importantPoints: '',
    raw: rawText
  };

  if (!rawText) return sections;

  // Flexible regular expressions to capture sections regardless of markdown symbols (#, **, etc.)
  const regex = /(?:^|\n)(?:#{1,4}\s*|\*{1,2}\s*)?(Definition|Explanation|Example|Important Points)[:\s*\n]/gi;
  const matches = [];
  let match;

  while ((match = regex.exec(rawText)) !== null) {
    matches.push({
      header: match[1].toLowerCase(),
      index: match.index + match[0].length
    });
  }

  if (matches.length >= 2) {
    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const nextIndex = i + 1 < matches.length ? matches[i + 1].index - matches[i + 1].header.length - 4 : rawText.length;
      let content = rawText.slice(current.index, nextIndex).trim();

      if (current.header.includes('definition')) {
        sections.definition = content;
      } else if (current.header.includes('explanation')) {
        sections.explanation = content;
      } else if (current.header.includes('example')) {
        sections.example = content;
      } else if (current.header.includes('important')) {
        sections.importantPoints = content;
      }
    }
  } else {
    // If sections were not explicitly demarcated, provide the entire text under explanation
    sections.explanation = rawText;
  }

  return sections;
}

/**
 * Generates an educational mock response for offline / lab testing when MOCK_AI=true
 */
function generateMockResponse(userPrompt) {
  const isJavaInheritance = /inheritance/i.test(userPrompt);
  const isPhotosynthesis = /photosynthesis/i.test(userPrompt);

  if (isJavaInheritance) {
    return `Definition:
Inheritance is a feature in Java where one class can acquire properties and methods from another class.

Explanation:
A child class can reuse the features of a parent class using the extends keyword. This eliminates duplicate code and creates an "is-a" relationship between classes.

Example:
\`\`\`java
class Animal {
    void eat() {
        System.out.println("Eating");
    }
}

class Dog extends Animal {
    // Reuses eat() method from Animal
}
\`\`\`

Important Points:
- It supports code reusability.
- The extends keyword is used to inherit.
- Dog is the child class and Animal is the parent class.
- Multiple inheritance of classes is not supported in Java to avoid ambiguity.`;
  }

  if (isPhotosynthesis) {
    return `Definition:
Photosynthesis is the biological process by which green plants make their own food using sunlight, carbon dioxide, and water.

Explanation:
Step 1: Chlorophyll in plant leaves absorbs energy from sunlight.
Step 2: Roots absorb water from the soil, and leaves take in carbon dioxide from the air.
Step 3: Sunlight converts these into glucose (sugar) for plant food and releases oxygen into the air.

Example:
Think of a solar-powered kitchen in a plant leaf: the sun provides energy, water and carbon dioxide are the raw ingredients, and the meal prepared is glucose with oxygen given off as a healthy byproduct.

Important Points:
- It occurs primarily inside plant organelles called chloroplasts.
- It produces oxygen which is essential for aerobic life on Earth.
- The chemical equation is: 6CO2 + 6H2O + light energy -> C6H12O6 + 6O2.`;
  }

  return `Definition:
This academic topic involves fundamental principles studied in college coursework.

Explanation:
Step 1: The concept begins with core definitions and basic assumptions.
Step 2: Real-world applications connect theoretical principles to observable phenomena.
Step 3: Systematic methods are applied to solve problems and analyze outcomes.

Example:
A classic example demonstrates how the fundamental rules apply in a controlled scenario, making complex mechanisms straightforward to observe.

Important Points:
- Clear fundamentals are key to mastering advanced concepts.
- Always review definitions and practical examples before exams.
- Break down complex problems into smaller, manageable steps.`;
}

/**
 * Main Agent Entrypoint: Executes the complete agent workflow
 * @param {string} question The student's input question
 * @returns {Promise<object>} Complete processed response
 */
async function processStudentQuestion(question) {
  // Step 1: Understand Question
  const analysis = understandQuestion(question);

  // Step 2: Build Structured Prompt
  const { systemPrompt, userPrompt } = buildStructuredPrompt(analysis);

  // Step 3 & 4: Send Prompt to AI Model & Receive AI Response
  const rawResponse = await callAIModel(systemPrompt, userPrompt);

  // Step 5: Format Response
  const formattedSections = formatResponse(rawResponse);

  return {
    question: analysis.originalQuestion,
    category: analysis.category,
    sections: formattedSections,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  processStudentQuestion,
  understandQuestion,
  buildStructuredPrompt,
  callAIModel,
  formatResponse,
  SYSTEM_PROMPT,
  FORMAT_INSTRUCTIONS
};
