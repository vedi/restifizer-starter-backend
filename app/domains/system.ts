import { Application, Request } from 'express';
import { UserDocument } from './user';
import { ClientDocument } from './auth';

export type Es6Module<T> = { default: T };

export interface OAuthifizer {
  [key: string]: any;
}

export interface ExtendedExpressApplication extends Application {
  oAuthifizer: OAuthifizer;
}

export interface ExtendedExpressRequest extends Request {
  getLocale(): string;
  isAuthenticated(): boolean;
  user: UserDocument | ClientDocument;
}

export type Callback<T = any> = (err?: Error | null, result?: T) => void;
