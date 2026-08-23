-- Migration 0007: Add new branding, social, and protocol config fields
-- These are stored in the config key-value table as JSON strings

INSERT OR IGNORE INTO config (key, value) VALUES ('faviconUrl', '""');
INSERT OR IGNORE INTO config (key, value) VALUES ('footerLogoUrl', '""');
INSERT OR IGNORE INTO config (key, value) VALUES ('brandAccentColor', '"#3B82F6"');
INSERT OR IGNORE INTO config (key, value) VALUES ('metaPixelId', '""');
INSERT OR IGNORE INTO config (key, value) VALUES ('protocolTitle', '"Why Shop With Us"');
INSERT OR IGNORE INTO config (key, value) VALUES ('protocolDescription', '"We deliver across Kenya, offer genuine products with warranty, and our team is just a WhatsApp message away for support."');
INSERT OR IGNORE INTO config (key, value) VALUES ('protocolBadges', '[{"text":"Fast Delivery","icon":"Zap","url":""},{"text":"Secure Checkout","icon":"ShieldCheck","url":""}]');
