"use client";
import React from "react";
import { Button } from "../ui/button";
import { formUrlQuery } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  pageNumber: number;
  isNext: boolean;
}

const Pagination = ({ pageNumber, isNext }: Props) => {
  // Geting the searchParams:
  const searchParams = useSearchParams();
  // And the router:
  const router = useRouter();

  // The handleNavigation function
  const handleNavigation = (direction: string) => {
    //  First we have to figure out:  Where are we going? Forwards or backwards?
    const nextPageNumber =
      direction === "prev" ? pageNumber - 1 : pageNumber + 1;

    // Then we have to update the URL query parameter
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "page",
      value: nextPageNumber.toString(),
    });

    // And finally, we have to push the new URL to the browser
    router.push(newUrl);
  };

  // Conditional rendering of the Pagination component so that it is only shown when there are more than one page of documents to show.
  if (pageNumber === 1 && !isNext) return null;

  return (
    <div className="flex w-full items-center justify-center gap-2">
      <Button
        disabled={pageNumber === 1} // This is the condition for the disabled state of the Prev button. If the page number is 1, we can't go back anymore.
        onClick={() => handleNavigation("prev")}
        className="light-border-2 btn flex min-h-[36px] items-center justify-center gap-2 border"
      >
        <p className="body-medium text-dark200_light800">Prev</p>
      </Button>
      <div className="flex items-center justify-center rounded-md bg-primary-500 px-3.5 py-2">
        <p className="body-semibold text-light-900">{pageNumber}</p>
      </div>
      <Button
        disabled={!isNext} // This is the condition for the disabled state of the Next button. If there are no more pages with questions to show, we can't go forward anymore.
        onClick={() => handleNavigation("next")}
        className="light-border-2 btn flex min-h-[36px] items-center justify-center gap-2 border"
      >
        <p className="body-medium text-dark200_light800">Next</p>
      </Button>
    </div>
  );
};

export default Pagination;
