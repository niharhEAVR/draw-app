import { z } from "zod";

export const SignupSchema = z.object({
    email: z.string().email(),
    password: z.string(),
    name: z.string()
})

export const SigninSchema = z.object({
    email: z.string().email(),
    password: z.string(),
})

export const CreateRoomSchema = z.object({
    roomName: z.string().min(3).max(20),
})