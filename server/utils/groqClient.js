const Groq = require("groq-sdk");

if (!process.env.GROQ_API_KEY) {
  console.error("ERROR: GROQ_API_KEY is not set in environment variables!");
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function enhanceArticle(originalArticle, referenceArticles) {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured in environment variables");
    }

    const articleContent = originalArticle.content || originalArticle.excerpt || "";
    if (!articleContent || articleContent.trim().length < 50) {
      throw new Error("Article content is too short or empty to enhance");
    }

    let prompt;
    
    if (referenceArticles && referenceArticles.length > 0) {
      const referenceTexts = referenceArticles
        .map((ref, idx) => `Reference Article ${idx + 1}:\n${ref.content || ref}`)
        .join("\n\n---\n\n");
      
      prompt = `You are an expert content writer. Your task is to enhance and rewrite the following article to match the style, formatting, and quality of the reference articles provided.

Original Article:
Title: ${originalArticle.title}
Content: ${articleContent}

Reference Articles (for style and formatting reference):
${referenceTexts}

Please rewrite the article to:
1. Match the writing style and tone of the reference articles
2. Improve the formatting and structure
3. Enhance the content quality while maintaining the original message
4. Make it more engaging and professional
5. Ensure proper paragraph breaks and readability

Return only the enhanced article content, without any additional commentary or explanations.`;
    } else {
      prompt = `You are an expert content writer. Your task is to enhance and rewrite the following article to make it more engaging, professional, and well-structured.

Original Article:
Title: ${originalArticle.title}
Content: ${articleContent}

Please rewrite the article to:
1. Improve the writing style and tone to be more engaging and professional
2. Enhance the formatting and structure with proper headings and paragraphs
3. Expand on key points while maintaining the original message
4. Make it more readable with better flow and transitions
5. Ensure proper paragraph breaks and readability

Return only the enhanced article content, without any additional commentary or explanations.`;
    }

    console.log(`Calling Groq API for article: ${originalArticle.title}`);
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 2000
    });
    
    const enhancedContent = completion.choices[0]?.message?.content || "";
    
    if (!enhancedContent || enhancedContent.trim().length === 0) {
      throw new Error("Groq API returned empty content");
    }

    console.log(`Successfully enhanced article: ${originalArticle.title} (${enhancedContent.length} characters)`);
    
    return enhancedContent.trim();
  } catch (error) {
    console.error("Error calling Groq API:", error.message);
    if (error.response) {
      console.error("Groq API response error:", error.response.data);
    }
    throw error;
  }
}

module.exports = enhanceArticle;

