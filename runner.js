'use strict';

/**
 * Created by vedi on 09/12/18.
 */

require('./root-require');

/* eslint-disable no-console */
console.log(`Loading ${process.argv[2]}...`);

if (!process.env.NODE_ENV) {
  console.error('\x1b[31m',
    'NODE_ENV is not defined! Using default development environment');
  process.env.NODE_ENV = 'development';
}
console.log('\x1b[7m',
  `Application loaded using the "${process.env.NODE_ENV}" environment configuration`);
console.log('\x1b[0m');

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
});

/* eslint-enable no-console */
// eslint-disable-next-line import/no-dynamic-require, global-require
Promise.resolve(require(process.argv[2])());
