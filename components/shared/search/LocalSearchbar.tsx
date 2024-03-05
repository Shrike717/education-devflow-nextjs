"use client";
import { Input } from "@/components/ui/input";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

interface CustomInputProps {
  route: string;
  iconPosition: string;
  imgSrc?: string;
  placeholder: string;
  otherClasses?: string;
}

const LocalSearchbar = ({
  route,
  iconPosition,
  imgSrc,
  placeholder,
  otherClasses,
}: CustomInputProps) => {
  // Things we need for the search functionality:
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // When we have the searchParams, we can access the query:
  const query = searchParams.get("q");
  //   console.log("query", query);
  //   console.log("[searchParams.toString]", searchParams.toString());

  // Then we set a local state for the query. Every key stroke will update the state:
  const [search, setSearch] = useState(query || "");

  // To get the values from the field into the URL, we use useEffect:
  useEffect(() => {
    // We want to have a function for the debounce effect. A request for every letter is too much. Can crash the browser.
    const delayDebounceFn = setTimeout(() => {
      if (search) {
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "q",
          value: search,
        });

        // Then we want to push the new URL to the router:
        router.push(newUrl, { scroll: false });
      } else {
        // If the search is empty, we want to remove the query from the URL:
        if (pathname === route) {
          const newUrl = removeKeysFromQuery({
            params: searchParams.toString(),
            keysToRemove: ["q"],
          });

          // Then we want to push the new URL to the router:
          router.push(newUrl, { scroll: false });
        }
      }

      // We want to clear the timeout after every letter and also call the function again:
      return () => clearTimeout(delayDebounceFn);
    }, 300);
  }, [search, route, pathname, router, searchParams, query]);

  return (
    <div
      className={`background-light800_darkgradient flex min-h-[56px] grow items-center gap-4 rounded-[10px] px-4 ${otherClasses}`}
    >
      {/* Die Lupe wird neu gezeigt, wenn die Position auf links steht */}
      {iconPosition === "left" && imgSrc && (
        <Image
          src={imgSrc}
          alt="search icon"
          width={24}
          height={24}
          className="cursor-pointer"
        />
      )}

      <Input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="paragraph-regular no-focus placeholder background-light800_darkgradient border-none shadow-none outline-none"
      />

      {/* Die Lupe wird neu gezeigt, wenn die Position auf rechts steht */}
      {iconPosition === "right" && imgSrc && (
        <Image
          src={imgSrc}
          alt="search icon"
          width={24}
          height={24}
          className="cursor-pointer"
        />
      )}
    </div>
  );
};

export default LocalSearchbar;
