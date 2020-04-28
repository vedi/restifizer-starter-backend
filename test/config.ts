export = {
  baseUrl: process.env.BASE_URL || 'http://localhost:1341',
  client: {
    id: process.env.CLIENT_ID || 'default',
    secret: process.env.CLIENT_SECRET || 'default',
  },
};
