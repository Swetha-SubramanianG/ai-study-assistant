# AI Study Assistant Agent

A simple, modern, full-stack web application designed for college students and laboratory demonstrations. It accepts academic or programming questions and uses **Prompt Engineering** to deliver structured, beginner-friendly answers divided into four core sections: **Definition**, **Explanation**, **Example**, and **Important Points**.

---

## 📁 Project Structure

```text
ai-study-assistant/
├── frontend/
│   ├── index.html       # Clean, responsive user interface
│   ├── style.css        # Modern pure CSS (no Tailwind)
│   └── app.js           # Client-side logic, API calls, and history management
├── backend/
│   ├── server.js        # Express.js REST API server & static asset host
│   ├── agent.js         # AI Study Assistant Agent & prompt engineering logic
│   └── test.js          # Automated verification test suite
├── .env                 # Environment variables (API key & configuration)
├── .env.example         # Template for environment configuration
├── package.json         # Project metadata and dependencies
└── README.md            # Complete documentation and lab demo instructions
```

---

## 🎯 Features

1. **Intuitive Home Page**:
   - Clean title: *"AI Study Assistant"*
   - Description: *"Ask any academic question and get a simple AI-generated explanation."*
   - Large question input area with one-click sample question chips.
   - Primary "Ask AI" button.
2. **AI Study Assistant Agent**:
   - Analyzes student questions and crafts a structured prompt using tailored system instructions.
   - Interacts with real AI APIs (Google Gemini or OpenAI).
   - Generates easy-to-understand, college-appropriate explanations.
3. **Structured Response Format**:
   - 📖 **Definition**: Short, concise 1-2 sentence definition.
   - 💡 **Explanation**: Step-by-step breakdown in clear English.
   - 💻 **Example**: Relatable real-world analogy or beginner-friendly code snippet.
   - 📌 **Important Points**: Bullet points highlighting critical exam concepts.
4. **Chat History & Management**:
   - Displays all previous questions and responses on the same page.
   - Provides an expandable view for past questions.
   - Includes a **Clear Chat** button to reset the session.
5. **Loading & Error Handling**:
   - Animated indicator: `"AI is thinking..."`
   - Resilient error handling: `"Unable to generate a response. Please try again."`
6. **Pure CSS & Responsive Design**:
   - Handcrafted responsive CSS without Tailwind CSS.
   - Optimized for mobile, tablet, and desktop screens.

---

## 🛠️ Prerequisites

- **Node.js** (v18.0.0 or higher, tested on v24.x)
- **npm** (v9.0.0 or higher)
- An AI API Key:
  - **Google Gemini API Key** (Free tier available at [Google AI Studio](https://aistudio.google.com/)) **[Recommended]**, OR
  - **OpenAI API Key** (from [OpenAI Platform](https://platform.openai.com/))

---

## ⚙️ Installation & Setup

### 1. Navigate to Project Directory
```bash
cd ai-study-assistant
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure AI API Key
Open `.env` in any text editor and paste your AI API key:

```env
# AI Study Assistant Agent Configuration
AI_API_KEY=your_actual_api_key_here

# Provider: 'gemini' (default) or 'openai'
AI_PROVIDER=gemini

# Model (default: gemini-1.5-flash for Gemini, or gpt-4o-mini for OpenAI)
AI_MODEL=gemini-1.5-flash

# Port
PORT=3000

# Set to true ONLY if you want to test offline without an API key in a lab
AI_MOCK_MODE=false
```

> **Security Note:** The API key is stored only on the backend in `.env` and is **never** sent to or exposed in the browser frontend.

---

## 🚀 Running the Application

### Start the Server:
```bash
npm start
```

For live reload during development:
```bash
npm run dev
```

### Open in Browser:
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🧪 Running the Automated Test Suite

To verify all prompt engineering components and run tests with the 3 sample academic questions:

```bash
npm test
```

---

## 🧠 Prompt Engineering Technique

The core intelligence of this application is driven by **Role-Based System Prompting** and **Structural Constraint Prompting**:

### 1. System Prompt (Persona & Tone Constraints)
```text
You are an AI Study Assistant for college students.
Explain academic topics in simple English.
Understand the user's question first.
Give a short definition, step-by-step explanation, one simple example, and important points.
If the question is programming-related, provide beginner-friendly code and explain the code step by step.
Do not use unnecessarily complicated terminology.
```

### 2. Output Formatting Directives (Structural Enforcement)
The agent appends explicit output section delimiters to the prompt:
- `Definition:`
- `Explanation:`
- `Example:`
- `Important Points:`

### 3. Execution Pipeline
```
[User Question]
       │
       ▼
[Understand Question] ── Identifies question context (e.g. Programming, Science, Math)
       │
       ▼
[Build Structured Prompt] ── Combines System Prompt + Format Constraints + Question Context
       │
       ▼
[Send Prompt to AI Model via API] ── Secure server-side call using AI_API_KEY
       │
       ▼
[Receive AI Response]
       │
       ▼
[Format Response] ── Parses raw response into 4 distinct structured sections
       │
       ▼
[Display & Store] ── Renders formatted cards in UI & adds entry to Chat History
```

---

## 📋 Sample Test Questions & Expected Outputs

### Sample 1: Programming Question
**Input:**
> "What is inheritance in Java?"

**Output:**
- **Definition:** Inheritance is a mechanism in Java where one class acquires the properties and methods of another class.
- **Explanation:** A child class (subclass) can reuse the code of a parent class (superclass) using the `extends` keyword. This establishes an "is-a" relationship and avoids duplicate code.
- **Example:**
  ```java
  class Animal {
      void eat() {
          System.out.println("Eating...");
      }
  }

  class Dog extends Animal {
      // Reuses eat() method from Animal
  }
  ```
- **Important Points:**
  - Facilitates code reusability.
  - Uses the `extends` keyword in Java.
  - Single inheritance of classes is supported; multiple inheritance of classes is prohibited.

---

### Sample 2: Science Question
**Input:**
> "What is photosynthesis?"

**Output:**
- **Definition:** Photosynthesis is the biological process by which green plants synthesize their own food using sunlight, water, and carbon dioxide.
- **Explanation:**
  - Step 1: Green pigment (chlorophyll) inside plant leaves absorbs radiant energy from sunlight.
  - Step 2: Plant roots draw water from the soil, while microscopic leaf pores take in carbon dioxide from the air.
  - Step 3: Solar energy triggers a chemical transformation that creates glucose (plant sugar) and expels oxygen as a byproduct.
- **Example:** Think of a plant leaf like a kitchen that uses solar power: sunlight is the stove heat, carbon dioxide and water are the ingredients, and glucose is the prepared meal.
- **Important Points:**
  - Primarily takes place within cell organelles called chloroplasts.
  - Produces oxygen vital for living organisms on Earth.
  - Overall chemical equation: $6CO_2 + 6H_2O + \text{light energy} \rightarrow C_6H_{12}O_6 + 6O_2$.

---

### Sample 3: Data Structures Question
**Input:**
> "What is a stack data structure?"

**Output:**
- **Definition:** A stack is a linear data structure that operates according to the Last-In, First-Out (LIFO) principle.
- **Explanation:** In a stack, addition and removal of elements can only take place at a single end, commonly called the "top". The last item inserted is always the first item removed.
- **Example:** A stack of dinner trays in a cafeteria—clean trays are placed on top, and patrons remove trays from the top.
- **Important Points:**
  - `push()` inserts an item onto the top of the stack.
  - `pop()` removes and returns the topmost item.
  - `peek()` inspects the top element without removing it.
  - Common use cases include browser history navigation, recursion call stacks, and expression evaluation.
