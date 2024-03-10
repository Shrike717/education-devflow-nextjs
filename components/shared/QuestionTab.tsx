import { getUserQuestions } from "@/lib/actions/user.action";
import { SearchParamsProps } from "@/types";
import QuestionCard from "../cards/QuestionCard";
import Pagination from "./Pagination";

interface Props extends SearchParamsProps {
  userId: string;
  clerkId?: string | null;
}

const QuestionTab = async ({ searchParams, userId, clerkId }: Props) => {
  // Fetching the user's questions:
  const result = await getUserQuestions({
    userId,
    page: searchParams.page ? +searchParams.page : 1, // The page number is taken from the URL query parameter. +searchParams.page is changing it to a number. If it's not there, the default value is 1.
  });

  return (
    <>
      {result.questions.map((question) => (
        <QuestionCard // Reusable Component QuestionCard
          key={question._id}
          _id={question._id}
          clerkId={clerkId}
          title={question.title}
          tags={question.tags}
          author={question.author}
          upvotes={question.upvotes}
          views={question.views}
          answers={question.answers}
          createdAt={question.createdAt}
        />
      ))}

      {/* Pagination */}
      <div className="mt-10">
        <Pagination
          pageNumber={searchParams.page ? +searchParams.page : 1} // The page number is taken from the URL query parameter. If it's not there, the default value is 1.
          isNext={result.isNextQuestions} // The isNext prop is taken from the result object. It's a boolean value that tells us if there are more questions to show.
        />
      </div>
    </>
  );
};

export default QuestionTab;
