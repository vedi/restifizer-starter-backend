import { Server } from 'http';
import { ActionOptions, Controller, Scope as RestifizerScope } from 'restifizer';
import { Document, Model, Schema } from 'mongoose';
import { Application } from 'express';
import { Config } from 'config/env/all';
import SocketIO, { Handshake, Socket } from 'socket.io';
import { LoggerInstance, ServiceBroker, ServiceSchema } from 'moleculer';
import { Consts } from '../lib/consts';
import { ClientDocument, RefreshTokenDocument } from './auth';
import { UserDocument, UserModel } from './user';
import { EmailBuilder, IEmailService } from './email';
import { ExtendedExpressApplication } from './system';

export type AuthOptions = string | string[];

export interface ExtendedActionOptions extends ActionOptions {
  auth: AuthOptions;
}

export interface Scope<M = any> extends RestifizerScope<M> {
  isResourceOwner(
    userId: Schema.Types.ObjectId | string,
    otherUserId: Schema.Types.ObjectId | string,
  ): boolean;
  getClient(): ClientDocument | null;
  getIpAddress(): string | null;
  getLocale(): string | null;
  getReferrer(): string | null;
  getSocket(): Socket | null;
  getUser(): UserDocument | null;
  setUser(user: UserDocument): void;
  client: ClientDocument | null;
  ipAddress?: string;
  locale: string | null;
  referrer: string | null;
  socket: Socket | null;
  user: UserDocument | null;
}

export interface SocketHandshake extends Handshake {
  client: ClientDocument | null;
  user: UserDocument | null;
}

export type MiddlewareBuilder = (expressApp: ExtendedExpressApplication, app: App) => void;

export interface App {
  init(): Promise<void>;
  registerProvider<T>(name: string, provider: T | (() => T)): T;
  config: Config;
  consts: Consts;
  createLog: (module: NodeModule) => LoggerInstance | Console;
  httpServer: Server;
  emails: EmailBuilder<any>[],
  emailService: IEmailService,
  expressApp: Application;
  middlewares: MiddlewareBuilder[]
  modelProvider: {
    Client: Model<ClientDocument>,
    Migration: Model<Document>,
    RefreshToken: Model<RefreshTokenDocument>,
    User: UserModel,
  },
  moleculerBroker: ServiceBroker,
  moleculerService: IMoleculerService,
  molecules: ((app: App) => ServiceSchema)[],
  restControllers: (typeof Controller)[];
  sio: SocketIO.Server,
  [key: string]: any;
}

export interface IMoleculerService {

}
