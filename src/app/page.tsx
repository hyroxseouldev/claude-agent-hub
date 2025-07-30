import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import { AgentList } from "@/components/agent-list";
import { CategoryFilter } from "@/components/category-filter";
import { getAgentsAction } from "@/lib/actions";
import type { AgentCategory, Agent } from "@/db/schema";

interface PageProps {
  searchParams: Promise<{
    category?: AgentCategory;
    search?: string;
    page?: string;
  }>;
}

export default async function Home({ searchParams }: PageProps) {
  const { userId } = await auth();
  const params = await searchParams;

  const category = params.category;
  const search = params.search;
  const page = parseInt(params.page || "1");

  // Only fetch agents if user is logged in
  let agents: Agent[] = [];
  let totalPages = 0;
  
  if (userId) {
    const result = await getAgentsAction({
      category,
      search,
      page,
      pageSize: 20,
      userId,
    });
    
    agents = result.success ? result.data?.agents || [] : [];
    totalPages = result.success ? result.data?.totalPages || 0 : 0;
  }
  
  const hasAgents = agents.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-foreground animate-bounce-in">
            Agent Hub
          </h1>
          <p className="text-lg text-muted-foreground animate-fade-in-up-delay">
            AI 에이전트를 공유하고 발견하세요
          </p>
        </div>

        {/* Create Button (for logged in users) */}
        {userId && (
          <div className="flex justify-end mb-6 animate-slide-in-right">
            <Button
              asChild
              className="hover:scale-105 transition-transform duration-200"
            >
              <Link href="/create">
                <Plus className="h-4 w-4 mr-2" />
                에이전트 등록
              </Link>
            </Button>
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="space-y-4 mb-8 animate-fade-in-up-delay-2">
          {/* <Suspense fallback={<div>검색 로딩중...</div>}>
            <SearchBar initialValue={search} />
          </Suspense> */}

          <Suspense fallback={<div>필터 로딩중...</div>}>
            <CategoryFilter initialCategory={category} />
          </Suspense>
        </div>

        {/* Agent List */}
        {hasAgents ? (
          <Suspense fallback={<div>에이전트 로딩중...</div>}>
            <AgentList
              agents={agents}
              currentPage={page}
              totalPages={totalPages}
            />
          </Suspense>
        ) : (
          <div className="text-center py-12">
            {!userId ? (
              // Show login button when no user is logged in
              <div className="space-y-4">
                <p className="text-lg text-muted-foreground mb-4">
                  에이전트를 등록하고 공유하려면 로그인하세요
                </p>
                <SignInButton>
                  <Button>로그인</Button>
                </SignInButton>
              </div>
            ) : (
              // Show create button when user is logged in but no agents exist
              <div className="space-y-4">
                <p className="text-lg text-muted-foreground mb-4">
                  {search || category
                    ? "조건에 맞는 에이전트가 없습니다"
                    : "아직 등록된 에이전트가 없습니다"}
                </p>
                <Button asChild>
                  <Link href="/create">
                    <Plus className="h-4 w-4 mr-2" />첫 번째 에이전트 등록하기
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
