"use server";

import { connectToDatabase } from "../mongoose";

// Here we have all the actions for the questions model:

export async function createQuestion(params: any) {
  //   console.log("[createQuestion] params:", params);
  try {
    // Connect to the database:
    await connectToDatabase();
  } catch (error) {}
}
