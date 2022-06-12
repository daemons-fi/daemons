import faker from "@faker-js/faker";
import { IUser, User } from "../models/user";

/** Returns a randomized user */
export function userFactory(args: any): IUser {
    return {
        address: args.address ?? faker.finance.ethereumAddress(),
        username: args.username ?? faker.internet.userName(),
        creationDate: args.date ?? new Date(),
        banned: args.banned ?? false
    };
}

/** Adds a User to mongo and returns it */
export async function userDocumentFactory(args: any): Promise<IUser> {
    return await User.create(userFactory(args));
}
