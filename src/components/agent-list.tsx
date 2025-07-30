import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/pagination";
import type { Agent } from "@/db/schema";

interface AgentListProps {
  agents: Agent[];
  currentPage: number;
  totalPages: number;
}

const getCategoryLabel = (category: string) => {
  switch (category) {
    case "Design":
      return "디자인";
    case "Development":
      return "개발";
    case "Test":
      return "테스트";
    case "Other":
      return "기타";
    default:
      return category;
  }
};

export function AgentList({ agents, currentPage, totalPages }: AgentListProps) {
  return (
    <div className="space-y-6">
      {/* Results count */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          총 {agents.length}개의 에이전트
        </p>
      </div>

      {/* Agent cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg line-clamp-2">
                    {agent.name}
                  </CardTitle>
                  {agent.description && (
                    <CardDescription className="text-sm line-clamp-2">
                      {agent.description}
                    </CardDescription>
                  )}
                </div>
                <Badge variant="outline" className="ml-2 shrink-0">
                  {getCategoryLabel(agent.category)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {agent.tags && (
                <div>
                  <p className="text-sm font-medium mb-1">태그</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.tags.split(",").map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(agent.createdAt), {
                  addSuffix: true,
                  locale: ko,
                })}
              </span>
              <Button size="sm" asChild>
                <Link href={`/${agent.id}`}>
                  자세히 보기
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
        />
      )}
    </div>
  );
}