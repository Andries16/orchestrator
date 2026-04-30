import { Settings } from "@cross_brand/shared";
import mongoose, { Document, Schema } from "mongoose";
export interface ISettings extends Settings, Document {}
const SettingsSchema: Schema = new Schema(
  {
    openaiKey: { type: String, default: "" },
    anthropicKey: { type: String, default: "" },
    googleKey: { type: String, default: "" },
  },
  { timestamps: true },
);
export const SettingsModel = mongoose.model<ISettings>(
  "Settings",
  SettingsSchema,
);
