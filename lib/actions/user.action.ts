"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";

// Here we have all the actions for the users model:

/* eslint-disable */
export async function getUserById(params: any) {
  //   console.log("[getUserById] params:", params);
  try {
    // Connect to the database:
    await connectToDatabase();

    // Then we have to destruct the params:
    const { userId } = params;

    // Get the user. We use findOne because we want to find one user. We want to find the user by the clerkId:
    const user = await User.findOne({ clerkId: userId });

    // Return the user:
    return user;
  } catch (error) {
    throw error;
    console.log(error);
  }
}
/* eslint-enable */
