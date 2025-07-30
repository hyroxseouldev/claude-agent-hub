"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  initialValue?: string;
}

export function SearchBar({ initialValue = "" }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(initialValue);

  const handleSearch = (value: string) => {
    setSearch(value);
    
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }
      
      // Reset to first page when searching
      params.delete("page");
      
      router.push(`/?${params.toString()}`);
    });
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        placeholder="에이전트 이름으로 검색..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10"
        disabled={isPending}
      />
    </div>
  );
}