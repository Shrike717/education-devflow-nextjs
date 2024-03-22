import { getUserAnswers } from "@/lib/actions/user.action";
import { SearchParamsProps } from "@/types";
import AnswerCard from "../cards/AnswerCard";
import Pagination from "./Pagination";

interface Props extends SearchParamsProps {
  userId: string;
  clerkId?: string | null;
}

const AnswerTab = async ({ searchParams, userId, clerkId }: Props) => {
  // Fetching the user's answers:
  const result = await getUserAnswers({
    userId,
    page: searchParams.page ? +searchParams.page : 1, // The page number is taken from the URL query parameter. +searchParams.page is changing it to a number. If it's not there, the default value is 1.
  });

  return (
    <>
      {result.answers.map((answer) => (
        <AnswerCard
          key={answer._id}
          clerkId={clerkId}
          _id={answer._id}
          question={answer.question}
          author={answer.author}
          upvotes={answer.upvotes}
          createdAt={answer.createdAt}
        />
      ))}

      {/* Pagination */}
      <div className="mt-10">
        <Pagination
          pageNumber={searchParams.page ? +searchParams.page : 1} // The page number is taken from the URL query parameter. If it's not there, the default value is 1.
          isNext={result.isNextAnswers} // The isNext prop is taken from the result object. It's a boolean value that tells us if there are more questions to show.
        />
      </div>
    </>
  );
};

export default AnswerTab;
