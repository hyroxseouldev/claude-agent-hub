import { desc, eq, and, ilike, count, sql } from "drizzle-orm";
import {
  db,
  agents,
  type Agent,
  type AgentCategory,
  type AgentFilters,
  type PaginationParams,
  type CreateAgentInput,
} from "./index";

/**
 * Get all agents with filtering, sorting, and pagination
 */
export async function getAgents(
  filters: AgentFilters = {},
  pagination: PaginationParams = { page: 1, pageSize: 20 }
) {
  const { category, userId, search, tags } = filters;
  const { page, pageSize } = pagination;
  const offset = (page - 1) * pageSize;

  // Build where conditions
  const conditions = [];

  if (category) {
    conditions.push(eq(agents.category, category));
  }

  if (userId) {
    conditions.push(eq(agents.userId, userId));
  }

  if (search) {
    conditions.push(ilike(agents.name, `%${search}%`));
  }

  if (tags && tags.length > 0) {
    // Simple tag search - assumes tags are comma-separated
    const tagConditions = tags.map((tag) => ilike(agents.tags, `%${tag}%`));
    conditions.push(...tagConditions);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count for pagination
  const [totalResult] = await db
    .select({ count: count() })
    .from(agents)
    .where(whereClause);

  // Get agents with pagination
  const agentsList = await db
    .select()
    .from(agents)
    .where(whereClause)
    .orderBy(desc(agents.createdAt))
    .limit(pageSize)
    .offset(offset);

  return {
    agents: agentsList,
    totalCount: totalResult.count,
    totalPages: Math.ceil(totalResult.count / pageSize),
    currentPage: page,
    pageSize,
  };
}

/**
 * Get a single agent by ID
 */
export async function getAgentById(id: string): Promise<Agent | null> {
  const [agent] = await db
    .select()
    .from(agents)
    .where(eq(agents.id, id))
    .limit(1);

  return agent || null;
}

/**
 * Create a new agent
 */
export async function createAgent(agentData: CreateAgentInput): Promise<Agent> {
  const [newAgent] = await db
    .insert(agents)
    .values({
      ...agentData,
      updatedAt: new Date(),
    })
    .returning();

  return newAgent;
}

/**
 * Update an existing agent
 */
export async function updateAgent(
  id: string,
  updates: Partial<Omit<Agent, "id" | "createdAt" | "userId">>
): Promise<Agent | null> {
  const [updatedAgent] = await db
    .update(agents)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(agents.id, id))
    .returning();

  return updatedAgent || null;
}

/**
 * Delete an agent
 */
export async function deleteAgent(
  id: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .delete(agents)
    .where(and(eq(agents.id, id), eq(agents.userId, userId)))
    .returning();

  return result.length > 0;
}

/**
 * Increment view count for an agent
 */
export async function incrementViewCount(id: string): Promise<void> {
  await db
    .update(agents)
    .set({
      viewCount: sql`COALESCE(CAST(${agents.viewCount} AS INTEGER), 0) + 1`,
      updatedAt: new Date(),
    })
    .where(eq(agents.id, id));
}

/**
 * Increment copy count for an agent
 */
export async function incrementCopyCount(id: string): Promise<void> {
  await db
    .update(agents)
    .set({
      copyCount: sql`COALESCE(CAST(${agents.copyCount} AS INTEGER), 0) + 1`,
      updatedAt: new Date(),
    })
    .where(eq(agents.id, id));
}

/**
 * Get agents by user ID
 */
export async function getAgentsByUser(
  userId: string,
  pagination: PaginationParams = { page: 1, pageSize: 20 }
): Promise<{
  agents: Agent[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}> {
  return getAgents({ userId }, pagination);
}

/**
 * Get agents by category
 */
export async function getAgentsByCategory(
  category: AgentCategory,
  pagination: PaginationParams = { page: 1, pageSize: 20 }
): Promise<{
  agents: Agent[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}> {
  return getAgents({ category }, pagination);
}

/**
 * Search agents by name or description
 */
export async function searchAgents(
  searchTerm: string,
  pagination: PaginationParams = { page: 1, pageSize: 20 }
): Promise<{
  agents: Agent[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}> {
  return getAgents({ search: searchTerm }, pagination);
}

/**
 * Get category statistics
 */
export async function getCategoryStats(): Promise<
  {
    category: AgentCategory;
    count: number;
  }[]
> {
  const stats = await db
    .select({
      category: agents.category,
      count: count(),
    })
    .from(agents)
    .groupBy(agents.category);

  return stats;
}
