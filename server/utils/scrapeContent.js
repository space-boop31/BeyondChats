const axios = require("axios");
const cheerio = require("cheerio");

async function scrapeArticleContent(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data);
    
    // Remove script and style elements
    $("script, style, nav, header, footer, aside, .sidebar, .menu, .navigation").remove();
    
    // Common selectors for main article content
    const contentSelectors = [
      "article",
      ".article-content",
      ".post-content",
      ".entry-content",
      ".content",
      "[class*='article']",
      "[class*='post']",
      "[class*='content']",
      "main",
      ".main-content"
    ];
    
    let content = "";
    
    for (const selector of contentSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        content = element.text();
        if (content.length > 200) {
          break;
        }
      }
    }
    
    // If no content found, try to get all paragraphs
    if (!content || content.length < 200) {
      const paragraphs = [];
      $("p").each((i, elem) => {
        const text = $(elem).text().trim();
        if (text.length > 50) {
          paragraphs.push(text);
        }
      });
      content = paragraphs.join("\n\n");
    }
    
    // Clean up content
    content = content
      .replace(/\s+/g, " ")
      .replace(/\n\s*\n/g, "\n\n")
      .trim();
    
    return content;
  } catch (error) {
    console.error(`Error scraping content from ${url}:`, error.message);
    return "";
  }
}

module.exports = scrapeArticleContent;

