"use server";

import { connectToDatabase } from "../mongoose";
import { SearchParams } from "./shared.types";
import Question from "@/database/question.model";
import User from "@/database/user.model";
import Answer from "@/database/answer.model";
import Tag from "@/database/tag.model";

// This is an array for the searchable types:
const SearchableTypes = ["question", "user", "answer", "tag"]; // This prevents the user from searching in other types which are not supported

// This is the main function that will fetch the data from the server when global or type changes
export async function globalSearch(params: SearchParams) {
  try {
    await connectToDatabase();

    // then we need to extract the needed params:
    const { query, type } = params;

    // Then we need to turn the query into a regular expression query we can use in the database
    const regexQuery = { $regex: query, $options: "i" };

    // Then we declare an empty result array
    let results = [];

    // Then we have to figure out what are we searching for. This is an abstracted way to search in all the models in the fields we want to search in
    const modelsAndTypes = [
      { model: Question, searchField: "title", type: "question" },
      { model: User, searchField: "name", type: "user" },
      { model: Answer, searchField: "content", type: "answer" },
      { model: Tag, searchField: "name", type: "tag" },
    ];

    // The type sometimes comes in uppercase, so we need to make it lowercase
    const typeLower = type?.toLowerCase();

    // If the type does not exist or is not in the searchable types, we want to search in all the types. It means, that no filter is applied
    if (!typeLower || !SearchableTypes.includes(typeLower)) {
      // SEARCH ACROSS EVERYTHING WHEN NO FILTER IS APPLIED
      //  CAUTION: We have to make multiple requests using iteration. WE CAN'T USE forEach or map because they are not async!! We have to use a modern for of loop!
      for (const { model, searchField, type } of modelsAndTypes) {
        const queryResults = await model
          .find({ [searchField]: regexQuery })
          .limit(2);

        // Then we modify the results and set them in the results array
        results.push(
          ...queryResults.map((item) => ({
            title:
              type === "answer"
                ? `Answers containing ${query}`
                : item[searchField],
            type,
            id:
              type === "user"
                ? item.clerkId
                : type === "answer"
                  ? item.question
                  : item._id,
          }))
        );
      }
    } else {
      // SEARCH IN THE SPECIFIED MODEL BASED ON THE TYPE WHEN FILTER IS APPLIED
      const modelInfo = modelsAndTypes.find((item) => item.type === type);

      // If there is no modelInfo means that something must have gone wrong:
      if (!modelInfo) {
        throw new Error("Invalid search type"); // In case sbdy tries to mess with a type in the frontend. We sill want to make sure that in the backend we get valid and clean data.
      }

      // If we have a modelInfo, we want to start querying the database. We use an abstracted way to search in all the specified models
      const queryResults = await modelInfo.model
        .find({ [modelInfo.searchField]: regexQuery }) // This is a way to use a dynamic key in an object.
        .limit(8); // We want to limit the results to 8

      // Then we modify the results and set them in the results array
      results = queryResults.map((item) => ({
        // Here we open up an instant return block which will return an object with the following properties:
        title:
          type === "answer"
            ? `Answers containing ${query}`
            : item[modelInfo.searchField], // We want to modify the title based on the type
        type,
        id:
          type === "user"
            ? item.clerkId
            : type === "answer"
              ? item.question // We need to return the question id for the answer type
              : item._id,
      }));
    }

    // Then we return the results
    return JSON.stringify(results);
  } catch (error) {
    console.log(`Error fetching global results ${error}`);
    throw error;
  }
}
