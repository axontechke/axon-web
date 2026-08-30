-- Migration 0009: Global Color Library (globalized — no iPhone prefix)
CREATE TABLE IF NOT EXISTS global_colors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT ''
);

-- Seed global palette (deduplicated, phone-prefix stripped)
-- Note: IDs with legacy iPhone series (col-11-*, col-12-*, etc.) are retained for backward compat;
-- only the display name is globalized. Use migration 0020 to migrate existing DBs.
INSERT OR IGNORE INTO global_colors (id, name, code, image) VALUES
('col-black', 'Black', '#000000', ''),
('col-white', 'White', '#FFFFFF', ''),
('col-gray', 'Gray', '#8E8E93', ''),
('col-gold', 'Gold', '#D4AF37', ''),
('col-rose-gold', 'Rose Gold', '#B76E79', ''),
('col-titanium', 'Titanium', '#878681', ''),
('col-orange', 'Orange', '#FF6B00', ''),
('col-cyan', 'Cyan', '#00FFFF', ''),
('col-teal', 'Teal', '#008080', ''),
('col-mint', 'Mint', '#98FFB6', ''),
('col-11-green', 'Green', '#AEE1CD', ''),
('col-11-purple', 'Purple', '#D1CDDA', ''),
('col-11-yellow', 'Yellow', '#F9D045', ''),
('col-11-red', 'Product RED', '#A50011', ''),
('col-12-blue', 'Blue', '#043458', ''),
('col-13-midnight', 'Midnight', '#171E27', ''),
('col-13-starlight', 'Starlight', '#F9F3EE', ''),
('col-13-pink', 'Pink', '#FAE0D8', ''),
('col-16-ultramarine', 'Ultramarine', '#9AADF6', ''),
('col-17-lavender', 'Lavender', '#B8AFE6', ''),
('col-17-mist-blue', 'Mist Blue', '#7095A8', ''),
('col-17-sage', 'Sage', '#505F4E', ''),
('col-17-cosmic-orange', 'Cosmic Orange', '#CC5500', ''),
('col-17-deep-blue', 'Deep Blue', '#091318', ''),
('col-18-dark-cherry', 'Dark Cherry', '#A50034', ''),
('col-18-light-blue', 'Light Blue', '#1E4D8C', ''),
('col-18-dark-gray', 'Dark Gray', '#3C3C3C', ''),
('col-18-silver', 'Silver', '#C0C0C0', '');
