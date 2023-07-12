import { CreateUserRequest, GetUserRequest, UserEntity } from '@backend/module/user/UserModel';
import { Database } from '@backend/shared/Database';

export interface UserRepositoryProps {
    database: Database;
}

export class UserRepository {
    database: Database;

    constructor(props: UserRepositoryProps) {
        this.database = props.database;
    }

    async getUser(getUserRequest: GetUserRequest): Promise<UserEntity> {
        return await this.database.getItem<UserEntity>({
            Key: {
                pk: 'user',
                sk: getUserRequest.email,
            },
        });
    }

    async createUser(createUserRequest: CreateUserRequest): Promise<void> {
        await this.database.putItem<UserEntity>({
            Item: {
                pk: 'user',
                sk: createUserRequest.email,
                email: createUserRequest.email,
                config: {},
            },
            ConditionExpression: 'attribute_not_exists(sk)',
        });
    }
}
