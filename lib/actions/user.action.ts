"use server";

import User, { IUser } from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  GetSavedQuestionsParams,
  GetUserByIdParams,
  GetUserStatsParams,
  ToggleSaveQuestionParams,
  UpdateUserParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";
import Tag from "@/database/tag.model";
import { FilterQuery } from "mongoose";
import Answer from "@/database/answer.model";

// Here we have all the actions for the users model:

// GET ONE USER BY ID
export async function getUserById(
  params: GetUserByIdParams
): Promise<IUser | null> {
  //   console.log("[getUserById] params:", params);
  try {
    // Connect to the database:
    await connectToDatabase();

    // Then we have to destructure the params:
    const { userId } = params;

    // Get the user. We use findOne because we want to find one user. We want to find the user by the clerkId:
    const user = await User.findOne({ clerkId: userId });

    // Return the user:
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// CREATE A USER
export async function createUser(userData: CreateUserParams): Promise<IUser> {
  try {
    // Connect to the database:
    await connectToDatabase();

    // Create the user:
    const newUser = await User.create(userData);

    // Return the user:
    return newUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// UPDATE A USER
export async function updateUser(
  params: UpdateUserParams
): Promise<IUser | void> {
  // Delete void when we return a user later
  try {
    // Connect to the database:
    await connectToDatabase();

    // Then we have to destructure the params:
    const { clerkId, updateData, path } = params;

    // Update the user:
    await User.findOneAndUpdate(
      { clerkId }, // We want to find the user by the clerkId
      updateData, // Then We want to update the user with the updatedData
      { new: true }
    );

    // We have to let Next which page has to be regenerated after the user is updated
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// DELETE A USER
export async function deleteUser(params: DeleteUserParams): Promise<IUser> {
  try {
    // Connect to the database:
    await connectToDatabase();

    // Then we have to destructure the params:
    const { clerkId } = params;

    // Find the user:
    const user = await User.findById({ clerkId }); // We want to find the user by the clerkId

    if (!user) {
      throw new Error("User not found");
    }

    //  We have to delete the user from the database:
    // And everything related to the user like the questions, answers, comments, votes, etc

    // We delete the questions of the user:
    // Get user's questions ids:
    const userQuestionsIds = await Question.find({ author: user._id }).distinct(
      "_id"
    ); //  Creates a distinct query: returns the distinct values of the given field that match filter.
    console.log("userQuestionsIds:", userQuestionsIds);

    // Delete the questions:
    await Question.deleteMany({ author: user._id });

    // TODO: Delete the answers, comments of the user

    // Finally we delete the user:
    const deletedUser = await User.findByIdAndDelete(user._id); // We want to find the user by the clerkId

    // Return the deleted user:
    return deletedUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// GET ALL USERS
export async function getAllUsers(
  params: GetAllUsersParams
): Promise<{ users: User[] }> {
  try {
    // Connect to the database:
    await connectToDatabase();

    // We have to destructure the params to get the searchQuery:
    const { searchQuery, filter, page = 1, pageSize = 10 } = params;

    // Pagination: First we have to calculate the number of documents to skip based on the page number and the page size:
    const skipAmount = (page - 1) * pageSize; // Example: If we are on page 2 and the page size is 10, we have to skip 10 documents.

    // Then we have to declare the searchQuery:
    // The type FilterQuery is coming from mongoose. It allows us to filter the users.
    const query: FilterQuery<typeof User> = {}; // The query is empty by default.

    // If we have a searchQuery we have to filter the users. Here we use the $or operator to find the searchQuery in the name and username of the user:
    if (searchQuery) {
      query.$or = [
        // We want to search for the searchQuery in the title and content of the question:
        { name: { $regex: new RegExp(searchQuery, "i") } }, // i means case insensitive. We want to find the searchQuery in the name.
        { username: { $regex: new RegExp(searchQuery, "i") } }, // i means case insensitive. We want to find the searchQuery in the username.
      ];
    }

    // If we have a filter we have to filter the users by the filter. We initialize the sortOptions object:
    let sortOptions = {};

    // Then setting the switch statement for the filter:
    switch (filter) {
      case "new_users":
        sortOptions = { joinedAt: -1 }; // Sort the users by createdAt in descending order
        break;
      case "old_users":
        sortOptions = { joinedAt: 1 }; // Sort the users by createdAt in ascending order
        break;
      case "top_contributors":
        sortOptions = { reputation: -1 }; // Sort the users by reputation in descending order
        break;

      default:
        break;
    }

    const users = await User.find(query)
      .skip(skipAmount) // We skip the amount of documents based on the page number and the page size.
      .limit(pageSize) // We limit the amount of documents based on the page size.
      .sort(sortOptions); // We want to find the users by the query and sort them by the sortOptions

    // Pagination: We have to calculate if there are more pages with users to show:
    const totalUsers = await User.countDocuments(query); // We count the total amount of questions based on the query.

    // If the total amount of users is greater than the amount of users we have to show on the page, we have more pages with questions to show:
    const isNext = totalUsers > skipAmount + users.length;

    // Return the users:
    return { users, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// TOGGLE SAVE QUESTION
export async function toggleSaveQuestion(params: ToggleSaveQuestionParams) {
  try {
    // Connect to the database:
    await connectToDatabase();

    const { userId, questionId, path } = params;

    // Get the user:
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Check if the question has already been saved:
    const isQuestionSaved = user.saved.includes(questionId);

    // If the question is already saved, we remove it from the saved questions:
    if (isQuestionSaved) {
      await User.findByIdAndUpdate(
        userId,
        {
          $pull: { saved: questionId }, // The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
        },
        { new: true } // The new option returns the modified document rather than the original. New is true by default.
      );
    } else {
      // If the question is not saved, we add it to the saved questions:
      await User.findByIdAndUpdate(
        userId,
        {
          $addToSet: { saved: questionId }, // The $addToSet operator adds a value to an array unless the value is already present, in which case $addToSet does nothing to that array.
        },
        { new: true } // The new option returns the modified document rather than the original. New is true by default.
      );
    }

    // We have to let Next which page has to be regenerated after the user is updated
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// GET SAVED QUESTIONS
export async function getSavedQuestions(params: GetSavedQuestionsParams) {
  try {
    // Connect to the database:
    await connectToDatabase();

    // We have to destructure the needed params:
    const { clerkId, searchQuery, filter, page = 1, pageSize = 20 } = params;

    // Pagination: First we have to calculate the number of documents to skip based on the page number and the page size:
    const skipAmount = (page - 1) * pageSize; // Example: If we are on page 2 and the page size is 20, we have to skip 20 documents. (20 * (2 - 1) = 20 * 1 = 20)

    // We define the query object to filter the saved questions:
    // In Typescript: query of type FilterQuery<typeof Question> = searchQuery
    const query: FilterQuery<typeof Question> = searchQuery // We can add a match a query object to filter the saved questions. Its a special objekt from mongoose.Its a Regex
      ? { title: { $regex: new RegExp(searchQuery, "i") } } // We want to filter the saved questions by the title. We use the $regex operator to match the title with the searchQuery. The $options "i" makes the search case insensitive.
      : {}; // If there is no searchQuery, we return an empty object

    // If we have a filter we have to filter the questions by the filter. We initialize the sortOptions object:
    let sortOptions = {};

    // Then setting the switch statement for the filter:
    switch (filter) {
      case "most_recent":
        sortOptions = { createdAt: -1 }; // Sort the questions by createdAt in descending order
        break;
      case "oldest":
        sortOptions = { createdAt: 1 }; // Sort the questions by createdAt in ascending order
        break;
      case "most_voted":
        sortOptions = { upvotes: -1 }; // Sort the questions by upvotes in descending order
        break;
      case "most_viewed":
        sortOptions = { views: -1 }; // Sort the questions by views in descending order
        break;
      case "most_answered":
        sortOptions = { answers: -1 }; // Sort the questions by answers in descending order
        break;

      default:
        break;
    }

    // Get the user:
    const user = await User.findOne({ clerkId }).populate({
      path: "saved", // We want to populate the saved questions
      match: query, // We want to match the saved questions with the query
      options: {
        sort: sortOptions, // Sort the saved questions by the sortOptions
        skip: skipAmount, // We skip the amount of documents based on the page number and the page size.
        limit: pageSize, // We limit the amount of documents based on the page size.
      },

      populate: [
        // We can populate the saved questions with the author and tags
        { path: "tags", model: Tag, select: "_id name" }, // We want to populate the tags of the saved questions with the _id and name
        { path: "author", model: User, select: "_id clerkId name picture" }, // We want to populate the author of the saved questions with the _id, name and clerkId and picture
      ],
    });

    // If the total amount of saved questions is greater than the amount of questions we have to show on the page, we have more pages with questions to show:
    const isNext = user.saved.length >= pageSize;

    if (!user) {
      throw new Error("User not found");
    }

    // We have to extract the saved questions from the user:
    const savedQuestions = user.saved;

    // Then we return the saved questions:
    return { questions: savedQuestions, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// GET USER INFO FOR PROFILE DETAIL PAGE
export async function getUserInfo(params: GetUserByIdParams) {
  try {
    // Connect to the database:
    await connectToDatabase();

    // We have to destructure the needed params:
    const { userId } = params;

    // Get the user:
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      throw new Error("User not found");
    }

    //  Then we need some additional data for the user:
    // Get the total count of user's questions and answers:
    const totalQuestions = await Question.countDocuments({ author: user._id });
    const totalAnswers = await Answer.countDocuments({ author: user._id });

    // Return the user and the additional data:
    return { user, totalQuestions, totalAnswers };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// GET USER QUESTIONS FOR PROFILE DETAIL PAGE
export async function getUserQuestions(params: GetUserStatsParams) {
  try {
    // Connect to the database:
    await connectToDatabase();

    // We have to destructure the needed params:
    const { userId, page = 1, pageSize = 5 } = params;

    // Pagination: First we have to calculate the number of documents to skip based on the page number and the page size:
    const skipAmount = (page - 1) * pageSize; // Example: If we are on page 2 and the page size is 20, we have to skip 20 documents. (20 * (2 - 1) = 20 * 1 = 20)

    // Get the user's total number of questions:
    const totalQuestions = await Question.countDocuments({ author: userId });

    // Get all the user's questions:
    const userQuestions = await Question.find({ author: userId })
      .sort({ createdAt: -1, views: -1, upvotes: -1 }) // Sort the questions by views and upvotes in descending order. The first sort option takes the highestt effect.
      .skip(skipAmount) // We skip the amount of documents based on the page number and the page size.
      .limit(pageSize) // We limit the amount of documents based on the page size.
      .populate("tags", "_id name") // Populate the questions with the tags. We want to populate the tags with the _id and name
      .populate("author", "_id clerkId name picture"); // Populate the questions with the author. We want to populate the author with the _id, clerkId, name and picture

    // If the total amount of questions is greater than the amount of questions we have to show on the page, we have more pages with questions to show:
    const isNextQuestions = totalQuestions > skipAmount + userQuestions.length;

    // Return the user's questions:
    return { questions: userQuestions, totalQuestions, isNextQuestions };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// GET USER ANSWERS FOR PROFILE DETAIL PAGE
export async function getUserAnswers(params: GetUserStatsParams) {
  try {
    // Connect to the database:
    await connectToDatabase();

    // We have to destructure the needed params:
    const { userId, page = 1, pageSize = 5 } = params;

    // Pagination: First we have to calculate the number of documents to skip based on the page number and the page size:
    const skipAmount = (page - 1) * pageSize; // Example: If we are on page 2 and the page size is 20, we have to skip 20 documents. (20 * (2 - 1) = 20 * 1 = 20)

    // Get the user's total number of answers:
    const totalAnswers = await Answer.countDocuments({ author: userId });

    // Get all the user's answers:
    const userAnswers = await Answer.find({ author: userId })
      .sort({ upvotes: -1 }) // Sort the questions by views and upvotes in descending order
      .skip(skipAmount) // We skip the amount of documents based on the page number and the page size.
      .limit(pageSize) // We limit the amount of documents based on the page size.
      .populate("question", "_id title") // Populate the answers with the question. We want to populate the question with the _id and title
      .populate("author", "_id clerkId name picture"); // Populate the questions with the author. We want to populate the author with the _id, clerkId, name and picture

    // If the total amount of answers is greater than the amount of answers we have to show on the page, we have more pages with answers to show:
    const isNextAnswers = totalAnswers > skipAmount + userAnswers.length;

    // Return the user's questions:
    return { answers: userAnswers, totalAnswers, isNextAnswers };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// export async function getAllUsers(params: GetAllUsersParams) {
//   try {
//     // Connect to the database:
//     await connectToDatabase();

//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// }
