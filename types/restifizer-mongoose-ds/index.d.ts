declare module 'restifizer-mongoose-ds' {
  import { Document, Model } from 'mongoose';
  import { DataSource } from 'restifizer';

  interface MongooseDataSource<D extends Document, T> extends DataSource<D, T> {
    ModelClass: Model<D>;
  }
}
