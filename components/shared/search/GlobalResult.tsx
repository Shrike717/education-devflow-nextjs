"use client";
import React, { useEffect, useState } from "react";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import GlobalFilters from "./GlobalFilters";
import { globalSearch } from "@/lib/actions/general.action";

// This is the main component that will show the search result. It is a modal that will appear below the navbar‚
const GlobalResult = () => {
  const searchParams = useSearchParams(); // We need to know what  we are searching for. This comes from searchParams of the url
  const [isLoading, setisLoading] = useState(false); // We need to show a loader during data fetch process
  // This will be the data we want to show
  const [result, setResult] = useState([
    { type: "question", id: 1, title: "Next.js question" }, // Fake data to style the UI before we get the real data
    { type: "tag", id: 1, title: "Nextjs " },
    { type: "user", id: 1, title: "user1" },
  ]);

  // Then we can extract 2 params from the searchParams::
  const global = searchParams.get("global");
  const type = searchParams.get("type"); // The type is or the filter we want to apply

  // This is the main function that will fetch the data from the server when global or type changes
  useEffect(() => {
    const fetchResult = async () => {
      setResult([]); // First We need to clear the previous result
      setisLoading(true); // And We need to show the loader

      try {
        // This call fetches all the needed data from everywhere  all at once
        const res = await globalSearch({ query: global, type });

        // After we get the data, we can set the result in the state
        setResult(JSON.parse(res));
        // console.log("[GlobalResult] res: ", res);
      } catch (error) {
        console.log(error);
        throw error;
      } finally {
        setisLoading(false); // We need to hide the loader
      }
    };

    // If we do have the global search, we have to call the fetchResult function
    if (global) {
      fetchResult();
    }
  }, [global, type]);

  // This function has to build the links as an url that points to a certain global search result based on the filter type:
  const renderLink = (type: string, id: string) => {
    switch (type) {
      case "question":
        return `/question/${id}`;
      case "answer":
        return `/question/${id}`;
      case "user":
        return `/profile/${id}`;
      case "tag":
        return `/tags/${id}`;
      default:
        return "/";
    }
  };

  return (
    // This is one of the rare occasions where to use absolute positioning! Modal has to appear below the navbar
    <div className="absolute top-full z-10 mt-3 w-full rounded-xl bg-light-800 py-5 shadow-sm dark:bg-dark-400">
      <div className="text-dark400_light900 paragraph-semibold px-5">
        <GlobalFilters />
      </div>
      <div className="my-5 h-[1px] bg-light-700/50 dark:bg-dark-500/50" />
      <div className="space-y-5">
        <p className="text-dark400_light900 paragraph-semibold px-5">
          Top Match
        </p>

        {/* We need to show a loader during data fetch process */}
        {isLoading ? (
          <div className="flex-center flex-col px-5">
            {/* animate-spin atomatically spins it */}
            <ReloadIcon className="my-2 size-10 animate-spin text-primary-500" />
            <p className="text-dark200_light800 body-regular">
              Browsing the entire database
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {result.length > 0 ? (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              result.map((item: any, index: number) => (
                <Link
                  href={renderLink(item.type, item.id)}
                  key={item.type + item.id + index} // To make sure the key is unique we merge the type and id with the index
                  className="flex w-full cursor-pointer items-start gap-3 px-5 py-2.5 hover:bg-light-700/50 hover:dark:bg-dark-500/50"
                >
                  <Image
                    src="/assets/icons/tag.svg"
                    alt="tag"
                    width={18}
                    height={18}
                    className="invert-colors mt-1 object-contain"
                  />

                  <div className="flex flex-col">
                    <p className="body-medium text-dark200_light800 line-clamp-1">
                      {item.title}
                    </p>
                    <p className="text-light400_light500 small-medium mt-1 font-bold capitalize">
                      {item.type}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex-center flex-col px-5">
                <p className="text-dark200_light800 body-regular px-5 py-2.5">
                  Ooops, no results found
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalResult;
