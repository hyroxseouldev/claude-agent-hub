/**
 * Example usage of the Claude Agent Hub database schema
 * This file demonstrates how to use the database queries and types
 */

import {
  getAgents,
  createAgent,
  updateAgent,
  incrementViewCount,
  incrementCopyCount,
  getAgentsByCategory,
  searchAgents,
  getCategoryStats,
} from "./queries";
import { insertAgentSchema } from "./schema";

// Example: Create a new agent
export async function exampleCreateAgent() {
  // Validate data with Zod schema
  const agentData = insertAgentSchema.parse({
    name: "UI Design Assistant",
    inputPrompt:
      "You are a UI/UX design expert that helps create modern, accessible user interfaces.",
    outputPrompt:
      "I'll help you design beautiful and functional user interfaces with best practices.",
    category: "Design" as const,
    userId: "user_2example123",
    description: "Helps with UI/UX design decisions and modern design patterns",
    tags: "ui,ux,design,accessibility,modern",
  });

  const newAgent = await createAgent(agentData);
  console.log("Created agent:", newAgent.id);
  return newAgent;
}

// Example: Get agents with filtering and pagination
export async function exampleGetAgents() {
  // Get all Design category agents, page 1, 20 per page
  const designAgents = await getAgentsByCategory("Design", {
    page: 1,
    pageSize: 20,
  });

  // Search for agents containing "design" in name
  const searchResults = await searchAgents("design", { page: 1, pageSize: 10 });

  // Get agents with multiple filters
  const filteredAgents = await getAgents(
    {
      category: "Development",
      search: "react",
      tags: ["frontend", "typescript"],
    },
    { page: 1, pageSize: 20 }
  );

  return {
    designAgents: designAgents.agents,
    searchResults: searchResults.agents,
    filteredAgents: filteredAgents.agents,
  };
}

// Example: Update agent and track interactions
export async function exampleUpdateAndTrack(agentId: string) {
  // Increment view count when someone views the agent
  await incrementViewCount(agentId);

  // Increment copy count when someone copies the agent
  await incrementCopyCount(agentId);

  // Update agent details
  const updatedAgent = await updateAgent(agentId, {
    description: "Updated description with more details",
    tags: "updated,tags,list",
  });

  return updatedAgent;
}

// Example: Get statistics
export async function exampleGetStats() {
  const categoryStats = await getCategoryStats();
  console.log("Category distribution:", categoryStats);
  return categoryStats;
}

// Example: API route pattern (Next.js App Router)
export async function exampleApiRoute(request: Request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get("category") as "Design" | "Development" | "Test" | "Other" | null;
    const validCategory = category && ["Design", "Development", "Test", "Other"].includes(category) ? category as "Design" | "Development" | "Test" | "Other" : undefined;
    const search = url.searchParams.get("search");
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "20");

    const result = await getAgents(
      { category: validCategory, search: search || undefined },
      { page, pageSize }
    );

    return Response.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("API error:", error);
    return Response.json(
      { success: false, error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}

// Example: Type-safe agent creation with validation
export async function exampleValidatedCreate(data: unknown) {
  try {
    // This will throw if validation fails
    const validatedData = insertAgentSchema.parse(data);

    const agent = await createAgent(validatedData);

    return {
      success: true,
      agent,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Validation failed",
    };
  }
}
