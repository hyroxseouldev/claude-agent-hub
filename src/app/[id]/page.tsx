import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Eye, Copy } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import { getAgentByIdAction, incrementViewCountAction } from "@/lib/actions";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
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

export default async function AgentDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch agent data
  const result = await getAgentByIdAction(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const agent = result.data;

  // Increment view count (fire and forget)
  incrementViewCountAction(id).catch(console.error);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {agent.name}
                </h1>
                {agent.description && (
                  <p className="text-lg text-muted-foreground">
                    {agent.description}
                  </p>
                )}
              </div>
              <Badge variant="outline" className="ml-4">
                {getCategoryLabel(agent.category)}
              </Badge>
            </div>

            {/* Meta information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{agent.viewCount} 조회</span>
              </div>
              <div className="flex items-center gap-1">
                <Copy className="h-4 w-4" />
                <span>{agent.copyCount} 복사</span>
              </div>
              <div>
                {formatDistanceToNow(new Date(agent.createdAt), {
                  addSuffix: true,
                  locale: ko,
                })}
              </div>
            </div>

            {/* Tags */}
            {agent.tags && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {agent.tags.split(",").map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Input Prompt */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>인풋 프롬프트</CardTitle>
                    <CardDescription>
                      에이전트에게 전달되는 시스템 프롬프트입니다
                    </CardDescription>
                  </div>
                  <CopyButton
                    text={agent.inputPrompt}
                    agentId={agent.id}
                    label="인풋 프롬프트 복사"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {agent.inputPrompt}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Output Prompt */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>아웃풋 프롬프트</CardTitle>
                    <CardDescription>
                      에이전트의 응답 스타일과 형식을 정의합니다
                    </CardDescription>
                  </div>
                  <CopyButton
                    text={agent.outputPrompt}
                    agentId={agent.id}
                    label="아웃풋 프롬프트 복사"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {agent.outputPrompt}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Full Prompt Copy */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>전체 프롬프트</CardTitle>
                    <CardDescription>
                      인풋과 아웃풋 프롬프트를 함께 복사할 수 있습니다
                    </CardDescription>
                  </div>
                  <CopyButton
                    text={`${agent.inputPrompt}\n\n${agent.outputPrompt}`}
                    agentId={agent.id}
                    label="전체 프롬프트 복사"
                  />
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
