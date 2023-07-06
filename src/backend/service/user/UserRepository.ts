import { CreateUserRequest, GetUserRequest, User } from '@backend/service/user/User';
import { Database } from '@backend/shared/Database';

export interface UserRepositoryProps {
    database: Database;
}

export class UserRepository {
    database: Database;

    constructor(props: UserRepositoryProps) {
        this.database = props.database;
    }

    async getUser(getUserRequest: GetUserRequest) {
        return await this.database.getItem<User>({
            Key: {
                pk: 'user',
                sk: getUserRequest.email,
            },
        });
    }

    async createUser(createUserRequest: CreateUserRequest) {
        await this.database.putItem<User>({
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
