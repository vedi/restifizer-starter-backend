import { Mongoose, Schema } from 'mongoose';

const modelName = 'Migration';

export default (mongoose: Mongoose) => {
  const schema = new Schema({
    key: {
      type: String,
      required: true,
      unique: true,
    },
    migrations: [{
      title: {
        type: String,
        required: true,
      },
    }],
    pos: {
      type: Number,
      required: true,
    },
  }, {
    timestamps: true,
  });

  return mongoose.model(modelName, schema);
};
