const db = require("../database");

class Article {
  static create(articleData) {
    try {
      const stmt = db.prepare(`
        INSERT INTO articles (title, url, excerpt, content, author, image, publishedAt, source, version, articleReferences)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        articleData.title,
        articleData.url,
        articleData.excerpt || null,
        articleData.content || null,
        articleData.author || null,
        articleData.image || null,
        articleData.publishedAt || null,
        articleData.source || "BeyondChats",
        articleData.version || "original",
        articleData.references ? JSON.stringify(articleData.references) : null
      );
      
      return this.findById(result.lastInsertRowid);
    } catch (error) {
      console.error("Error creating article:", error);
      throw error;
    }
  }

  static findById(id) {
    try {
      const stmt = db.prepare("SELECT * FROM articles WHERE id = ?");
      const article = stmt.get(id);
      if (article && article.articleReferences) {
        try {
          article.references = JSON.parse(article.articleReferences);
        } catch (e) {
          article.references = [];
        }
      }
      return article;
    } catch (error) {
      console.error("Error in findById:", error);
      return null;
    }
  }

  static findOne(query) {
    try {
      if (query.url) {
        const stmt = db.prepare("SELECT * FROM articles WHERE url = ?");
        const article = stmt.get(query.url);
        if (article && article.articleReferences) {
          try {
            article.references = JSON.parse(article.articleReferences);
          } catch (e) {
            article.references = [];
          }
        }
        return article;
      }
      return null;
    } catch (error) {
      console.error("Error in findOne:", error);
      return null;
    }
  }

  static findAll(options = {}) {
    try {
      let query = "SELECT * FROM articles";
      const params = [];
      
      if (options.version) {
        query += " WHERE version = ?";
        params.push(options.version);
      }
      
      query += " ORDER BY createdAt DESC";
      
      const stmt = db.prepare(query);
      const articles = params.length > 0 ? stmt.all(...params) : stmt.all();
      
      return articles.map(article => {
        if (article && article.articleReferences) {
          try {
            article.references = JSON.parse(article.articleReferences);
          } catch (e) {
            article.references = [];
          }
        }
        return article;
      });
    } catch (error) {
      console.error("Error in findAll:", error);
      return [];
    }
  }

  static update(id, articleData) {
    const existing = this.findById(id);
    if (!existing) {
      return null;
    }

    const stmt = db.prepare(`
      UPDATE articles 
      SET title = ?, url = ?, excerpt = ?, content = ?, author = ?, 
          image = ?, publishedAt = ?, source = ?, version = ?, 
          articleReferences = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(
      articleData.title || existing.title,
      articleData.url || existing.url,
      articleData.excerpt !== undefined ? articleData.excerpt : existing.excerpt,
      articleData.content !== undefined ? articleData.content : existing.content,
      articleData.author !== undefined ? articleData.author : existing.author,
      articleData.image !== undefined ? articleData.image : existing.image,
      articleData.publishedAt !== undefined ? articleData.publishedAt : existing.publishedAt,
      articleData.source || existing.source,
      articleData.version || existing.version,
      articleData.references ? JSON.stringify(articleData.references) : existing.articleReferences,
      id
    );
    
    return this.findById(id);
  }

  static delete(id) {
    const stmt = db.prepare("DELETE FROM articles WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

module.exports = Article;
