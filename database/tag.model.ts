import { Schema, models, model, Document } from "mongoose";

//  First we need to define an interface representing our document (the data we are going to save in the database)
// extends Document means that this interface has all the properties of a Mongoose Document like _id etc.
export interface ITag extends Document {
  name: string;
  description: string;
  questions: Schema.Types.ObjectId[];
  followers: Schema.Types.ObjectId[];
  createdOn: Date;
}

//  Next we need to create a Schema corresponding to the document interface.
//  This will be used in the model
const TagSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
  followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  createdOn: { type: Date, default: Date.now },
});

//  Now we need to create a model using it
// We check if the model already exists, if not we create it, if yes we use the existing model
const Tag = models.Tag || model<ITag>("Tag", TagSchema);

//  Finally, we export the model
export default Tag;
