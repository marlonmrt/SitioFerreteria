"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, FolderOpen, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";

type SuggestionArticle = {
  id: string;
  name: string;
  slug: string;
  erpCode: string;
  mainImage: string | null;
};

type SuggestionFamily = {
  id: string;
  name: string;
  slug: string;
};

function SuggestionImage({ src, alt }: { src: string | null; alt: string }) {
  const [imgSrc, setImgSrc] = useState(src || "/images/placeholder.jpg");

  // Keep in sync if search suggestions update
  useEffect(() => {
    setImgSrc(src || "/images/placeholder.jpg");
  }, [src]);

  return (
    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/20">
      <Image
        src={imgSrc}
        alt={alt}
        fill
        sizes="32px"
        className="object-cover"
        onError={() => setImgSrc("/images/placeholder.jpg")}
      />
    </div>
  );
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{
    articles: SuggestionArticle[];
    families: SuggestionFamily[];
  }>({ articles: [], families: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced search logic
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions({ articles: [], families: [] });
      setIsOpen(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions({
            articles: data.articles || [],
            families: data.families || []
          });
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Error fetching search suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/buscar?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const clearAndClose = () => {
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <form onSubmit={handleSearchSubmit} className="relative block">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
        </span>
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          placeholder="Buscar artículos, familias o códigos ERP..."
          className="h-11 w-full rounded-2xl border-border/70 bg-card pl-10 pr-4 shadow-sm transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
          aria-label="Buscar artículos"
        />
      </form>

      {isOpen && (suggestions.articles.length > 0 || suggestions.families.length > 0) && (
        <div className="absolute left-0 right-0 z-50 mt-2 max-h-[350px] overflow-y-auto rounded-2xl border border-border bg-popover p-2 shadow-soft backdrop-blur-md">
          {suggestions.families.length > 0 && (
            <div className="mb-2">
              <div className="px-3 py-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Familias
              </div>
              <ul className="space-y-1">
                {suggestions.families.map((family) => (
                  <li key={family.id}>
                    <Link
                      href={`/familias/${family.slug}`}
                      onClick={clearAndClose}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                    >
                      <FolderOpen className="h-4 w-4 text-primary" />
                      <span>{family.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {suggestions.articles.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Artículos
              </div>
              <ul className="space-y-1">
                {suggestions.articles.map((article) => (
                  <li key={article.id}>
                    <Link
                      href={`/articulos/${article.slug}`}
                      onClick={clearAndClose}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                    >
                      <SuggestionImage src={article.mainImage} alt={article.name} />
                      <div className="flex flex-col">
                        <span className="font-medium line-clamp-1">{article.name}</span>
                        <span className="text-xs text-muted-foreground">{article.erpCode}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
