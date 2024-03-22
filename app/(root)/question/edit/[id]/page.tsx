import Question from "@/components/forms/Question";
import { getQuestionById } from "@/lib/actions/question.action";
import { getUserById } from "@/lib/actions/user.action";
import { ParamsProps } from "@/types";
import { auth } from "@clerk/nextjs";

const Page = async ({ params }: ParamsProps) => {
  // To get our mogoUser we first need to get the clerk userId:
  const { userId } = auth();

  if (!userId) return null;

  // Then geting the user from the database by calling the server action and passing the clerk userId:
  const mongoUser = await getUserById({ userId });

  //   console.log("[edit-question Page] mongoUser:", mongoUser);

  // Then we need too get the question details to be edited:
  const result = await getQuestionById({ questionId: params.id });

  return (
    <>
      <h1 className="h1-bold text-dark100_light900 ">Edit Question</h1>

      <div className="mt-9">
        <Question
          type="edit"
          mongoUserId={mongoUser ? JSON.stringify(mongoUser._id) : null} // We need to know which user is editing the question:
          questionDetails={JSON.stringify(result)} // We need all the details of the question to be edited:
        />
      </div>
    </>
  );
};

export default Page;
