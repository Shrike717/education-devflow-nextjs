"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import {
  GetAllTagsParams,
  GetQuestionsByTagIdParams,
  GetTopInteractedTagsParams,
} from "./shared.types";
import Tag, { ITag } from "@/database/tag.model";
import Question from "@/database/question.model";

interface Tag {
  _id: string;
  name: string;
}

// GET TOP INTERACTED TAGS
export async function getTopInteractedTags(
  params: GetTopInteractedTagsParams
): Promise<Tag[]> {
  try {
    // Connect to the database:
    await connectToDatabase();

    // Then we have to destructure the params:
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userId, limit = 3 } = params;

    // First we have to get the user to then get the tags:
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Then find interactins for the user and group by tags:
    // Later on we create a new entity caalled Interactions. Then we are able too  do all sorts of manipulaions on that model.

    // For now we return a static array of tags:
    return [
      { _id: "1", name: "tag1" },
      { _id: "2", name: "tag2" },
      { _id: "3", name: "tag3" },
    ];
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// GET ALL TAGS:
export async function getAllTags(
  params: GetAllTagsParams
): Promise<{ tags: Tag[] }> {
  try {
    // Connect to the database:
    await connectToDatabase();

    const tags = await Tag.find();

    return { tags };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// GET QUESTIONS RELATED TO TAG:
export async function getQuestionsByTagId(params: GetQuestionsByTagIdParams) {
  try {
    // Connect to the database:
    await connectToDatabase();

    // Then we have to destructure the params:
    const { tagId, page = 1, pageSize = 10, searchQuery } = params;

    // We define the query object to filter the questions related to the tag:
    // In Typescript: query of type FilterQuery<typeof Question> = searchQuery
    const tagFilter: FilterQuery<ITag> = { _id: tagId }; // Here we filter the tag by the tagId

    // Get the tag:
    const tag = await Tag.findOne(tagFilter).populate({
      path: "questions",
      model: Question,
      match: searchQuery // We want to match the questions related to the tag with the searchQuery
        ? { title: { $regex: searchQuery, $options: "i" } } // We want to filter the questions by the title. We use the $regex operator to match the title with the searchQuery. The $options "i" makes the search case insensitive.
        : {}, // If there is no searchQuery, we return an empty object
      options: {
        sort: { createdAt: -1 }, // Sort the questions by createdAt in descending order
      },

      populate: [
        // We can populate the saved questions with the author and tags
        { path: "tags", model: Tag, select: "_id name" }, // We want to populate the tags of the related questions with the _id and name
        { path: "author", model: User, select: "_id clerkId name picture" }, // We want to populate the author of the saved questions with the _id, name and clerkId and picture
      ],
    });

    if (!tag) {
      throw new Error("Tag not found");
    }

    // Here we have to extract the related questions from the tag:
    const questions = tag.questions;

    // Then we reeturn the saved questions:
    return { tagTitle: tag.name, questions };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// GET HOT TAGS:
export async function getTopPopularTags() {
  try {
    // Connect to the database:
    await connectToDatabase();

    // We get the top popular tags from the database:
    const popularTags = await Tag.aggregate([
      { $project: { name: 1, numberOfQuestions: { $size: "$questions" } } },
      { $sort: { numberOfQuestions: -1 } },
      { $limit: 5 },
    ]);

    return popularTags;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
