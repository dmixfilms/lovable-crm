-- Add status_changed_at column to leads table
ALTER TABLE leads ADD COLUMN status_changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE INDEX idx_leads_status_changed_at ON leads(status_changed_at);
