const express = require("express");
const Article = require("../models/Article");
const scrapeOldestBlogs = require("../scraper/scrapeBlogs");

const router = express.Router();

/**
 * SCRAPE & STORE ARTICLES
 */
router.post("/scrape", async (req, res) => {
  try {
    const scrapedArticles = await scrapeOldestBlogs();

    const savedArticles = [];
    for (const article of scrapedArticles) {
      try {
        const exists = Article.findOne({ url: article.url });
        if (!exists) {
          const created = Article.create(article);
          savedArticles.push(created);
        } else {
          console.log(`Article already exists: ${article.title}`);
        }
      } catch (err) {
        console.error(`Error saving article ${article.title}:`, err.message);
        // Continue with next article
      }
    }

    res.json({
      success: true,
      count: savedArticles.length,
      data: savedArticles,
    });
  } catch (error) {
    console.error("Scrape error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET ALL ARTICLES
 */
router.get("/", (req, res) => {
  try {
    const version = req.query.version; // optional filter
    const articles = Article.findAll(version ? { version } : {});
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET SINGLE ARTICLE BY ID
 */
router.get("/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const article = Article.findById(id);
    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * CREATE ARTICLE
 */
router.post("/", (req, res) => {
  try {
    console.log("Creating article:", req.body.title, "version:", req.body.version);
    const article = Article.create(req.body);
    res.status(201).json(article);
  } catch (error) {
    console.error("Error creating article:", error);
    res.status(500).json({ error: error.message, details: error.stack });
  }
});

/**
 * UPDATE ARTICLE
 */
router.put("/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const article = Article.update(id, req.body);
    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE ARTICLE
 */
router.delete("/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = Article.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Article not found" });
    }
    res.json({ success: true, message: "Article deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
