require("dotenv").config();
const axios = require("axios");
const searchGoogle = require("../utils/googleSearch");
const scrapeArticleContent = require("../utils/scrapeContent");
const enhanceArticle = require("../utils/groqClient");

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000/api/articles";

async function enhanceArticles() {
  try {
    console.log("Fetching articles from API...");
    
    // Fetch all original articles
    const response = await axios.get(`${API_BASE_URL}?version=original`);
    const articles = response.data;
    
    if (articles.length === 0) {
      console.log("No articles found. Please scrape articles first.");
      return;
    }
    
    console.log(`Found ${articles.length} articles to enhance`);
    
    for (const article of articles) {
      try {
        console.log(`\nProcessing: ${article.title}`);
        
        // Check if already enhanced by trying to find updated version with same URL
        try {
          const allArticles = await axios.get(API_BASE_URL);
          const updatedArticles = allArticles.data.filter(a => a.url === article.url && a.version === 'updated');
          if (updatedArticles.length > 0) {
            console.log(`  Already enhanced, skipping...`);
            continue;
          }
        } catch (err) {
          // Continue if check fails
        }
        
        // Try to search Google for similar articles (optional)
        let referenceContents = [];
        try {
          console.log(`  Searching Google for: ${article.title}`);
          const searchUrls = await searchGoogle(article.title);
          
          if (searchUrls.length >= 2) {
            console.log(`  Found ${searchUrls.length} reference articles`);
            
            // Scrape content from reference articles
            for (const url of searchUrls) {
              console.log(`  Scraping: ${url}`);
              const content = await scrapeArticleContent(url);
              if (content && content.length > 200) {
                referenceContents.push({ url, content });
              }
            }
          }
        } catch (error) {
          console.log(`  Google search failed (will enhance without references): ${error.message}`);
        }
        
        // If we don't have enough references, proceed without them
        if (referenceContents.length < 2) {
          console.log(`  Proceeding with enhancement without reference articles...`);
          referenceContents = [];
        }
        
        // Fetch full content if not available
        let articleContent = article.content;
        if (!articleContent || articleContent.trim().length < 50) {
          console.log(`  Article content missing or too short, fetching from URL...`);
          try {
            articleContent = await scrapeArticleContent(article.url);
            if (!articleContent || articleContent.trim().length < 50) {
              // Fallback to excerpt if scraping fails
              articleContent = article.excerpt || "";
            }
          } catch (err) {
            console.log(`  Failed to fetch content, using excerpt...`);
            articleContent = article.excerpt || "";
          }
        }
        
        if (!articleContent || articleContent.trim().length < 50) {
          console.log(`  Article content too short (${articleContent.length} chars), skipping...`);
          continue;
        }
        
        // Update article object with fetched content for enhancement
        article.content = articleContent;

        // Enhance article using Groq LLM
        console.log(`  Enhancing article with Groq LLM...`);
        let enhancedContent;
        try {
          enhancedContent = await enhanceArticle(article, referenceContents);
        } catch (error) {
          console.error(`  Error enhancing article: ${error.message}`);
          continue;
        }
        
        if (!enhancedContent || enhancedContent.trim().length === 0) {
          console.log(`  Failed to enhance article (empty response), skipping...`);
          continue;
        }
        
        // Add references at the bottom if available
        let finalContent = enhancedContent;
        if (referenceContents.length > 0) {
          const referencesSection = `\n\n---\n\n## References\n\n${referenceContents.map((ref, idx) => `${idx + 1}. [${ref.url}](${ref.url})`).join("\n")}`;
          finalContent = enhancedContent + referencesSection;
        }
        
        // Create updated article
        const updatedArticle = {
          title: article.title,
          url: article.url,
          excerpt: article.excerpt,
          content: finalContent,
          author: article.author,
          image: article.image,
          publishedAt: article.publishedAt,
          source: article.source,
          version: "updated",
          references: referenceContents.map(ref => ref.url)
        };
        
        // Save updated article
        console.log(`  Saving enhanced article...`);
        try {
          const response = await axios.post(`${API_BASE_URL}`, updatedArticle);
          console.log(`  ✓ Successfully enhanced: ${article.title} (ID: ${response.data.id})`);
        } catch (saveError) {
          console.error(`  ✗ Failed to save: ${article.title}`);
          if (saveError.response) {
            console.error(`    Status: ${saveError.response.status}`);
            console.error(`    Error: ${JSON.stringify(saveError.response.data, null, 2)}`);
          } else {
            console.error(`    Error: ${saveError.message}`);
          }
          throw saveError;
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`  Error processing article ${article.title}:`, error.message);
        continue;
      }
    }
    
    console.log("\n✓ Article enhancement complete!");
  } catch (error) {
    console.error("Error in enhancement script:", error.message);
    process.exit(1);
  }
}

// Run the enhancement script
enhanceArticles();

