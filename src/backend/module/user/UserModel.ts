export interface UserEntity {
    pk: string;
    sk: string;
    email: string;
    config: Record<string, string[]>;
}

export interface UserView {
    email: string;
    config: Record<string, string[]>;
}

export interface GetUserRequest {
    email: string;
}

export interface CreateUserRequest {
    email: string;
}
