"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formUrlQuery } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  filters: {
    name: string;
    value: string;
  }[]; // Das bedeutet: ein Array mit Objekten
  otherClasses?: string;
  containerClasses?: string;
}

const Filter = ({ filters, otherClasses, containerClasses }: Props) => {
  // We need to make use to the searchParams to update the url with the new filter
  const searchParams = useSearchParams();
  const router = useRouter(); // We need to use the router to push the new url with the new filter to the browser

  // Here we declare the params Filter:
  const paramsFilter = searchParams.get("filter"); // This works like a state or the filter

  // This function will update the url with the new filter from the select dropdown
  const handleUpdateParams = (value: string) => {
    // We are building the new url with the new filter
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "filter",
      value,
    });

    // We are pushing the new url to the browser
    router.push(newUrl, { scroll: false });
  };

  return (
    <div className={`relative ${containerClasses}`}>
      <Select
        onValueChange={(value) => handleUpdateParams(value)} // This function will update the url with the new filter from the select dropdown
        defaultValue={paramsFilter || undefined} // This is the default value of the select dropdown
      >
        <SelectTrigger
          className={`${otherClasses} body-regular light-border background-light800_dark300 text-dark500_light700 border px-5 py-2.5`}
        >
          {/* line-clamp-1: Appliziert automatisch hidden und webkit Einstellungen */}
          <div className="line-clamp-1 flex-1 text-left">
            <SelectValue placeholder="Select a Filter" />
          </div>
        </SelectTrigger>
        <SelectContent className="text-dark500_light700 small-regular border-none bg-light-900 dark:border-dark-400 dark:bg-dark-300">
          {/* Wir verwenden SelectGroup um die Items rein zumappen */}
          <SelectGroup>
            {filters.map((item) => (
              <SelectItem
                key={item.value}
                value={item.value}
                className="cursor-pointer focus:bg-light-800 dark:focus:bg-dark-400"
              >
                {item.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default Filter;
