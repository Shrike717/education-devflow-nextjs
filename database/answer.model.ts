import { Schema, models, model, Document } from "mongoose";

//  First we need to define an interface representing our document (the data we are going to save in the database)
// extends Document means that this interface has all the properties of a Mongoose Document like _id etc.
export interface IAnswer extends Document {
  author: Schema.Types.ObjectId;
  question: Schema.Types.ObjectId;
  content: string;
  upvotes: Schema.Types.ObjectId[];
  downvotes: Schema.Types.ObjectId[];
  createdAt: Date;
}

//  Next we need to create a Schema corresponding to the document interface.
const AnswerSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  question: { type: Schema.Types.ObjectId, ref: "Question", required: true },
  content: { type: String, required: true },
  upvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  downvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

//  Now we need to create a model using it
// We check if the model already exists, if not we create it, if yes we use the existing model
const Answer = models.Answer || model<IAnswer>("Answer", AnswerSchema);

//  Finally, we export the model
export default Answer;
