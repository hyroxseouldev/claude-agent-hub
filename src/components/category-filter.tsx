"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { AgentCategory } from "@/db/schema";

interface CategoryFilterProps {
  initialCategory?: AgentCategory;
}

const categories = [
  { value: undefined, label: "전체" },
  { value: "Design" as AgentCategory, label: "디자인" },
  { value: "Development" as AgentCategory, label: "개발" },
  { value: "Test" as AgentCategory, label: "테스트" },
  { value: "Other" as AgentCategory, label: "기타" },
];

export function CategoryFilter({ initialCategory }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryChange = (category?: AgentCategory) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    
    // Reset to first page when filtering
    params.delete("page");
    
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Button
          key={category.label}
          variant={initialCategory === category.value ? "default" : "outline"}
          size="sm"
          onClick={() => handleCategoryChange(category.value)}
        >
          {category.label}
        </Button>
      ))}
    </div>
  );
}