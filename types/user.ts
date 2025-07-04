export type User = {
    id: string;
    companyId: string;
    roleId?: string;
    name: string;
    email: string;
    status: boolean;
    createdAt: string;
    updatedAt: string;
};

export type UserWithRole = User & {
    role?: {
        id: string;
        name: string;
    };
};

export type CreateUserPayload = {
    companyId: string;
    name: string;
    email: string;
    password: string;
    roleId?: string;
};

export type UpdateUserPayload = {
    id: string;
    name?: string;
    email?: string;
    password?: string;
    roleId?: string;
    status?: boolean;
};
