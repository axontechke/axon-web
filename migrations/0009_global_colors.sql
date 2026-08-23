-- Migration 0009: Global Color Library
CREATE TABLE IF NOT EXISTS global_colors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT ''
);

-- Seed initial color palette
INSERT OR IGNORE INTO global_colors (id, name, code, image) VALUES
-- iPhone 11 Series
('col-11-black', 'iPhone 11 Black', '#1F1F21', ''),
('col-11-white', 'iPhone 11 White', '#F5F5F0', ''),
('col-11-green', 'iPhone 11 Green', '#AEE1CD', ''),
('col-11-purple', 'iPhone 11 Purple', '#D1CDDA', ''),
('col-11-yellow', 'iPhone 11 Yellow', '#F9D045', ''),
('col-11-red', 'iPhone 11 Product RED', '#A50011', ''),
-- iPhone 12 Series
('col-12-black', 'iPhone 12 Black', '#201D24', ''),
('col-12-white', 'iPhone 12 White', '#FBF7F4', ''),
('col-12-blue', 'iPhone 12 Blue', '#043458', ''),
('col-12-green', 'iPhone 12 Green', '#E1F8DC', ''),
('col-12-purple', 'iPhone 12 Purple', '#B8AFE6', ''),
('col-12-red', 'iPhone 12 Product RED', '#E23636', ''),
-- iPhone 13 Series
('col-13-midnight', 'iPhone 13 Midnight', '#171E27', ''),
('col-13-starlight', 'iPhone 13 Starlight', '#F9F3EE', ''),
('col-13-blue', 'iPhone 13 Blue', '#215E7C', ''),
('col-13-pink', 'iPhone 13 Pink', '#FAE0D8', ''),
('col-13-green', 'iPhone 13 Green', '#364935', ''),
('col-13-red', 'iPhone 13 Product RED', '#A50011', ''),
-- iPhone 14 Series
('col-14-midnight', 'iPhone 14 Midnight', '#171E27', ''),
('col-14-starlight', 'iPhone 14 Starlight', '#F9F3EE', ''),
('col-14-purple', 'iPhone 14 Purple', '#5856D6', ''),
('col-14-yellow', 'iPhone 14 Yellow', '#F9D045', ''),
('col-14-blue', 'iPhone 14 Blue', '#215E7C', ''),
('col-14-red', 'iPhone 14 Product RED', '#A50011', ''),
-- iPhone 15 Series
('col-15-black', 'iPhone 15 Black', '#1F1F21', ''),
('col-15-blue', 'iPhone 15 Blue', '#9BB5CE', ''),
('col-15-green', 'iPhone 15 Green', '#AEE1CD', ''),
('col-15-yellow', 'iPhone 15 Yellow', '#F9D045', ''),
('col-15-pink', 'iPhone 15 Pink', '#FAE0D8', ''),
-- iPhone 16 Series
('col-16-black', 'iPhone 16 Black', '#3C4042', ''),
('col-16-white', 'iPhone 16 White', '#FAFAFA', ''),
('col-16-pink', 'iPhone 16 Pink', '#F2ADDA', ''),
('col-16-teal', 'iPhone 16 Teal', '#B0D4D2', ''),
('col-16-ultramarine', 'iPhone 16 Ultramarine', '#9AADF6', ''),
-- iPhone 17 Series
('col-17-black', 'iPhone 17 Black', '#1F1F21', ''),
('col-17-white', 'iPhone 17 White', '#FAFAFA', ''),
('col-17-lavender', 'iPhone 17 Lavender', '#B8AFE6', ''),
('col-17-mist-blue', 'iPhone 17 Mist Blue', '#7095A8', ''),
('col-17-sage', 'iPhone 17 Sage', '#505F4E', ''),
('col-17-cosmic-orange', 'iPhone 17 Cosmic Orange', '#CC5500', ''),
('col-17-deep-blue', 'iPhone 17 Deep Blue', '#091318', ''),
-- iPhone 18 Series (Pre-release)
('col-18-dark-cherry', 'iPhone 18 Dark Cherry', '#A50034', ''),
('col-18-light-blue', 'iPhone 18 Light Blue', '#1E4D8C', ''),
('col-18-dark-gray', 'iPhone 18 Dark Gray', '#3C3C3C', ''),
('col-18-silver', 'iPhone 18 Silver', '#C0C0C0', ''),
-- Generic / Universals
('col-black', 'Black', '#000000', ''),
('col-white', 'White', '#FFFFFF', ''),
('col-gray', 'Gray', '#8E8E93', ''),
('col-gold', 'Gold', '#D4AF37', ''),
('col-rose-gold', 'Rose Gold', '#B76E79', ''),
('col-titanium', 'Titanium', '#878681', ''),
('col-orange', 'Orange', '#FF6B00', ''),
('col-cyan', 'Cyan', '#00FFFF', ''),
('col-teal', 'Teal', '#008080', ''),
('col-mint', 'Mint', '#98FFB6', '');
