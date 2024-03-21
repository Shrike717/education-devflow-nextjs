import Profile from "@/components/forms/Profile";
import { getUserById } from "@/lib/actions/user.action";
import { ParamsProps } from "@/types";
import { auth } from "@clerk/nextjs";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Page = async ({ params }: ParamsProps) => {
  // To get our mogoUser we first need to get the clerk userId:
  const { userId } = auth();

  if (!userId) return null;

  // Then geting the user from the database by calling the server action and passing the clerk userId:
  const mongoUser = await getUserById({ userId });

  return (
    <>
      <h1 className="h1-bold text-dark100_light900 ">Edit Profile</h1>

      <div className="mt-9">
        <Profile
          clerkId={userId} // We need the clerkId to update the user in the database
          user={JSON.stringify(mongoUser)} // We pass the user object to the Profile component as a string. Not possible to pass objects directly
        />
      </div>
    </>
  );
};

export default Page;
