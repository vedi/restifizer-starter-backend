import toNumber from '../../app/lib/helpers/toNumber';

const appTitle = 'restifizer-starter';

const config = {
  port: process.env.PORT || 1340,
  // mongo: 'mongodb://heroku_zhb3t77r:aabd58bunnru2a6coqpulv1dv3@ds261844-a0.mlab.com:61844,ds261844-a1.mlab.com:61844/heroku_zhb3t77r?replicaSet=rs-ds261844',
  mongo: process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb://localhost/restifizer-starter',
  mongoOptions: {
    poolSize: toNumber(process.env.MONGO_POOL_SIZE, 5),
    connectTimeoutMS: toNumber(process.env.MONGO_CONNECT_TIMEOUT, 30000),
    socketTimeoutMS: toNumber(process.env.MONGO_SOCKET_TIMEOUT, 30000),
    useUnifiedTopology: true,
    useFindAndModify: false,
  },

  isMigration: false,
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test' || (<any>global).FORCED_NODE_ENV === 'test',

  app: {
    title: appTitle,
  },

  security: {
    forgotPasswordTokenLife: 24 * 3600,
    tokenLife: 3600,
    tokenSecret: process.env.TOKEN_SECRET || 'tokenSecret',
  },

  i18n: {
    defaultLocale: 'en',
  },

  moleculer: {
    namespace: process.env.MOLECULER_NAMESPACE || process.env.NODE_ENV,
  },

  redis: {
    keyPrefix: `${appTitle}.notifications`,
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  },

  ses: {
    from: process.env.SES_MAIL_FROM || 'no-reply@your-domain.com',
    region: process.env.SES_REGION || 'us-east-1',
    accessKeyId: process.env.SES_ACCESS_KEY_ID || 'xxx',
    secretAccessKey: process.env.SES_SECRET_ACCESS_KEY || 'xxx',
  },

  urls: {
    resetPassword: process.env.URL_RESET_PASSWORD || 'https://your-domain.com/#/reset_password/',
    defaultClientOrigin: process.env.DEFAULT_CLIENT_ORIGIN || 'your-domain.com.com',
  },

  logger: {
    suppressStdout: process.env.LOGGER_SUPPRESS_STDOUT,
    level: process.env.LOGGER_LEVEL || 'debug',
  },

  defaultClient: {
    name: 'default' || process.env.CLIENT_NAME,
    clientId: 'default' || process.env.CLIENT_ID,
    clientSecret: 'default' || process.env.CLIENT_SECRET,
  },
  defaultUser: {
    username: 'admin@vedidev.com' || process.env.DEFAULT_ADMIN_USERNAME,
    password: 'adminadmin' || process.env.DEFAULT_ADMIN_PASSWORD,
    firstName: 'Admin',
    lastName: 'Admin',
    admin: true,
  },
};

export type Config = typeof config;

export default config;
