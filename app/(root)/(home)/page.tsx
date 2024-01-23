import QuestionCard from "@/components/cards/QuestionCard";
import HomeFilters from "@/components/home/HomeFilters";
import Filter from "@/components/shared/Filter";
import NoResult from "@/components/shared/NoResult";
import LocalSearchbar from "@/components/shared/search/LocalSearchbar";
import { Button } from "@/components/ui/button";
import { HomePageFilters } from "@/constants/filters";
import Link from "next/link";

// Vorübergehender Dummy Content for Questions:
const questions = [
  {
    _id: "1",
    title: "How to use React Query?",
    tags: [
      { _id: 1, name: "React" },
      { _id: 2, name: "React Query" },
    ],
    author: {
      _id: "author1",
      name: "John Doe",
      picture: "https://example.com/johndoe.jpg",
    },
    upvotes: 1500,
    views: 500600,
    answers: [{}, {}, {}], // Assuming answers is an array of objects
    createdAt: new Date("2024-01-02T15:51:50.000Z"),
  },
  {
    _id: "2",
    title: "How can I center a div?",
    tags: [
      { _id: 1, name: "Css" },
      { _id: 2, name: "Tailwind" },
    ],
    author: {
      _id: "author2",
      name: "John Smith",
      picture: "https://example.com/johndoe.jpg",
    },
    upvotes: 10,
    views: 100,
    answers: [{}, {}], // Assuming answers is an array of objects
    createdAt: new Date("2023-12-02T15:51:50.000Z"),
  },
];

export default function Home() {
  return (
    <>
      {/* flex-col-reverse: Auf kleinen Devices wird der Button vor der Schrift angezeigt */}
      <div className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>

        <Link
          href="/ask-question"
          className="flex justify-end max-sm:min-w-full"
        >
          <Button className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900">
            Ask a Question
          </Button>
        </Link>
      </div>

      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        {/* Reusable Compnent */}
        <LocalSearchbar
          route="/"
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="Search for questions"
          otherClasses="flex-1"
        />
        {/* Reusable Compnent Filter Select */}
        <Filter
          filters={HomePageFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
          containerClasses="hidden max-md:flex"
        />
      </div>

      {/* Compnent für Filter Tags auf grossen Screens */}
      <HomeFilters />

      <div className="mt-10 flex w-full flex-col gap-6">
        {questions.length > 0 ? (
          questions.map((question) => (
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
            title="There's no question to show"
            description="Be the first one to ask a question by clicking the button below 🚀"
            link="/ask-question"
            linkTitle="Ask a Question"
          />
        )}
      </div>
    </>
  );
}
