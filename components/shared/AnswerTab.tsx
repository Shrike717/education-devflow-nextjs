import { SearchParamsProps } from "@/types";

interface Props extends SearchParamsProps {
  userId: string;
  clerkId?: string | null;
}

const AnswerTab = async ({ searchProps, userId, clerkId }: Props) => {
  return <div>AnswerTab</div>;
};

export default AnswerTab;
