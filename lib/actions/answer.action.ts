"use server";

import Answer from "@/database/answer.model";
import { connectToDatabase } from "../mongoose";
import {
  AnswerVoteParams,
  CreateAnswerParams,
  DeleteAnswerParams,
  GetAnswersParams,
} from "./shared.types";
import Question from "@/database/question.model";
import { revalidatePath } from "next/cache";
import User from "@/database/user.model";
import Interaction from "@/database/interaction.model";

export async function createAnswer(params: CreateAnswerParams) {
  try {
    connectToDatabase();

    const { content, author, question, path } = params;

    const newAnswer = await Answer.create({
      content,
      author,
      question,
    });

    // Add answer to the questions answers array:
    await Question.findByIdAndUpdate(question, {
      $push: { answers: newAnswer._id },
    });

    // TODO: Add interaction....

    revalidatePath(path); // We revalidate the path to update the cache. This will cause the page to be revalidated and updated.
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// VOTING ACTIONS:

// We need to know: Who voted? What was voted? And on what answer did they vote?
// We need to know if the user already voted on the answer. If they did we have to toggle the vote.
export async function upvoteAnswer(params: AnswerVoteParams) {
  try {
    // Connect to the database:
    await connectToDatabase();

    // Then we have to destructure the params:
    const { answerId, userId, hasupVoted, hasdownVoted, path } = params;

    // Based on the params we have to make the upvote query:
    let updateQuery = {};

    if (hasupVoted) {
      // If the user has already upvoted we have to remove the upvote:
      updateQuery = {
        $pull: { upvotes: userId },
      };
    } else if (hasdownVoted) {
      updateQuery = {
        // If the user has downvoted we have to remove the downvote and add the upvote.
        $pull: { downvotes: userId },
        $push: { upvotes: userId },
      };
    } else {
      updateQuery = {
        $addToSet: { upvotes: userId }, // If the user hasn't voted yet we have to add the upvote.
      };
    }

    // Then We have to update the answer based on the updateQuery:
    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    });

    // Check:
    if (!answer) {
      throw new Error("Answer not found");
    }

    // TODO: We want to increment the authors reputation for upvoting a question.

    // Finally we have to revalidate the path so that the frontend UI actually shows the updated question:
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// We need to know: Who voted? What was voted? And on what answer did they vote?
// We need to know if the user already voted on the answer. If they did we have to toggle the vote.
export async function downvoteAnswer(params: AnswerVoteParams) {
  try {
    // Connect to the database:
    await connectToDatabase();

    // Then we have to destructure the params:
    const { answerId, userId, hasupVoted, hasdownVoted, path } = params;

    // Based on the params we have to make the upvote query:
    let updateQuery = {};

    if (hasdownVoted) {
      // If the user has already downvoted we have to remove the downvote:
      updateQuery = {
        $pull: { downvotes: userId },
      };
    } else if (hasupVoted) {
      updateQuery = {
        // If the user has upvoted we have to remove the downvote and add the upvote.
        $pull: { upvotes: userId },
        $push: { downvotes: userId },
      };
    } else {
      updateQuery = {
        $addToSet: { downvotes: userId }, // If the user hasn't voted yet we have to add the downvote.
      };
    }

    // Then We have to update the question based on the updateQuery:
    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    });

    // Check:
    if (!answer) {
      throw new Error("Answer not found");
    }

    // TODO: We want to increment the authors reputation for upvoting a question.

    // Finally we have to revalidate the path so that the frontend UI actually shows the updated question:
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getAnswers(params: GetAnswersParams) {
  try {
    connectToDatabase();

    // We need to destructure the questionId from the params object for which we want to get the answers.
    const { questionId, sortBy, page = 1, pageSize = 5 } = params;

    // Pagination: First we have to calculate the number of documents to skip based on the page number and the page size:
    const skipAmount = (page - 1) * pageSize; // Example: If we are on page 2 and the page size is 20, we have to skip 20 documents. (20 * (2 - 1) = 20 * 1 = 20)

    // If we have a filter we have to filter the answers by the filter. We initialize the sortOptions object:
    let sortOptions = {};

    // Then setting the switch statement for the filter:
    switch (sortBy) {
      case "highestUpvotes":
        sortOptions = { upvotes: -1 }; // Sort the answers by upvotes in descending order
        break;
      case "lowestUpvotes":
        sortOptions = { upvotes: 1 }; // Sort the answers by upvotes in ascending order
        break;
      case "recent":
        sortOptions = { createdAt: -1 }; // Sort the answers by createdAt in descending order
        break;
      case "old":
        sortOptions = { createdAt: 1 }; // Sort the answers by createdAt in ascending order
        break;

      default:
        break;
    }

    const answers = await Answer.find({ question: questionId })
      .populate({
        path: "author",
        model: User,
        select: "_id clerkId name picture",
      })
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    // Pagination: We have to calculate if there are more pages with answers to show:
    const totalAnswers = await Answer.countDocuments({
      question: questionId, // We have to count the number of answers for the question we are interested in.
    });

    const isNextAnswers = totalAnswers > skipAmount + answers.length; // If the total number of answers is greater than the page number times the page size there are more answers to show.

    return { answers, isNextAnswers };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function deleteAnswer(params: DeleteAnswerParams) {
  try {
    // Connect to the database:
    await connectToDatabase();

    // Then we have to destructure the params:
    const { answerId, path } = params; // path is URL that has to be reloaded after the answer is deleted. Next has to know that something has changed.

    // First we have to find the answer. Why? To remove its existence from everywhere else.
    const answer = await Answer.findById(answerId);

    if (!answer) {
      throw new Error("Answer not found");
    }

    // Then we have to delete the answer
    await Answer.deleteOne({ _id: answerId });

    // Then we want to update the question to n longer include references to the deleted answer:
    await Question.updateMany(
      { _id: answer.question }, // Which answer
      { $pull: { answers: answerId } } // Remove the answer from the questions array
    );

    // Then we have to delete all interactions that belong to the question:
    await Interaction.deleteMany({ answer: answerId });

    // Finally we have to revalidate the path so that the frontend UI actually shows the updated questions:
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
