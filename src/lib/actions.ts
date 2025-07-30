"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getAgents,
  getAgentById,
  createAgent,
  updateAgent,
  deleteAgent,
  incrementViewCount,
  incrementCopyCount,
  getAgentsByCategory,
  searchAgents,
  getCategoryStats,
} from "@/db/queries";
import { insertAgentSchema, type AgentCategory } from "@/db/schema";

export async function getAgentsAction(params?: {
  category?: AgentCategory;
  search?: string;
  page?: number;
  pageSize?: number;
  userId?: string;
}) {
  try {
    const result = await getAgents(
      {
        category: params?.category,
        search: params?.search,
        userId: params?.userId,
      },
      {
        page: params?.page || 1,
        pageSize: params?.pageSize || 20,
      }
    );

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Failed to fetch agents:", error);
    return {
      success: false,
      error: "Failed to fetch agents",
    };
  }
}

export async function getAgentByIdAction(id: string) {
  try {
    const agent = await getAgentById(id);
    
    if (!agent) {
      return {
        success: false,
        error: "Agent not found",
      };
    }

    return {
      success: true,
      data: agent,
    };
  } catch (error) {
    console.error("Failed to fetch agent:", error);
    return {
      success: false,
      error: "Failed to fetch agent",
    };
  }
}

export async function createAgentAction(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  try {
    // Extract form data
    const name = formData.get("name") as string;
    const inputPrompt = formData.get("inputPrompt") as string;
    const outputPrompt = formData.get("outputPrompt") as string;
    const category = formData.get("category") as AgentCategory;
    const description = formData.get("description") as string;
    const tags = formData.get("tags") as string;

    // Validate with Zod schema
    const validatedData = insertAgentSchema.parse({
      name,
      inputPrompt,
      outputPrompt,
      category,
      description: description || undefined,
      tags: tags || undefined,
      userId,
    });

    const agent = await createAgent(validatedData);

    revalidatePath("/");
    redirect(`/${agent.id}`);
  } catch (error) {
    console.error("Failed to create agent:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create agent",
    };
  }
}

export async function updateAgentAction(id: string, formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  try {
    // Check if user owns the agent
    const existingAgent = await getAgentById(id);
    if (!existingAgent || existingAgent.userId !== userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Extract form data
    const name = formData.get("name") as string;
    const inputPrompt = formData.get("inputPrompt") as string;
    const outputPrompt = formData.get("outputPrompt") as string;
    const category = formData.get("category") as AgentCategory;
    const description = formData.get("description") as string;
    const tags = formData.get("tags") as string;

    const agent = await updateAgent(id, {
      name,
      inputPrompt,
      outputPrompt,
      category,
      description: description || undefined,
      tags: tags || undefined,
    });

    revalidatePath("/");
    revalidatePath(`/${id}`);
    
    return {
      success: true,
      data: agent,
    };
  } catch (error) {
    console.error("Failed to update agent:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update agent",
    };
  }
}

export async function deleteAgentAction(id: string) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  try {
    // Check if user owns the agent
    const existingAgent = await getAgentById(id);
    if (!existingAgent || existingAgent.userId !== userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    await deleteAgent(id);

    revalidatePath("/");
    redirect("/");
  } catch (error) {
    console.error("Failed to delete agent:", error);
    return {
      success: false,
      error: "Failed to delete agent",
    };
  }
}

export async function incrementViewCountAction(id: string) {
  try {
    await incrementViewCount(id);
    revalidatePath(`/${id}`);
    
    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to increment view count:", error);
    return {
      success: false,
      error: "Failed to increment view count",
    };
  }
}

export async function incrementCopyCountAction(id: string) {
  try {
    await incrementCopyCount(id);
    revalidatePath(`/${id}`);
    
    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to increment copy count:", error);
    return {
      success: false,
      error: "Failed to increment copy count",
    };
  }
}

export async function getAgentsByCategoryAction(
  category: AgentCategory,
  params?: {
    page?: number;
    pageSize?: number;
  }
) {
  try {
    const result = await getAgentsByCategory(category, {
      page: params?.page || 1,
      pageSize: params?.pageSize || 20,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Failed to fetch agents by category:", error);
    return {
      success: false,
      error: "Failed to fetch agents by category",
    };
  }
}

export async function searchAgentsAction(
  query: string,
  params?: {
    page?: number;
    pageSize?: number;
  }
) {
  try {
    const result = await searchAgents(query, {
      page: params?.page || 1,
      pageSize: params?.pageSize || 20,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Failed to search agents:", error);
    return {
      success: false,
      error: "Failed to search agents",
    };
  }
}

export async function getCategoryStatsAction() {
  try {
    const stats = await getCategoryStats();
    
    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("Failed to get category stats:", error);
    return {
      success: false,
      error: "Failed to get category stats",
    };
  }
}