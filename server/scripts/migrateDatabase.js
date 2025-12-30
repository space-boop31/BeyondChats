require("dotenv").config();
const Database = require("better-sqlite3");
const path = require("path");

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, "../articles.db");
const db = new Database(dbPath);

console.log("Starting database migration...");

try {
  // Check if table exists
  const tableExists = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='table' AND name='articles'
  `).get();
  
  if (!tableExists) {
    console.log("Articles table doesn't exist yet. Creating with correct schema...");
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
    db.exec("CREATE INDEX IF NOT EXISTS idx_url ON articles(url)");
    db.exec("CREATE INDEX IF NOT EXISTS idx_version ON articles(version)");
    console.log("✓ Table created successfully!");
    db.close();
    process.exit(0);
  }
  
  // Get all existing articles
  const articles = db.prepare("SELECT * FROM articles").all();
  console.log(`Found ${articles.length} existing articles`);
  
  // Create new table with correct schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles_new (
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
  
  // Copy data to new table
  const insertStmt = db.prepare(`
    INSERT INTO articles_new (id, title, url, excerpt, content, author, image, publishedAt, source, version, createdAt, updatedAt, articleReferences)
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
  
  // Drop old table and rename new one
  db.exec("DROP TABLE articles");
  db.exec("ALTER TABLE articles_new RENAME TO articles");
  
  // Recreate indexes
  db.exec("CREATE INDEX IF NOT EXISTS idx_url ON articles(url)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_version ON articles(version)");
  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_url_version ON articles(url, version)");
  
  console.log("✓ Database migration completed successfully!");
  console.log(`✓ Migrated ${articles.length} articles`);
  
} catch (error) {
  console.error("Error during migration:", error);
  process.exit(1);
} finally {
  db.close();
}

