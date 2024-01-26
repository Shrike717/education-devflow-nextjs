import { Schema, models, model, Document } from "mongoose";

//  First we need to define an interface representing our document (the data we are going to save in the database)
// extends Document means that this interface has all the properties of a Mongoose Document like _id etc.
export interface IQuestion extends Document {
  title: string;
  content: string;
  // tags are a reference (connection) to the Tag model. It is an array of ObjectIds
  tags: Schema.Types.ObjectId[];
  views: number;
  // The upvotes are an array of ObjectIds. Each ObjectId is a reference to a User
  upvotes: Schema.Types.ObjectId[];
  downvotes: Schema.Types.ObjectId[];
  author: Schema.Types.ObjectId;
  // The answers are an array of ObjectIds. Each ObjectId is a reference to an Answer
  answers: Schema.Types.ObjectId[];
  createdAt: Date;
}

//  Next we need to create a Schema corresponding to the document interface.
//  This will be used in the model
const QuestionSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
  views: { type: Number, default: 0 },
  upvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  downvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  author: { type: Schema.Types.ObjectId, ref: "User" },
  answers: [{ type: Schema.Types.ObjectId, ref: "Answer" }],
  createdAt: { type: Date, default: Date.now },
});

//  Now we need to create a model using it
// We check if the model already exists, if not we create it, if yes we use the existing model
const Question =
  models.Question || model<IQuestion>("Question", QuestionSchema);

//  Finally, we export the model
export default Question;
