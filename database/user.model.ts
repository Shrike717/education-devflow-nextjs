import { Schema, models, model, Document } from "mongoose";

//  First we need to define an interface representing our document (the data we are going to save in the database)
// extends Document means that this interface has all the properties of a Mongoose Document like _id etc.
export interface IUser extends Document {
  // We need the  Clerk id to connect the Clerk user to the User in the database
  clerkId: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  bio?: string;
  picture: string;
  location?: string;
  portfolioWebsite?: string;
  reputation?: number; // This is the reputation of the user. It is calculated based on the votes on the user's answers and questions
  saved: Schema.Types.ObjectId[]; // This is an array of ObjectIds. Each ObjectId is a reference to a Question
  joinedAt: Date;
}

//  Next we need to create a Schema corresponding to the document interface.
//  This will be used in the model
const UserSchema = new Schema({
  clerkId: { type: String, required: true },
  name: { type: String, required: true },
  // We need to make sure that the username is unique
  username: { type: String, required: true, unique: true },
  // We need to make sure that the email is unique
  email: { type: String, required: true, unique: true },
  // Password is not required because we can create a user with Clerk without a password
  password: { type: String },
  bio: { type: String },
  picture: { type: String, required: true },
  location: { type: String },
  portfolioWebsite: { type: String },
  reputation: { type: Number, default: 0 },
  // The saved are an array of ObjectIds. Each ObjectId is a reference to a Question
  saved: [{ type: Schema.Types.ObjectId, ref: "Question" }],
  joinedAt: { type: Date, default: Date.now },
});

//  Now we need to create a model using it
// We check if the model already exists, if not we create it, if yes we use the existing model
const User = models.User || model<IUser>("User", UserSchema);

//  Finally, we export the model
export default User;
