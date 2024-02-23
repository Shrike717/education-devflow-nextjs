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
    const { questionId } = params;

    const answers = await Answer.find({ question: questionId })
      .populate({
        path: "author",
        model: User,
        select: "_id clerkId name picture",
      })
      .sort({ createdAt: -1 });

    return { answers };
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
