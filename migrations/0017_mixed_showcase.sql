-- Migration 0017: Admin-controlled Mixed Picks showcase + category section visibility
-- These are stored in the config key-value table as JSON strings.
-- INSERT OR IGNORE ensures we never overwrite an admin's existing selection.

INSERT OR IGNORE INTO config (key, value) VALUES ('mixedShowcaseEnabled', 'true');
INSERT OR IGNORE INTO config (key, value) VALUES ('mixedShowcaseTitle', '"Shop Our Mixed Picks"');
INSERT OR IGNORE INTO config (key, value) VALUES ('mixedShowcaseSubtitle', '"Hand-picked across every category."');
INSERT OR IGNORE INTO config (key, value) VALUES ('mixedShowcaseProducts', '[]');
INSERT OR IGNORE INTO config (key, value) VALUES ('categoriesSectionEnabled', 'true');
