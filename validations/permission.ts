import { z } from 'zod';

export const assignPermissionsSchema = z.object({
    userId: z.string().uuid(),
    permissionIds: z.array(z.string().uuid()).min(1),
});
export type AssignPermissionsPayload = z.infer<typeof assignPermissionsSchema>;