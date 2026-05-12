import { SettingsSchema } from "@cross_brand/shared";
import { UserModel } from "../models/User.js";
import { protectedProcedure, router } from "../trpc.js";
import { decrypt, encrypt } from "../utils/crypto.js";

export const settingsRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const user = await UserModel.findById(ctx.user.id);
    const keys = user?.apiKeys || {};
    return {
      openaiKey: keys.openaiKey ? decrypt(keys.openaiKey) : "",
      anthropicKey: keys.anthropicKey ? decrypt(keys.anthropicKey) : "",
      googleKey: keys.googleKey ? decrypt(keys.googleKey) : "",
    };
  }),
  update: protectedProcedure
    .input(SettingsSchema.partial())
    .mutation(async ({ input, ctx }) => {
      const dataToSave = { ...input };
      if (dataToSave.openaiKey)
        dataToSave.openaiKey = encrypt(dataToSave.openaiKey);
      if (dataToSave.anthropicKey)
        dataToSave.anthropicKey = encrypt(dataToSave.anthropicKey);
      if (dataToSave.googleKey)
        dataToSave.googleKey = encrypt(dataToSave.googleKey);
      
      const updatedUser = await UserModel.findByIdAndUpdate(
        ctx.user.id,
        { $set: { apiKeys: dataToSave } },
        { new: true }
      );
      
      return updatedUser?.apiKeys || {};
    }),
});
