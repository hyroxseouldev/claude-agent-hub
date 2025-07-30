import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CreateAgentForm } from "@/components/create-agent-form";

export default async function CreatePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-3xl font-bold text-foreground">에이전트 등록</h1>
            <p className="text-muted-foreground">
              새로운 AI 에이전트를 등록하고 공유하세요
            </p>
          </div>

          <CreateAgentForm />
        </div>
      </div>
    </div>
  );
}