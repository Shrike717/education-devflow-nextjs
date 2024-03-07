"use client";
import { HomePageFilters } from "@/constants/filters";
import { Button } from "../ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { formUrlQuery } from "@/lib/utils";

const HomeFilters = () => {
  // For the filter functionality we first have to makke use o the searchParams. Cause we are in a client side component we can use the useSearchParams hook
  const searchParams = useSearchParams();
  // We need the router to push the new URL to the browser
  const router = useRouter();

  // Local state to keep track of the active filter
  const [active, setActive] = useState("");

  // On click on a button we have to update the url and set the active state.
  const handleTypeClick = (item: string) => {
    // Here we bild the new URL with the formUrlQuery function
    if (active === item) {
      // We set the active state when clicked on the button. If the active state is already set, we want to remove it
      setActive("");

      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "filter",
        value: null, // When the filter is active and we click on it again, we want to remove the filter from the URL. Toggle
      });

      // Then we want to push the new URL to the browser:
      router.push(newUrl, { scroll: false });
    } else {
      // We set the active state when clicked on the button
      setActive(item);

      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "filter",
        value: item.toLowerCase(), // Here we set the value of the filter
      });

      // Then we want to push the new URL to the router:
      router.push(newUrl, { scroll: false });
    }
  };

  return (
    <div className="mt-10 flex-wrap gap-3 md:flex">
      {HomePageFilters.map((item) => (
        <Button
          key={item.value}
          // Wir geben dem Button unterschiedliche Klassen, je nachdem ob er aktiv ist oder nicht
          className={`body-medium rounded-lg px-6 py-3 capitalize shadow-none
          ${
            active === item.value
              ? "bg-primary-100 text-primary-500"
              : "bg-light-800 text-light-500 dark:bg-dark-300 dark:text-light-500"
          }`}
          onClick={() => handleTypeClick(item.value)} // On click we want to call the handleTypeClick function and pass the value of the button
        >
          {item.name}
        </Button>
      ))}
    </div>
  );
};

export default HomeFilters;
