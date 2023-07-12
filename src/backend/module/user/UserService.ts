import {
    CreateUserRequest,
    GetUserRequest,
    UserEntity,
    UserView,
} from '@backend/module/user/UserModel';
import { UserRepository } from '@backend/module/user/UserRepository';
import { Database } from '@backend/shared/Database';

export interface UserServiceProps {
    database: Database;
}

export class UserService {
    private userRepository: UserRepository;

    constructor(props: UserServiceProps) {
        this.userRepository = new UserRepository({ database: props.database });
    }

    async getUser(getUserRequest: GetUserRequest): Promise<UserView> {
        const userEntity = await this.userRepository.getUser(getUserRequest);
        return this.entityToView(userEntity);
    }

    async createUser(createUserRequest: CreateUserRequest): Promise<void> {
        await this.userRepository.createUser(createUserRequest);
    }

    private entityToView(userEntity: UserEntity): UserView {
        return {
            email: userEntity.email,
            config: userEntity.config,
        };
    }
}
