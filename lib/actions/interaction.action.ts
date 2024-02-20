"use server";

import Question from "@/database/question.model";
import { connectToDatabase } from "../mongoose";
import { ViewQuestionParams } from "./shared.types";
import Interaction from "@/database/interaction.model";

export async function viewQuestion(params: ViewQuestionParams) {
  try {
    await connectToDatabase();

    // We need the questionId and the userId from the params:
    const { questionId, userId } = params;

    // Then we want  to update the  view count for each question:
    await Question.findByIdAndUpdate(questionId, { $inc: { views: 1 } }); // We increment the views by 1

    // Then we need to check if the user has already viewed the question:
    if (userId) {
      const existingInteraction = await Interaction.findOne({
        // We want to get the existin information by the following criteria
        user: userId,
        action: "view",
        question: questionId,
      });

      // If we have an interaction, we return information
      if (existingInteraction)
        return console.log("User already viewed this question");

      // If we don't have an interaction, we create a new interaction
      await Interaction.create({
        user: userId,
        action: "view",
        question: questionId,
      });
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}
