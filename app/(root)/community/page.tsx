import UserCard from "@/components/cards/UserCard";
import Filter from "@/components/shared/Filter";
import Pagination from "@/components/shared/Pagination";
import LocalSearchbar from "@/components/shared/search/LocalSearchbar";
import { UserFilters } from "@/constants/filters";
import { getAllUsers } from "@/lib/actions/user.action";
import { SearchParamsProps } from "@/types";
import Link from "next/link";
// import Loading from "./loading";
import type { Metadata } from "next";

// This is the metadata for the page
export const metadata: Metadata = {
  title: "Community | DevFlow",
  description: `A community of amazing minds. Join us to ask and answer programming questions.`,
};

const Page = async ({
  searchParams,
}: SearchParamsProps): Promise<JSX.Element> => {
  // Fetching all users from the database. Therefore component is async:
  const result = await getAllUsers({
    searchQuery: searchParams.q,
    filter: searchParams.filter,
    page: searchParams.page ? +searchParams.page : 1, // The page number is taken from the URL query parameter. +searchParams.page is changing it to a number. If it's not there, the default value is 1.
  });

  // Fake loading variable to simulate loading state
  //   const isLoading = true;

  //   if (isLoading) return <Loading />;

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">All Users</h1>

      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        {/* Reusable Compnent */}
        <LocalSearchbar
          route="/community"
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="Search for amazing minds"
          otherClasses="flex-1"
        />
        {/* Reusable Compnent Filter Select */}
        <Filter
          filters={UserFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
        />
      </div>

      {/* Sectin to show users */}
      <section className="mt-12 flex flex-wrap gap-4">
        {result.users.length > 0 ? (
          result.users.map((user) => <UserCard key={user._id} user={user} />)
        ) : (
          <div className="paragraph-regular text-dark200_light800 mx-auto max-w-4xl text-center">
            <p>No users yet</p>
            <Link href="/sign-up" className="mt-2 font-bold text-accent-blue">
              Join to be the first!
            </Link>
          </div>
        )}
      </section>

      {/* Here is the Pagination component */}
      <div className="mt-10">
        <Pagination
          pageNumber={searchParams.page ? +searchParams.page : 1} // The page number is taken from the URL query parameter. If it's not there, the default value is 1.
          isNext={result.isNext} // The isNext prop is taken from the result object. It's a boolean value that tells us if there are more questions to show.
        />
      </div>
    </>
  );
};

export default Page;
