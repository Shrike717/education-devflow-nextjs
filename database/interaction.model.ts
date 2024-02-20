import { Schema, models, model, Document } from "mongoose";

//  First we need to define an interface representing our document (the data we are going to save in the database)
// extends Document means that this interface has all the properties of a Mongoose Document like _id etc.
export interface IInteraction extends Document {
  user: Schema.Types.ObjectId; // Reference to the User model
  action: string; // The action the user performed
  question: Schema.Types.ObjectId; // Maybe the user interacted with a specific question
  answer: Schema.Types.ObjectId; // Maybe the user interacted with a specific answer
  tags: Schema.Types.ObjectId[]; // Maybe the user interacted with several specific tags. We can have multiple tags on an question or answer
  createdAt: Date; // The date the interaction was created
}

//  Next we need to create a Schema corresponding to the document interface.
//  This will be used in the model
const InteractionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  question: {
    type: Schema.Types.ObjectId,
    ref: "Question",
  },
  answer: {
    type: Schema.Types.ObjectId,
    ref: "Answer",
  },
  tags: [
    {
      type: Schema.Types.ObjectId,
      ref: "Tag",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//  Now we need to create a model using it
// We check if the model already exists, if not we create it, if yes we use the existing model
const Interaction =
  models.Interaction || model<IInteraction>("Interaction", InteractionSchema);

//  Finally, we export the model
export default Interaction;
