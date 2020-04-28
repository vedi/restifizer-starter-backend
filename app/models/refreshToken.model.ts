import { Mongoose, Schema } from 'mongoose';
import { RefreshTokenDocument } from '../domains/auth';

const modelName = 'RefreshToken';

export default (mongoose: Mongoose) => {
  const schema = new Schema({
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    token: {
      type: String,
      unique: true,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

  return mongoose.model<RefreshTokenDocument>(modelName, schema);
};
