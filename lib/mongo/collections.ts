export const TRANSFER_DB = "transfer";

export const Collections = {
  schools: "schools",
  equivalents: "equivalents",
  states: "states",
  lastAccessed: "lastAccessed",
  crawlFailures: "crawlFailures",
} as const;

export const CrawlRoutes = {
  dailyRefresh: "dailyMongoUpdate",
} as const;
