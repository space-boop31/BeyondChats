const Database = require("better-sqlite3");
const path = require("path");

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, "../articles.db");
const db = new Database(dbPath);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS articles (
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

// Migrate existing database: remove old UNIQUE constraint on url if it exists
try {
  // Check if the old unique constraint exists by trying to create a unique index
  // If it fails, the constraint doesn't exist or is different
  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_url_version ON articles(url, version)`);
} catch (e) {
  // Index might already exist or constraint is different, try to drop old constraint
  try {
    db.exec(`DROP INDEX IF EXISTS idx_url`);
  } catch (err) {
    // Ignore if index doesn't exist
  }
}

// Create index on url for faster lookups
db.exec(`CREATE INDEX IF NOT EXISTS idx_url ON articles(url)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_version ON articles(version)`);

module.exports = db;

