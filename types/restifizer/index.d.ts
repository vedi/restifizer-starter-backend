// eslint-disable-next-line max-classes-per-file
declare module 'restifizer' {
  import { Application, IRouterMatcher, Request } from 'express';
  import { Socket } from 'socket.io';
  import { Document, DocumentQuery, Model } from 'mongoose';

  interface Pagination {
    limit: number;
    page: number;
  }

  export type ActionOptions = {
    enabled?: boolean;
    [key: string]: any;
  };

  export type ControllerOptions = {
    actions: {
      [key: string]: ActionOptions;
    };
    [key: string]: any;
  };

  export type LocateModelOptions = {
    strict?: boolean;
    withQueryPipe?: boolean;
  };

  export class Controller<M = Model<any>, D = Document, R = any, S = Scope<M, D>> {
    path: string[];

    transports: Transport[];

    actions: Record<string, any>;

    dataSource: DataSource<any, D>;

    fieldMap: Record<string, any>;

    constructor(options: Partial<ControllerOptions>);

    bind(): void;

    pre(scope: S): Promise<void>;

    assignField(fieldName: string, scope: S): Promise<void>;

    assignFilter(queryParams: Record<string, any>, fieldName: string, scope: S): void;

    locateModel(scope: S, options?: LocateModelOptions): Promise<D>;

    beforeSave(scope: S): Promise<void>;

    afterSave(scope: S): Promise<void>;

    createScope<T>(controller: Controller<M, D, R, S>, transport: Transport<T>): S;

    sendResult(scope: S): void;

    setResError(err: Error, scope: S): void;

    select(scope: S): Promise<void>;

    selectOne(scope: S): Promise<void>;

    count(scope: Scope): Promise<{ count: number }>;

    getFetchingFields(scope: S): Record<string, any>;

    buildConditions(scope: S): Scope['source'];

    getFilter(scope: S): Scope['source'];

    getPagination(scope: Scope): Pagination;

    queryPipe(query: DocumentQuery<any, Document>, scope: Scope<D>): void;

    normalizeAction(action: ActionOptions, actionKey: string): ActionOptions;

    post(result: R, scope: S): Promise<R>;

    collectionPost(result: R[], scope: S): Promise<R[]>;

    _handlePre(scope: Scope): Promise<void>;
  }

  export type Scope<D = any, P = Record<string, any>, T = AllTransportData> = {
    action: Controller;
    actionName: string;
    body: Record<string, any>;
    context: Record<string, any>;
    fieldList: Record<string, any>;
    model: D;
    newContent: boolean;
    owner: Controller;
    params: P;
    restfulResult: Record<string, any> | undefined | null;
    source: P;
    transport: Transport;
    transportData: T;
    checkActionName(...actionNames: string[]): boolean;
    isChanging(): boolean;
    isInsert(): boolean;
    isSelect(): boolean;
    isSelectOne(): boolean;
    isUpdate(): boolean;
  };

  export class Transport<T = AllTransportData> {
    transportName: string;

    transportData: T;
  }

  export type ExpressTransportData<R = Request> = {
    req: R;
  };

  type ExpressTransportOptions = {

  };

  export class ExpressTransport extends Transport<ExpressTransportData> {
    app: Application;

    constructor(options: ExpressTransportOptions);

    getAuth(options: ControllerOptions): IRouterMatcher<this>;
  }

  export type SocketIoTransportData<P = any> = {
    payload: P;
    result?: SocketIoResponseResult;
    socket: Socket;
  };

  export type SocketIoRequest = {
    route: string;
    params?: Record<string, any>;
    filter?: Record<string, any>;
  };

  export type SocketIoResponseResult = {
    body: any;
    statusCode: number;
  };

  type SocketIoTransportOptions = {
  };

  export interface SocketIoTransportResponse {
    method: string;
    path: string;
    result: SocketIoResponseResult;
  }

  export class SocketIoTransport extends Transport<SocketIoTransportData> {
    constructor(options: SocketIoTransportOptions);
  }

  export type AllTransportData = ExpressTransportData | SocketIoTransportData;

  export interface LoggerInstance extends NodeJS.EventEmitter {
    error: LeveledLogMethod;
    warn: LeveledLogMethod;
    help: LeveledLogMethod;
    data: LeveledLogMethod;
    info: LeveledLogMethod;
    debug: LeveledLogMethod;
    prompt: LeveledLogMethod;
    verbose: LeveledLogMethod;
    input: LeveledLogMethod;
    silly: LeveledLogMethod;
  }

  interface LeveledLogMethod {
    (msg: string, ...meta: any[]): LoggerInstance;
  }

  type Options = {
    transports: Transport[];
    log: LoggerInstance;
  };

  export default class Restifizer {
    static Controller: typeof Controller;

    static ExpressTransport: typeof ExpressTransport;

    static SocketIoTransport: typeof SocketIoTransport;

    constructor(options: Options);

    addController(controller: typeof Controller): void;
  }

  export interface HttpError extends Error {
    code?: number;
  }

  export interface FindOptions {
    // TODO: Improve typing
    [key: string]: any;
  }

  export interface CountResult {
    count: number;
  }

  export interface DataSource<D, T> {
    defaultIdField: string;
    type: string;
    defaultArrayMethods: string[];
    initialize(): void;
    getModelFieldNames(): string[];
    find(options: FindOptions): Promise<D[]>;
    create(data: Partial<D>): Promise<D>;
    save(data: D): Promise<D>;
    findOne(options: FindOptions): Promise<D>;
    toObject(model: D): T;
    remove(model: D): Promise<D>;
    count(options: FindOptions): Promise<CountResult>;
    assignField(fieldName: string, scope: Scope): Promise<void>;
    proceedArrayMethod(
      source: D,
      methodName: string,
      fieldName: string,
      scope: Scope,
    ): Promise<void>;
  }

  export interface FieldMetadataObj {
    name: string;
    fields?: FieldMetadata[];
  }

  export type FieldMetadata = string | FieldMetadataObj;
}
