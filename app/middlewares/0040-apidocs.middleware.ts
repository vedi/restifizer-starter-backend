import express from 'express';
import { ExtendedExpressApplication } from '../domains/system';

export default (expressApp: ExtendedExpressApplication) => {
  expressApp.use('/apidocs', express.static('apidocs'));
};
