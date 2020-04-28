import { Mongoose, Schema } from 'mongoose';

import authPlugin from 'app/lib/restifizer.plugin/auth.restifizer.plugin';
import pretendPlugin from 'app/lib/restifizer.plugin/pretend.restifizer.plugin';
import { Gender, UserDocument } from '../domains/user';
import { MongooseOptions as AuthMongooseOptions } from '../lib/restifizer.plugin/auth.restifizer.plugin/auth.restifizer.plugin';

const modelName = 'User';

module.exports = (mongoose: Mongoose) => {
  const schema = new Schema({
    admin: {
      type: Boolean,
    },
    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      required: true,
    },

    height: Number,
    age: Number,
    gender: {
      type: Number,
      enum: Object.values(Gender),
    },
  }, {
    timestamps: true,
  });

  schema.post('remove', async (doc: UserDocument, next) => {
    try {
      await doc.removeDependencies();
      next();
    } catch (err) {
      next(err);
    }
  });

  schema.methods.isAdmin = function isAdmin() {
    return this.admin;
  };

  schema.statics.removeDependencies = function removeDependencies(userId: string) {
    return this
      .findOne({ _id: userId })
      .then((user: UserDocument) => user.removeDependencies());
  };

  schema.methods.removeDependencies = async function removeDependencies() {
    // put logic here
  };

  /**
   *  {
   *    username: {
   *      type: String,
   *      unique: 'User with this username already exists',
   *      sparse: true,
   *      required: [
   *        requiredForLocalProvider,
   *        'Path `{PATH}` is required.'
   *      ],
   *      trim: true,
   *      lowercase: true
   *    },
   *    hashedPassword: {
   *      type: String,
   *      default: '',
   *      required: [
   *        requiredForLocalProvider,
   *        'Path `{PATH}` is required.'
   *      ]
   *    },
   *    salt: {
   *      type: String
   *    },
   *    provider: {
   *      type: String,
   *      'default': LOCAL_PROVIDER,
   *      required: true
   *    },
   *    linkedAccounts: {}
   *  },
   *  resetPassword: {
   *    token: String,
   *    expires: Date
   *  },
   *
   *  schema.statics.logout(userId)
   *  schema.methods.hashPassword(password)
   *  schema.methods.authenticate(password)
   *  schema.virtual('password')
   */
  schema.plugin<AuthMongooseOptions>(authPlugin.mongoose, {});

  schema.plugin(pretendPlugin.mongoose, {});

  return mongoose.model<UserDocument>(modelName, schema);
};
