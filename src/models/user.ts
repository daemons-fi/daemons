import mongoose from "mongoose";
import mongooseUniqueValidator from "mongoose-unique-validator";

export interface IUser {
    address: string;
    username: string;
    banned: boolean;
    whitelisted: boolean;
    creationDate: Date;
    lastLogin: Date;
}

const userSchema = new mongoose.Schema({
    address: { type: String, required: true, index: { unique: true } },
    username: { type: String, required: true, index: { unique: true } },
    banned: { type: Boolean, required: false, default: false },
    whitelisted: { type: Boolean, required: false, default: false },
    creationDate: { type: Date, required: false, default: () => new Date() },
    lastLogin: { type: Date, required: false, default: () => new Date() }
});
mongooseUniqueValidator(userSchema);

export interface IUserDocument extends IUser, mongoose.Document {}

interface IUserModelSchema extends mongoose.Model<IUserDocument> {
    build(address: string): IUserDocument;
    findOneOrCreate(address: string): Promise<IUserDocument>;
}

userSchema.statics.build = (address: string) => new User({ address, username: address });
userSchema.statics.findOneOrCreate = async (address: string): Promise<IUserDocument> => {
    // restore once whitelisting period ends
    // const user = await User.findOne({ address: address });
    // return user ?? (await User.build(address).save());

    const user = await User.findOne({ address: address });
    if (user) return user;

    const WHITELIST_LIMIT = 100;
    const nrUsers = await User.countDocuments({});
    const newUser = await User.build(address).save();
    newUser.whitelisted = nrUsers <= WHITELIST_LIMIT;
    newUser.save();
    return newUser;
};

export const User = mongoose.model<IUserDocument, IUserModelSchema>("User", userSchema);
