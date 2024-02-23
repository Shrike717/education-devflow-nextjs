"use server";

import Question from "@/database/question.model";
import { connectToDatabase } from "../mongoose";
import {
  CreateQuestionParams,
  DeleteQuestionParams,
  GetQuestionByIdParams,
  GetQuestionsParams,
  QuestionVoteParams,
} from "./shared.types";
import Tag from "@/database/tag.model";
import User from "@/database/user.model";
import { revalidatePath } from "next/cache";
import Answer from "@/database/answer.model";
import Interaction from "@/database/interaction.model";

// Here we have all the actions for the questions model:

export async function getQuestions(params: GetQuestionsParams) {
  try {
    connectToDatabase();

    const questions = await Question.find({})
      .populate({ path: "tags", model: Tag }) // We populate all tag properties to the question.
      .populate({ path: "author", model: User }) // We populate all user properties to the question.
      .sort({ createdAt: -1 }); // We sort the questions by createdAt in descending order.

    return { questions };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getQuestionById(params: GetQuestionByIdParams) {
  try {
    connectToDatabase();

    const { questionId } = params;

    const question = await Question.findById(questionId)
      // We populate all other needed properties from the references we have in the model to the question.
      .populate({ path: "tags", model: Tag, select: "_id name" }) // We populate selected tag properties to the question.
      .populate({
        path: "author",
        model: User,
        select: "_id clerkId name picture",
      }); // We populate selected tag properties to the question.

    return question;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function createQuestion(params: CreateQuestionParams) {
  //   console.log("[createQuestion] params:", params);
  try {
    // Connect to the database:
    await connectToDatabase();

    // Then we have to destruct the params:
    // path is URL that has to be reloaded after the question is created. Next has to know that something has changed.
    const { title, content, tags, author, path } = params;

    // Create the question:
    const question = await Question.create({
      title,
      content,
      author,
    });

    // Add the tags to the question:
    const tagDocuments = [];

    // Create the tags or get them if they already exist:
    for (const tag of tags) {
      // Check if the tag already exists:
      const existingTag = await Tag.findOneAndUpdate(
        // The first argument allows us to find the tag:
        // Whenever we have to find sth. more complex we can use the $regex operator. i means case insensitive.
        { name: { $regex: new RegExp(`^${tag}$`, "i") } },
        // The second argument allows us to do sth with the tag: $setOnInsert allows us to set the name of the tag and $push allows us to add the question to the questions array.
        { $setOnInsert: { name: tag }, $push: { questions: question._id } },
        // The third argument allows us to create the tag if it doesn't exist:
        { upsert: true, new: true }
      );
      tagDocuments.push(existingTag._id);
    }

    // Add the tags to the question:
    await Question.findByIdAndUpdate(question._id, {
      // For each tag document we push the id to the tags array:
      $push: { tags: { $each: tagDocuments } },
    });

    // We need to create an interaction record for the users ask_question action. We want to track that this user created that question.

    // And  then we want to increment authors reputation by 5 points for creating a question:

    // This mechanism shows the new question without reloading the homepage:
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function deleteQuestion(params: DeleteQuestionParams) {
  try {
    // Connect to the database:
    await connectToDatabase();

    // Then we have to destructure the params:
    const { questionId, path } = params; // path is URL that has to be reloaded after the question is deleted. Next has to know that something has changed.

    // We have to delete the question:
    await Question.deleteOne({ _id: questionId });
    // Then we have to delete all answers that belong to the question:
    await Answer.deleteMany({ question: questionId });
    // Then we have to delete all interactions that belong to the question:
    await Interaction.deleteMany({ question: questionId });

    // Then we want to update thhe tags to n longer include references to the deleted question:
    await Tag.updateMany(
      { questions: questionId }, // Which question
      { $pull: { questions: questionId } } // Remove the question from the questions array
    );

    // Finally we have to revalidate the path so that the frontend UI actually shows the updated questions:
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// VOTING ACTIONS:

// We need to know: Who voted? What was voted? And on what question did they vote?
// We need to know if the user already voted on the question. If they did we have to toggle the vote.
export async function upvoteQuestion(params: QuestionVoteParams) {
  try {
    // Connect to the database:
    await connectToDatabase();

    // Then we have to destructure the params:
    const { questionId, userId, hasupVoted, hasdownVoted, path } = params;

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

    // Then We have to update the question based on the updateQuery:
    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    });

    // Check:
    if (!question) {
      throw new Error("Question not found");
    }

    // TODO: We want to increment the authors reputation for upvoting a question.

    // Finally we have to revalidate the path so that the frontend UI actually shows the updated question:
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// We need to know: Who voted? What was voted? And on what question did they vote?
// We need to know if the user already voted on the question. If they did we have to toggle the vote.
export async function downvoteQuestion(params: QuestionVoteParams) {
  try {
    // Connect to the database:
    await connectToDatabase();

    // Then we have to destructure the params:
    const { questionId, userId, hasupVoted, hasdownVoted, path } = params;

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
    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    });

    // Check:
    if (!question) {
      throw new Error("Question not found");
    }

    // TODO: We want to increment the authors reputation for upvoting a question.

    // Finally we have to revalidate the path so that the frontend UI actually shows the updated question:
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
