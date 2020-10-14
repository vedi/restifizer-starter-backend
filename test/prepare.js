'use strict';

require('../root-require');
const prepare = require('mocha-prepare');

process.on('unhandledRejection', (reason, p) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
});

prepare(async (done) => {
  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.warn('Forced NODE_ENV to test');
    global.FORCED_NODE_ENV = 'test';
  }

  // eslint-disable-next-line global-require
  const server = require('server');
  await server();
  // eslint-disable-next-line global-require
  const specHelper = require('./specHelper');
  await specHelper.prepareDb();
  done();
});
