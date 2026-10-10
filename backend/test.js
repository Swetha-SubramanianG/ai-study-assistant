/**
 * Automated Test Suite for AI Study Assistant Agent
 * 
 * Verifies:
 * 1. Agent Question Understanding
 * 2. Structured Prompt Generation
 * 3. Section Parsing (Definition, Explanation, Example, Important Points)
 * 4. Execution of 3 Sample Academic Questions:
 *    - Question 1: "What is inheritance in Java?"
 *    - Question 2: "What is photosynthesis?"
 *    - Question 3: "What is a stack data structure?"
 * 5. Error Handling for empty or invalid input
 */

const {
  understandQuestion,
  buildStructuredPrompt,
  formatResponse,
  processStudentQuestion,
  SYSTEM_PROMPT
} = require('./agent');

// Temporarily enable mock mode for reliable local deterministic testing without requiring live external internet API credits
process.env.AI_MOCK_MODE = 'true';

async function runTests() {
  console.log('========================================================');
  console.log('🧪 Starting AI Study Assistant Agent Test Suite');
  console.log('========================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      process.exitCode = 1;
    }
  }

  // -------------------------------------------------------------
  // Test 1: understandQuestion
  // -------------------------------------------------------------
  console.log('--- Test Suite 1: Understanding Question ---');
  const q1Analysis = understandQuestion('What is inheritance in Java?');
  assert(q1Analysis.isProgramming === true, 'Correctly identified programming context for Java');
  assert(q1Analysis.category.includes('Programming'), 'Category includes Programming');

  const q2Analysis = understandQuestion('What is photosynthesis?');
  assert(q2Analysis.category === 'Science', 'Correctly identified Science context');

  // -------------------------------------------------------------
  // Test 2: buildStructuredPrompt
  // -------------------------------------------------------------
  console.log('\n--- Test Suite 2: Prompt Engineering & Construction ---');
  const promptData = buildStructuredPrompt(q1Analysis);
  assert(promptData.systemPrompt === SYSTEM_PROMPT, 'Structured prompt contains exact system prompt');
  assert(promptData.userPrompt.includes('Definition:'), 'Prompt enforces Definition section');
  assert(promptData.userPrompt.includes('Explanation:'), 'Prompt enforces Explanation section');
  assert(promptData.userPrompt.includes('Example:'), 'Prompt enforces Example section');
  assert(promptData.userPrompt.includes('Important Points:'), 'Prompt enforces Important Points section');

  // -------------------------------------------------------------
  // Test 3: formatResponse parser
  // -------------------------------------------------------------
  console.log('\n--- Test Suite 3: Section Parser ---');
  const sampleRaw = `Definition:
A stack is a linear data structure following LIFO order.

Explanation:
Elements are added and removed from the same end called top.

Example:
A stack of dinner plates where you add and take the top plate.

Important Points:
- Push adds an element.
- Pop removes an element.
- Follows Last In First Out (LIFO).`;

  const parsed = formatResponse(sampleRaw);
  assert(parsed.definition.length > 0, 'Extracted Definition section');
  assert(parsed.explanation.length > 0, 'Extracted Explanation section');
  assert(parsed.example.length > 0, 'Extracted Example section');
  assert(parsed.importantPoints.length > 0, 'Extracted Important Points section');

  // -------------------------------------------------------------
  // Test 4: End-to-End Test with 3 Sample Questions
  // -------------------------------------------------------------
  console.log('\n--- Test Suite 4: End-to-End 3 Sample Questions ---');

  const sampleQuestions = [
    'What is inheritance in Java?',
    'What is photosynthesis?',
    'What is a stack data structure?'
  ];

  for (let i = 0; i < sampleQuestions.length; i++) {
    const q = sampleQuestions[i];
    console.log(`\nTesting Sample Question ${i + 1}: "${q}"`);
    const result = await processStudentQuestion(q);

    assert(result.question === q, `Returned matched question text`);
    assert(Boolean(result.sections.definition), `Generated Definition for sample ${i + 1}`);
    assert(Boolean(result.sections.explanation), `Generated Explanation for sample ${i + 1}`);
    assert(Boolean(result.sections.example), `Generated Example for sample ${i + 1}`);
    assert(Boolean(result.sections.importantPoints), `Generated Important Points for sample ${i + 1}`);

    console.log(`\nSample Output Preview [${i + 1}]:`);
    console.log(`📖 Definition: ${result.sections.definition.split('\n')[0]}`);
    console.log(`💡 Explanation: ${result.sections.explanation.split('\n')[0]}`);
    console.log(`💻 Example: ${result.sections.example.split('\n')[0]}`);
    console.log(`📌 Important Points: ${result.sections.importantPoints.split('\n')[0]}`);
  }

  // -------------------------------------------------------------
  // Test 5: Error Handling
  // -------------------------------------------------------------
  console.log('\n--- Test Suite 5: Error Handling ---');
  try {
    understandQuestion('');
    assert(false, 'Should have thrown error on empty question');
  } catch (err) {
    assert(err.message === 'Question cannot be empty', 'Threw appropriate error for empty input');
  }

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log('\n========================================================');
  console.log(`Test Results: ${passedTests}/${totalTests} tests passed`);
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed successfully!');
  } else {
    console.log('⚠️ Some tests failed.');
  }
  console.log('========================================================\n');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
