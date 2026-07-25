export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  LISTING_WEBHOOK_SECRET?: string;
  ADMIN_TOKEN?: string;
  IMPORT_ALLOWED_HOSTS?: string;
}
