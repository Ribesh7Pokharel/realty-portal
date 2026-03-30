const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "portal.db"));

// Enable WAL mode for better performance
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'buyer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    address TEXT NOT NULL,
    price INTEGER NOT NULL,
    bedrooms INTEGER NOT NULL,
    bathrooms INTEGER NOT NULL,
    area_sqft INTEGER NOT NULL,
    image_url TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS favourites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    property_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    UNIQUE(user_id, property_id)
  );
`);

// Seed sample properties if none exist
const count = db.prepare("SELECT COUNT(*) as c FROM properties").get();
if (count.c === 0) {
  const insert = db.prepare(`
    INSERT INTO properties (title, address, price, bedrooms, bathrooms, area_sqft, image_url, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const properties = [
    [
      "Modern Downtown Loft",
      "42 Skyline Ave, New York, NY 10001",
      1250000,
      2,
      2,
      1100,
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600",
      "Stunning loft with floor-to-ceiling windows and city views.",
    ],
    [
      "Suburban Family Home",
      "18 Maple Drive, Austin, TX 78701",
      685000,
      4,
      3,
      2400,
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600",
      "Spacious family home with large backyard and top-rated schools nearby.",
    ],
    [
      "Beachfront Condo",
      "7 Ocean Blvd, Miami, FL 33101",
      920000,
      3,
      2,
      1500,
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600",
      "Wake up to ocean views every day in this stunning beachfront condo.",
    ],
    [
      "Mountain Retreat Cabin",
      "55 Pine Ridge Rd, Aspen, CO 81611",
      1450000,
      5,
      4,
      3200,
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600",
      "Luxury mountain retreat with hot tub, ski access, and panoramic views.",
    ],
    [
      "Historic Brownstone",
      "9 Heritage Lane, Boston, MA 02101",
      875000,
      3,
      2,
      1800,
      "https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=600",
      "Beautifully restored brownstone in the heart of historic Boston.",
    ],
    [
      "Minimalist Studio",
      "301 Design District, Chicago, IL 60601",
      395000,
      1,
      1,
      620,
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600",
      "Architect-designed studio with premium finishes and smart home features.",
    ],
  ];

  const insertAll = db.transaction((props) => {
    for (const p of props) insert.run(...p);
  });
  insertAll(properties);
  console.log("✅ Seeded sample properties");
}

module.exports = db;
