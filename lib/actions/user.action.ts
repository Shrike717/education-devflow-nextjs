"use server";

import User, { IUser } from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  GetUserByIdParams,
  UpdateUserParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";

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
): Promise<{ users: IUser[] }> {
  try {
    // Connect to the database:
    await connectToDatabase();

    // Then we have to destructure the params.
    // If the params are not provided, we set the default values:
    // const { page = 1, pageSize = 20, filter, searchQuery } = params;

    const users = await User.find({}).sort({ createdAt: -1 });

    // Return the users:
    return { users };
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
