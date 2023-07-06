import { CreateUserRequest, GetUserRequest, User } from '@backend/service/user/User';
import { UserRepository } from '@backend/service/user/UserRepository';
import { Database } from '@backend/shared/Database';

export interface UserServiceProps {
    database: Database;
}

export class UserService {
    private userRepository: UserRepository;

    constructor(props: UserServiceProps) {
        this.userRepository = new UserRepository({ database: props.database });
    }

    async getUser(getUserRequest: GetUserRequest): Promise<User> {
        return await this.userRepository.getUser(getUserRequest);
    }

    async createUser(createUserRequest: CreateUserRequest): Promise<void> {
        await this.userRepository.createUser(createUserRequest);
    }
}
