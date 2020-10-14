import { Document, Model } from 'mongoose';
import { AuthResource } from './auth';

type Token = {
  token: string;
  expires: string | Date;
};

export enum Gender {
  Male= 1,
  Female = 2
}

export interface UserDomain {
  username: string;
  password: string;
  provider: 'local';
  resetPassword?: Token;
  admin?: boolean;
  hashedPassword?: string;
  firstName: string;
  lastName: string;
  height?: number;
  age?: number;
  gender?: Gender;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserModel extends Model<UserDocument> {
  hashPassword(password: string): string;
  logout(id: string): Promise<void>;
  removeDependencies(id: string): Promise<void>;
}

export interface UserDocument extends Omit<
UserDomain,
'likedUsers' | 'dislikedUsers' | 'ignoringUsers' | 'matchedUsers' | 'spotsUsers' | 'wantToBanUsers'
>, Document {
  isAdmin(): boolean;
  authenticate(password: string): boolean;
  removeDependencies(): Promise<void>;
}

export type UserResource = Omit<
UserDomain,
'password' & 'isAdmin' & 'hashedPassword' & 'provider' & 'emailVerification'
> & {
  _id: string;
  auth?: AuthResource;
};

export const USER_DEFAULT_FIELDS = [
  'provider',
  'username',
  'firstName',
  'lastName',
  'height',
  'age',
  'gender',
  'createdAt',
  'updatedAt',
  'auth',
];
