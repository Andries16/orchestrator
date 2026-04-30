import { SettingsSchema } from "@cross_brand/shared";
import { SettingsModel } from "../models/Settings.js";
import { publicProcedure, router } from "../trpc.js";
import { decrypt, encrypt } from "../utils/crypto.js";
export const settingsRouter = router({
  get: publicProcedure.query(async () => {
    let settings = await SettingsModel.findOne();
    if (!settings) {
      settings = await SettingsModel.create({});
    }
    const result = settings.toObject();
    return {
      openaiKey: result.openaiKey ? decrypt(result.openaiKey) : "",
      anthropicKey: result.anthropicKey ? decrypt(result.anthropicKey) : "",
      googleKey: result.googleKey ? decrypt(result.googleKey) : "",
    };
  }),
  update: publicProcedure
    .input(SettingsSchema.partial())
    .mutation(async ({ input }) => {
      const dataToSave = { ...input };
      if (dataToSave.openaiKey)
        dataToSave.openaiKey = encrypt(dataToSave.openaiKey);
      if (dataToSave.anthropicKey)
        dataToSave.anthropicKey = encrypt(dataToSave.anthropicKey);
      if (dataToSave.googleKey)
        dataToSave.googleKey = encrypt(dataToSave.googleKey);
      let settings = await SettingsModel.findOne();
      if (!settings) {
        settings = new SettingsModel(dataToSave);
        await settings.save();
        return settings.toObject();
      }
      const updated = await SettingsModel.findByIdAndUpdate(
        settings._id,
        { $set: dataToSave },
        { new: true },
      );
      return updated?.toObject();
    }),
});
