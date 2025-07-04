import { z } from 'zod';
export interface Permission {
    id: string;
    code: string;
    description?: string;
}

export interface UserPermission {
    id: string;
    userId: string;
    permissionId: string;
    permission: Permission;
}
export const assignPermissionsSchema = z.object({
    userId: z.string().uuid(),
    permissionIds: z.array(z.string().uuid()).min(1),
});
export type AssignPermissionsPayload = z.infer<typeof assignPermissionsSchema>;