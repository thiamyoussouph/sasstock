import { z } from 'zod';

export const createUserSchema = z.object({
    companyId: z.string().uuid(),
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    roleId: z.string().uuid().optional(),
});

export const updateUserSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    roleId: z.string().uuid().optional(),
    status: z.boolean().optional(),
});
