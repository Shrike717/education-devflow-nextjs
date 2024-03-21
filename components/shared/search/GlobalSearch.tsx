"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";
import GlobalResult from "./GlobalResult";

const GlobalSearch = () => {
  // Things we need for the search functionality:
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchContainerRef = useRef(null); // We need a ref to the search container to check if the user clicks outside of it

  const query = searchParams.get("q"); // When we have the searchParams, we can access the local query:

  const [search, setSearch] = useState(query || ""); // Then we set a local state for the query. Every key stroke will update the state
  const [isOpen, setIsOpen] = useState(false); // We want to have a local state for the modal

  // This useEffect will update the url when the user types in the search input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search) {
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "global",
          value: search,
        });

        router.push(newUrl, { scroll: false });
      } else {
        if (query) {
          const newUrl = removeKeysFromQuery({
            params: searchParams.toString(),
            keysToRemove: ["global", "type"],
          });

          router.push(newUrl, { scroll: false });
        }
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn); // We need to clear the timeout when the component is unmounted
  }, [search, router, pathname, searchParams, query]);

  // This useEffect will close the modal when the user clicks outside of it
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleOutsideClick = (e: any) => {
      if (
        searchContainerRef.current && // We need to check if the ref exists
        !searchContainerRef.current.contains(e.target) // && We need to check if the user clicks outside of the ref
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };

    // If the pathname changes, we also want to close the modal when we navigate to a result page
    setIsOpen(false);

    // We need to add an event listener to the document
    document.addEventListener("click", handleOutsideClick);

    // As with all event listeners we use in a useEffect, we need to remove them when the component is unmounted
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [pathname]);

  return (
    // This is the main search container. With a ref to check if the user clicks outside of it
    <div
      className="relative w-full max-w-[600px] max-lg:hidden"
      ref={searchContainerRef}
    >
      <div className="background-light800_darkgradient relative flex min-h-[56px] grow items-center gap-1 rounded-xl px-4">
        <Image
          src="/assets/icons/search.svg"
          alt="search"
          width={24}
          height={24}
          className="cursor-pointer"
        />

        <Input
          type="text"
          placeholder="Search globally"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);

            if (!isOpen) setIsOpen(true); // Here we have to check if the modal is open. If not, we want to open it
            if (e.target.value === "" && isOpen) setIsOpen(false); // If the input is empty and the modal is open, we want to close it
          }}
          className="paragraph-regular no-focus placeholder text-dark400_light700 border-none bg-transparent shadow-none outline-none"
        />
      </div>
      {isOpen && <GlobalResult />}
    </div>
  );
};

export default GlobalSearch;
