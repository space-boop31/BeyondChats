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
      "article .entry-content",
      "article .post-content",
      "article .article-content",
      ".entry-content",
      ".post-content",
      ".article-content",
      "article",
      ".content",
      "main"
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
      $("article p, .entry-content p, .post-content p").each((i, elem) => {
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

async function scrapeOldestBlogs() {
  try {
    const baseUrl = "https://beyondchats.com/blogs/";
    
    // Fetch the first page to get top articles
    const response = await axios.get(baseUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });
    
    const $ = cheerio.load(response.data);
    const articles = [];
    
    // Find all article elements with class "entry-card"
    const articleElements = $("article.entry-card").toArray();
    
    console.log(`Found ${articleElements.length} articles on page`);
    
    // Extract articles from found elements
    for (const element of articleElements.slice(0, 5)) {
      const $el = $(element);
      
      // Extract title from h2.entry-title > a
      const titleLink = $el.find("h2.entry-title a").first();
      const title = titleLink.text().trim();
      const url = titleLink.attr("href") || "";
      
      if (!title || !url) continue;
      
      // Extract excerpt from .entry-excerpt .has-excerpt-area p
      const excerpt = $el.find(".entry-excerpt .has-excerpt-area p").first().text().trim() || 
                     $el.find(".entry-excerpt p").first().text().trim() || "";
      
      // Extract author from .meta-author .ct-meta-element-author span
      const author = $el.find(".meta-author .ct-meta-element-author span").first().text().trim() || 
                    $el.find(".meta-author a").last().text().trim() || "";
      
      // Extract image from .ct-media-container img
      const image = $el.find(".ct-media-container img").first().attr("src") || 
                   $el.find("img").first().attr("src") || "";
      
      // Extract published date from .meta-date time datetime attribute
      const publishedAt = $el.find(".meta-date time").first().attr("datetime") ||
                          $el.find("time").first().attr("datetime") || "";
      
      const fullUrl = url.startsWith("http") ? url : `https://beyondchats.com${url}`;
      const fullImageUrl = image ? (image.startsWith("http") ? image : `https://beyondchats.com${image}`) : "";
      
      // Scrape full content from the article URL
      console.log(`Scraping content from: ${fullUrl}`);
      const content = await scrapeArticleContent(fullUrl);
      
      articles.push({
        title: title,
        url: fullUrl,
        excerpt: excerpt,
        content: content || excerpt, // Use content if available, fallback to excerpt
        author: author,
        image: fullImageUrl,
        publishedAt: publishedAt,
        source: "BeyondChats",
        version: "original"
      });
    }
    
    console.log(`Scraped ${articles.length} top articles with content from first page`);
    
    return articles;
  } catch (error) {
    console.error("Error scraping blogs:", error.message);
    throw error;
  }
}

module.exports = scrapeOldestBlogs;

