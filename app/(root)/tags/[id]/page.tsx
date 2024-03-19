import QuestionCard from "@/components/cards/QuestionCard";
import NoResult from "@/components/shared/NoResult";
import Pagination from "@/components/shared/Pagination";
import LocalSearchbar from "@/components/shared/search/LocalSearchbar";
import { IQuestion } from "@/database/question.model";
import { getQuestionsByTagId } from "@/lib/actions/tag.action";
import { URLProps } from "@/types";
import React from "react";
import Loading from "./loading";

const Page = async ({ params, searchParams }: URLProps) => {
  // First we load the questions related to the tag:
  const result = await getQuestionsByTagId({
    tagId: params.id,
    searchQuery: searchParams.q, // q as in query
    page: searchParams.page ? +searchParams.page : 1, // The page number is taken from the URL query parameter. +searchParams.page is changing it to a number. If it's not there, the default value is 1.
  });

  // Fake loading variable to simulate loading state
  //   const isLoading = true;

  //   if (isLoading) return <Loading />;

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">{result.tagTitle}</h1>

      <div className="mt-11 w-full">
        {/* Reusable Compnent */}
        <LocalSearchbar
          route={`/tags/${params.id}`}
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="Search tag questions"
          otherClasses="flex-1"
        />
      </div>

      <div className="mt-10 flex w-full flex-col gap-6">
        {result.questions.length > 0 ? (
          result.questions.map((question: IQuestion) => (
            <QuestionCard // Reusable Component QuestionCard
              key={question._id}
              _id={question._id}
              title={question.title}
              tags={question.tags}
              author={question.author}
              upvotes={question.upvotes}
              views={question.views}
              answers={question.answers}
              createdAt={question.createdAt}
            />
          ))
        ) : (
          <NoResult // Reusable Component NoResult
            title="There's no tag questions to show"
            description="Be the first one to ask a question by clicking the button below 🚀"
            link="/ask-question"
            linkTitle="Ask a Question"
          />
        )}
      </div>

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
