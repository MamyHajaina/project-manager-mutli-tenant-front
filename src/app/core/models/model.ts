// wrapper standard de ton API
export interface ApiResponse<T> {
    success: boolean;
    messages: string | null;
    errorMessages: string[] | null;
    data: T;
}

export interface UserModel {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
    role: 'ADMIN' | 'CLIENT' | 'USER' | string;
}