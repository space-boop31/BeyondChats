const axios = require("axios");
const cheerio = require("cheerio");

async function searchGoogle(query) {
  try {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5"
      }
    });
    
    const $ = cheerio.load(response.data);
    const links = [];
    
    // Google search results are typically in divs with class "g"
    $("div.g").each((i, element) => {
      if (links.length >= 2) return false;
      
      const $el = $(element);
      const linkElement = $el.find("a").first();
      const href = linkElement.attr("href");
      
      if (href) {
        // Extract actual URL from Google's redirect URL
        let url = href;
        if (href.startsWith("/url?q=")) {
          const match = href.match(/\/url\?q=([^&]+)/);
          if (match) {
            url = decodeURIComponent(match[1]);
          }
        }
        
        // Filter out Google internal pages and ensure it's a valid HTTP(S) URL
        if (url && 
            url.startsWith("http") && 
            !url.includes("google.com") &&
            !url.includes("youtube.com") &&
            !url.includes("facebook.com") &&
            !url.includes("twitter.com") &&
            !url.includes("linkedin.com")) {
          
          // Check if it looks like a blog/article page
          const title = $el.find("h3").text().trim();
          const snippet = $el.find("span").text().trim();
          
          if (title && (url.includes("/blog/") || url.includes("/article/") || 
              url.includes("/post/") || url.match(/\/\d{4}\/\d{2}\//) || 
              snippet.length > 50)) {
            links.push({
              url: url,
              title: title,
              snippet: snippet
            });
          }
        }
      }
    });
    
    // Alternative selector if the above doesn't work
    if (links.length < 2) {
      $("a[href*='/url?q=']").each((i, element) => {
        if (links.length >= 2) return false;
        
        const href = $(element).attr("href");
        if (href) {
          const match = href.match(/\/url\?q=([^&]+)/);
          if (match) {
            const url = decodeURIComponent(match[1]);
            if (url && 
                url.startsWith("http") && 
                !url.includes("google.com") &&
                !url.includes("youtube.com") &&
                !url.includes("facebook.com") &&
                !url.includes("twitter.com") &&
                !url.includes("linkedin.com")) {
              
              const title = $(element).closest("div").find("h3").text().trim() || 
                           $(element).text().trim();
              
              if (title && (url.includes("/blog/") || url.includes("/article/") || 
                  url.includes("/post/") || url.match(/\/\d{4}\/\d{2}\//))) {
                
                // Check if URL already added
                if (!links.some(link => link.url === url)) {
                  links.push({
                    url: url,
                    title: title,
                    snippet: ""
                  });
                }
              }
            }
          }
        }
      });
    }
    
    return links.slice(0, 2).map(link => link.url);
  } catch (error) {
    console.error("Error searching Google:", error.message);
    throw error;
  }
}

module.exports = searchGoogle;

