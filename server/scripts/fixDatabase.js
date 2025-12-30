require("dotenv").config();
const Database = require("better-sqlite3");
const path = require("path");

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, "../../articles.db");
const db = new Database(dbPath);

console.log("Fixing database schema...");

try {
  // Backup existing data
  const articles = db.prepare("SELECT * FROM articles").all();
  console.log(`Found ${articles.length} articles to migrate`);
  
  // Create backup table
  db.exec("CREATE TABLE IF NOT EXISTS articles_backup AS SELECT * FROM articles");
  
  // Drop old table
  db.exec("DROP TABLE articles");
  
  // Create new table with correct schema (UNIQUE on url+version, not just url)
  db.exec(`
    CREATE TABLE articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      excerpt TEXT,
      content TEXT,
      author TEXT,
      image TEXT,
      publishedAt TEXT,
      source TEXT DEFAULT 'BeyondChats',
      version TEXT DEFAULT 'original' CHECK(version IN ('original', 'updated')),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      articleReferences TEXT,
      UNIQUE(url, version)
    )
  `);
  
  // Restore data
  const insertStmt = db.prepare(`
    INSERT INTO articles (id, title, url, excerpt, content, author, image, publishedAt, source, version, createdAt, updatedAt, articleReferences)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const insertMany = db.transaction((articles) => {
    for (const article of articles) {
      insertStmt.run(
        article.id,
        article.title,
        article.url,
        article.excerpt,
        article.content,
        article.author,
        article.image,
        article.publishedAt,
        article.source,
        article.version,
        article.createdAt,
        article.updatedAt,
        article.articleReferences
      );
    }
  });
  
  insertMany(articles);
  
  // Drop backup
  db.exec("DROP TABLE articles_backup");
  
  // Create indexes
  db.exec("CREATE INDEX IF NOT EXISTS idx_url ON articles(url)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_version ON articles(version)");
  
  console.log(`✓ Migration complete! Migrated ${articles.length} articles`);
  console.log(`✓ Schema now allows same URL with different versions`);
  
} catch (error) {
  console.error("Error during migration:", error);
  // Try to restore from backup
  try {
    const backupArticles = db.prepare("SELECT * FROM articles_backup").all();
    if (backupArticles.length > 0) {
      console.log("Attempting to restore from backup...");
      db.exec("DROP TABLE IF EXISTS articles");
      db.exec("ALTER TABLE articles_backup RENAME TO articles");
      console.log("Restored from backup");
    }
  } catch (restoreError) {
    console.error("Failed to restore:", restoreError);
  }
  process.exit(1);
} finally {
  db.close();
}


