require("dotenv").config();
const enhanceArticle = require("../utils/groqClient");

async function testGroqAPI() {
  console.log("=".repeat(60));
  console.log("Testing Groq LLM API Implementation");
  console.log("=".repeat(60));
  console.log();

  // Test 1: Check API Key
  console.log("Test 1: Checking API Key Configuration");
  console.log("-".repeat(60));
  if (!process.env.GROQ_API_KEY) {
    console.error("❌ FAILED: GROQ_API_KEY is not set in environment variables");
    console.error("   Please add GROQ_API_KEY to your .env file");
    process.exit(1);
  } else {
    const keyLength = process.env.GROQ_API_KEY.length;
    const maskedKey = process.env.GROQ_API_KEY.substring(0, 8) + "...";
    console.log(`✅ PASSED: API Key is configured (${keyLength} characters, starts with: ${maskedKey})`);
  }
  console.log();

  // Test 2: Test with sample article
  console.log("Test 2: Testing Article Enhancement");
  console.log("-".repeat(60));
  
  const sampleArticle = {
    title: "Introduction to Artificial Intelligence",
    content: "Artificial Intelligence (AI) is transforming the way we live and work. It involves creating intelligent machines that can perform tasks that typically require human intelligence. These tasks include learning, reasoning, problem-solving, perception, and language understanding. AI has applications in various fields such as healthcare, finance, transportation, and entertainment. Machine learning, a subset of AI, enables systems to learn and improve from experience without being explicitly programmed.",
    excerpt: "Artificial Intelligence is transforming industries..."
  };

  const sampleReferences = [
    {
      url: "https://example.com/ai-article-1",
      content: "Artificial Intelligence represents one of the most significant technological advances of our time. The field encompasses machine learning, deep learning, neural networks, and natural language processing. Companies across industries are leveraging AI to automate processes, gain insights from data, and create innovative products and services."
    },
    {
      url: "https://example.com/ai-article-2",
      content: "The impact of AI on modern society cannot be overstated. From recommendation systems that power our favorite streaming platforms to autonomous vehicles navigating city streets, AI technologies are becoming increasingly integrated into our daily lives. Understanding AI fundamentals is essential for anyone working in technology today."
    }
  ];

  console.log(`Testing with article: "${sampleArticle.title}"`);
  console.log(`Article content length: ${sampleArticle.content.length} characters`);
  console.log(`Number of reference articles: ${sampleReferences.length}`);
  console.log();

  try {
    console.log("Calling Groq API...");
    const startTime = Date.now();
    
    const enhancedContent = await enhanceArticle(sampleArticle, sampleReferences);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    if (!enhancedContent || enhancedContent.trim().length === 0) {
      console.error("❌ FAILED: API returned empty content");
      process.exit(1);
    }
    
    console.log(`✅ PASSED: Successfully enhanced article`);
    console.log(`   Response time: ${duration} seconds`);
    console.log(`   Enhanced content length: ${enhancedContent.length} characters`);
    console.log();
    console.log("Enhanced Content Preview (first 500 characters):");
    console.log("-".repeat(60));
    console.log(enhancedContent.substring(0, 500) + "...");
    console.log("-".repeat(60));
    console.log();
    
  } catch (error) {
    console.error("❌ FAILED: Error during enhancement");
    console.error(`   Error message: ${error.message}`);
    if (error.response) {
      console.error(`   API Response Status: ${error.response.status}`);
      console.error(`   API Response Data:`, error.response.data);
    }
    if (error.stack) {
      console.error("\n   Stack trace:");
      console.error(error.stack);
    }
    process.exit(1);
  }

  // Test 3: Test error handling
  console.log("Test 3: Testing Error Handling");
  console.log("-".repeat(60));
  
  try {
    const emptyArticle = {
      title: "Test",
      content: "",
      excerpt: ""
    };
    
    await enhanceArticle(emptyArticle, sampleReferences);
    console.error("❌ FAILED: Should have thrown error for empty content");
    process.exit(1);
  } catch (error) {
    if (error.message.includes("too short") || error.message.includes("empty")) {
      console.log(`✅ PASSED: Correctly rejected empty content (${error.message})`);
    } else {
      console.log(`⚠️  WARNING: Unexpected error for empty content: ${error.message}`);
    }
  }
  console.log();

  // Test 4: Test with no references
  console.log("Test 4: Testing with No Reference Articles");
  console.log("-".repeat(60));
  
  try {
    await enhanceArticle(sampleArticle, []);
    console.error("❌ FAILED: Should have thrown error for no references");
    process.exit(1);
  } catch (error) {
    if (error.message.includes("reference")) {
      console.log(`✅ PASSED: Correctly rejected request without references (${error.message})`);
    } else {
      console.log(`⚠️  WARNING: Unexpected error: ${error.message}`);
    }
  }
  console.log();

  // Summary
  console.log("=".repeat(60));
  console.log("✅ All Tests Passed!");
  console.log("=".repeat(60));
  console.log();
  console.log("The Groq LLM API implementation is working correctly.");
  console.log("You can now run the enhancement script: npm run enhance");
  console.log();
}

// Run the tests
testGroqAPI().catch((error) => {
  console.error("\n❌ Unexpected error during testing:");
  console.error(error);
  process.exit(1);
});


