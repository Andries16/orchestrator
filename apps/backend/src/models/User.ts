import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  apiKeys?: {
    openaiKey?: string;
    anthropicKey?: string;
    googleKey?: string;
  };
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    apiKeys: {
      openaiKey: { type: String },
      anthropicKey: { type: String },
      googleKey: { type: String },
    },
  },
  { timestamps: true },
);

export const UserModel = mongoose.model<IUser>("User", UserSchema);
