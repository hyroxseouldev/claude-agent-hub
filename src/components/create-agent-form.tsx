"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createAgentAction } from "@/lib/actions";
import type { AgentCategory } from "@/db/schema";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "에이전트명은 필수입니다")
    .max(100, "에이전트명이 너무 깁니다"),
  inputPrompt: z
    .string()
    .min(10, "인풋 프롬프트는 최소 10자 이상이어야 합니다"),
  outputPrompt: z
    .string()
    .min(10, "아웃풋 프롬프트는 최소 10자 이상이어야 합니다"),
  category: z.enum(["Design", "Development", "Test", "Other"]),
  description: z.string().max(500, "설명이 너무 깁니다").optional(),
  tags: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const categories = [
  { value: "Design" as AgentCategory, label: "디자인" },
  { value: "Development" as AgentCategory, label: "개발" },
  { value: "Test" as AgentCategory, label: "테스트" },
  { value: "Other" as AgentCategory, label: "기타" },
];

export function CreateAgentForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      inputPrompt: "",
      outputPrompt: "",
      category: "Development",
      description: "",
      tags: "",
    },
  });

  // Track form changes for page exit prevention
  useEffect(() => {
    const subscription = form.watch(() => {
      setHasUnsavedChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Page exit prevention
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    const handlePopState = () => {
      if (hasUnsavedChanges) {
        const confirmed = window.confirm(
          "저장하지 않은 변경사항이 있습니다. 정말 떠나시겠습니까?"
        );
        if (!confirmed) {
          window.history.pushState(null, "", window.location.pathname);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    // Push current state to enable popstate detection
    window.history.pushState(null, "", window.location.pathname);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("inputPrompt", data.inputPrompt);
      formData.append("outputPrompt", data.outputPrompt);
      formData.append("category", data.category);
      if (data.description) formData.append("description", data.description);
      if (data.tags) formData.append("tags", data.tags);

      const result = await createAgentAction(formData);

      if (result?.success === false) {
        toast.error(result.error || "에이전트 생성에 실패했습니다");
        return;
      }

      // Success - no unsaved changes anymore
      setHasUnsavedChanges(false);
      toast.success("에이전트가 성공적으로 등록되었습니다!");

      // The createAgentAction will redirect to the agent detail page
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("에이전트 생성 중 오류가 발생했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>에이전트 정보</CardTitle>
        <CardDescription>
          AI 에이전트의 기본 정보를 입력해주세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>에이전트명 *</FormLabel>
                  <FormControl>
                    <Input placeholder="예: UI 디자인 어시스턴트" {...field} />
                  </FormControl>
                  <FormDescription>
                    에이전트의 이름을 입력해주세요 (최대 100자)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>카테고리 *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="카테고리를 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    에이전트가 속할 카테고리를 선택해주세요
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>설명</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="에이전트에 대한 간단한 설명을 입력해주세요"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    에이전트의 기능이나 용도를 설명해주세요 (최대 500자)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="inputPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>인풋 프롬프트 *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="You are a helpful assistant that..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    에이전트에게 전달할 시스템 프롬프트를 입력해주세요 (최소
                    10자)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="outputPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>아웃풋 프롬프트 *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="I'll help you with..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    에이전트의 응답 스타일이나 형식을 정의해주세요 (최소 10자)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>태그</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ui, design, frontend (쉼표로 구분)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    검색에 도움이 될 태그를 쉼표로 구분해서 입력해주세요
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (hasUnsavedChanges) {
                    const confirmed = window.confirm(
                      "저장하지 않은 변경사항이 있습니다. 정말 취소하시겠습니까?"
                    );
                    if (confirmed) {
                      setHasUnsavedChanges(false);
                      router.back();
                    }
                  } else {
                    router.back();
                  }
                }}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "등록 중..." : "에이전트 등록"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
