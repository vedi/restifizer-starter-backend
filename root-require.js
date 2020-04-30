'use strict';

const transpileOnly = process.env.NODE_ENV === 'production' || Boolean(process.env.TS_NODE_TRANSPILE_ONLY);
require('ts-node').register({ transpileOnly });

require('app-module-path').addPath(__dirname);
