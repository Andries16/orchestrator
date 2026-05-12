import { LoginInputSchema, RegisterInputSchema } from "@cross_brand/shared";
import { TRPCError } from "@trpc/server";
import { UserModel } from "../models/User.js";
import { publicProcedure, protectedProcedure, router } from "../trpc.js";
import { comparePassword, hashPassword, signToken } from "../utils/auth.js";

export const authRouter = router({
  register: publicProcedure
    .input(RegisterInputSchema)
    .mutation(async ({ input }) => {
      const { email, password } = input;
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists",
        });
      }
      const passwordHash = await hashPassword(password);
      const user = await UserModel.create({
        email,
        passwordHash,
      });
      const token = signToken({ userId: user.id, email: user.email });
      return {
        token,
        user: { id: user.id, email: user.email, apiKeys: user.apiKeys },
      };
    }),

  login: publicProcedure.input(LoginInputSchema).mutation(async ({ input }) => {
    const { email, password } = input;
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid credentials",
      });
    }
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid credentials",
      });
    }
    const token = signToken({ userId: user.id, email: user.email });
    return {
      token,
      user: { id: user.id, email: user.email, apiKeys: user.apiKeys },
    };
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    return {
      id: ctx.user.id,
      email: ctx.user.email,
      apiKeys: ctx.user.apiKeys,
    };
  }),
});
