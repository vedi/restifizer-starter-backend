'use strict';

require('ts-node').register({ transpileOnly: process.env.NODE_ENV === 'production' });

require('app-module-path').addPath(__dirname);
