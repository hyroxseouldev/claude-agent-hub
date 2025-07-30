import {
  pgTable,
  text,
  timestamp,
  uuid,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { z } from "zod";

// Define the category enum for type safety and database constraints
export const categoryEnum = pgEnum("category", [
  "Design",
  "Development",
  "Test",
  "Other",
]);

// Main agents table
export const agents = pgTable(
  "agents",
  {
    // Primary key - using UUID for better distribution and security
    id: uuid("id").defaultRandom().primaryKey(),

    // Agent identification
    name: text("name").notNull(),

    // Agent content - these are the main prompts/instructions
    inputPrompt: text("input_prompt").notNull(),
    outputPrompt: text("output_prompt").notNull(),

    // Category classification for filtering
    category: categoryEnum("category").notNull(),

    // User information from Clerk authentication
    // Using Clerk's user ID format which is typically a string
    userId: text("user_id").notNull(),
    // userEmail: text("user_email").notNull(),
    // userName: text("user_name"),

    // Optional description for better agent discovery
    description: text("description"),

    // Tags for enhanced searchability (comma-separated or JSON array)
    tags: text("tags"),

    // Metadata for analytics and management
    viewCount: text("view_count").default("0"),
    copyCount: text("copy_count").default("0"),

    // Timestamps for tracking and sorting
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    // Indexes for performance optimization

    // Index for filtering by category (most common filter operation)
    categoryIdx: index("agents_category_idx").on(table.category),

    // Index for user-specific queries (user dashboard, user's agents)
    userIdIdx: index("agents_user_id_idx").on(table.userId),

    // Composite index for category + creation date (for paginated category filtering)
    categoryCreatedAtIdx: index("agents_category_created_at_idx").on(
      table.category,
      table.createdAt
    ),

    // Index for general sorting by creation date (homepage, recent agents)
    createdAtIdx: index("agents_created_at_idx").on(table.createdAt),

    // Index for text search on agent names (for search functionality)
    nameIdx: index("agents_name_idx").on(table.name),

    // Composite index for user + category filtering
    userCategoryIdx: index("agents_user_category_idx").on(
      table.userId,
      table.category
    ),
  })
);

// Zod schemas for validation (useful for forms and API endpoints)
export const insertAgentSchema = z.object({
  name: z.string().min(1, "Agent name is required").max(100, "Name too long"),
  inputPrompt: z
    .string()
    .min(10, "Input prompt must be at least 10 characters"),
  outputPrompt: z
    .string()
    .min(10, "Output prompt must be at least 10 characters"),
  category: z.enum(["Design", "Development", "Test", "Other"]),
  userId: z.string().min(1, "User ID is required"),
  description: z.string().max(500, "Description too long").optional(),
  tags: z.string().optional(),
});

export const selectAgentSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  inputPrompt: z.string(),
  outputPrompt: z.string(),
  category: z.enum(["Design", "Development", "Test", "Other"]),
  userId: z.string(),
  description: z.string().nullable(),
  tags: z.string().nullable(),
  viewCount: z.string(),
  copyCount: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Derived types for TypeScript usage
export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;
export type AgentCategory = "Design" | "Development" | "Test" | "Other";

// Utility type for agent creation (omitting auto-generated fields)
export type CreateAgentInput = Omit<
  NewAgent,
  "id" | "createdAt" | "updatedAt" | "viewCount" | "copyCount"
>;

// Type for agent updates (all fields optional except id)
export type UpdateAgentInput = Partial<Omit<Agent, "id" | "createdAt">> & {
  id: string;
};

// Type for agent filtering/search
export type AgentFilters = {
  category?: AgentCategory;
  userId?: string;
  search?: string;
  tags?: string[];
};

// Type for pagination
export type PaginationParams = {
  page: number;
  pageSize: number;
};

// Export the table for use in database operations
export { agents as agentsTable };
