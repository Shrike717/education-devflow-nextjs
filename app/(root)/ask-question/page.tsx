import Question from "@/components/forms/Question";
import { getUserById } from "@/lib/actions/user.action";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";

const Page = async () => {
  // We have to extract the clerk userId to pass it to the question form
  //   const { userId } = auth();

  // Temporarily faking  the Clerk userId to match the mocked user in the database
  const userId = "123456";

  // If the user is not logged in, we redirect him to the Sign in page:
  if (!userId) redirect("/sign-in");

  // Now we get the user from the database by calling the server action and passing the clerk userId
  const mongoUser = await getUserById({ userId });

  //   console.log("[ask-question Page] mongoUser:", mongoUser);

  return (
    <div>
      <h1 className="h1-bold text-dark100_light900 ">Ask a question</h1>
      <div className="mt-9">
        <Question mongoUser={JSON.stringify(mongoUser._id)} />
      </div>
    </div>
  );
};

export default Page;
