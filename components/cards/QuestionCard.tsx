import Link from "next/link";
import React from "react";
import RenderTag from "../shared/RenderTag";
import Metric from "../shared/Metric";
import { formatBigNumber, getTimestamp } from "@/lib/utils";
import { SignedIn } from "@clerk/nextjs";
import EditDeleteAction from "../shared/EditDeleteAction";

interface QuestionProps {
  clerkId?: string | null;
  _id: string;
  title: string;
  tags: {
    _id: string;
    name: string;
  }[];
  author: {
    _id: string;
    name: string;
    picture: string; // url
    clerkId: string;
  };
  upvotes: string[];
  views: number;
  answers: Array<object>;
  createdAt: Date;
}

const QuestionCard = ({
  clerkId,
  _id,
  title,
  tags,
  author,
  upvotes,
  views,
  answers,
  createdAt,
}: QuestionProps) => {
  // We check if the user is signed in and if the user is the author of the question. If so, we show the edit and delete button in the Profile page.
  const showActionButtons = clerkId && clerkId === author.clerkId;

  return (
    <div className="card-wrapper rounded-[10px] p-9 sm:px-11 ">
      <div className="flex flex-col-reverse items-start justify-between gap-5 sm:flex-row">
        <div>
          <span className="subtle-regular text-dark400_light700 line-clamp-1 flex sm:hidden">
            {getTimestamp(createdAt)}
          </span>
          <Link href={`/question/${_id}`}>
            {/* line-clamp-1: Damit kann ich die Anzahl der Zeilen definieren, die gezeigt werden sollen! Danach bei längerem Text drei Punkte. So bleiben die Cards gleich. */}
            <h3 className="sm:h3-semibold base-semibold text-dark200_light900 line-clamp-1 flex-1">
              {title}
            </h3>
          </Link>
        </div>

        {/* Only shows if user is signed in */}
        <SignedIn>
          {showActionButtons && (
            <EditDeleteAction type="Question" itemId={JSON.stringify(_id)} /> // itemId: The id  of the item (here: question) that we want to edit or delete
          )}
        </SignedIn>
      </div>

      <div className="mt-3.5 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <RenderTag
            key={tag._id.toString()}
            _id={tag._id.toString()}
            name={tag.name}
          />
        ))}
      </div>

      <div className="flex-between mt-6 w-full flex-wrap gap-3">
        <Metric // Reusable Component für die kleinen Icons und Texte unten
          imgUrl={author?.picture}
          alt="user"
          value={author?.name}
          title={` - asked ${getTimestamp(createdAt)}`}
          href={author?._id ? `/profile/${author._id}` : '#'}
          isAuthor
          textStyles="body-medium text-dark400_light700"
        />
        <div className="flex items-center gap-3 max-sm:flex-wrap max-sm:justify-start">
          <Metric
            imgUrl="/assets/icons/like.svg"
            alt="upvotes"
            value={formatBigNumber(upvotes.length)}
            title=" Votes"
            textStyles="small-medium text-dark400_light800"
          />
          <Metric
            imgUrl="/assets/icons/message.svg"
            alt="message"
            value={formatBigNumber(answers.length)}
            title=" Answers"
            textStyles="small-medium text-dark400_light800"
          />
          <Metric
            imgUrl="/assets/icons/eye.svg"
            alt="eye"
            value={formatBigNumber(views)}
            title=" Views"
            textStyles="small-medium text-dark400_light800"
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
