import { Mongoose, Schema } from 'mongoose';
import { ClientDocument } from '../domains/auth';

const modelName = 'Client';

export default (mongoose: Mongoose) => {
  const schema = new Schema({
    name: {
      type: String,
      unique: true,
      required: true,
    },
    clientId: {
      type: String,
      unique: true,
      required: true,
    },
    clientSecret: {
      type: String,
      required: true,
    },
  });
  return mongoose.model<ClientDocument>(modelName, schema);
};
