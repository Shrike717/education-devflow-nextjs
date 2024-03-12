"use client";

import { Button } from "@/components/ui/button";
import { GlobalSearchFilters } from "@/constants/filters";
import { formUrlQuery } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

const GlobalFilters = () => {
  // We need some things to compare the type of the filter with the query in the url to set the active filter
  const router = useRouter();
  const searchParams = useSearchParams();

  // We need to extract the type from the searchParams. We need to know: Are we seearching for a question, an answeer, a tag or a user?
  const typeParams = searchParams.get("type");

  // Then we need a state to keep track of that locally:
  const [active, setActive] = useState(typeParams || "");

  // On click on a button we have to update the url and set the active state.
  const handleTypeClick = (item: string) => {
    // Here we bild the new URL with the formUrlQuery function
    if (active === item) {
      // We set the active state when clicked on the button. If the active state is already set, we want to remove it
      setActive("");

      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "type",
        value: null, // When the type is active and we click on it again, we want to remove the type from the URL. Toggle
      });

      // Then we want to push the new URL to the browser:
      router.push(newUrl, { scroll: false });
    } else {
      // We set the active state when clicked on the button
      setActive(item);

      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "type",
        value: item.toLowerCase(), // Here we set the value of the type
      });

      // Then we want to push the new URL to the router:
      router.push(newUrl, { scroll: false });
    }
  };

  return (
    <div className="flex items-center gap-5 px-5">
      <p className="text-dark400_light900 body-medium">Type:</p>
      <div className="flex gap-3">
        {GlobalSearchFilters.map((item) => (
          <Button
            type="button"
            key={item.value}
            className={`light-border-2 small-medium rounded-2xl px-5 py-2 capitalize dark:text-light-800 dark:hover:text-primary-500 ${active === item.value ? "bg-primary-500 text-light-900" : "bg-light-700 text-dark-400 hover:text-primary-500 dark:bg-dark-500"}`} // We need to set the active filter to the active state
            onClick={() => handleTypeClick(item.value)}
          >
            {item.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default GlobalFilters;
