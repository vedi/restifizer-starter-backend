import { Document } from 'mongoose';

export interface ClientDocument extends Document {
  name: string;
  clientId: string;
  clientSecret: string;
}

export interface RefreshTokenDocument extends Document {
  user: string;
  client: string;
  token: string;
  scopes: string;
  createdAt: number;
}

export interface AccessTokenPayload {
  user: string;
  client: string;
  scopes?: string;
}

export interface AuthResource {
  access_token: string;
  refresh_token: string;
}
