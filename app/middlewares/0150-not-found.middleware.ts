import { ExtendedExpressApplication } from '../domains/system';

export default (expressApp: ExtendedExpressApplication) => {
  // Assume 404 since no middleware responded
  expressApp.use((req, res) => {
    res.status(404);
    if (req.method === 'HEAD') {
      return res.end();
    }

    return res.send({
      type: 'Express',
      error: 'PathNotFound',
      message: 'Not Found',
      url: req.originalUrl,
    });
  });
};
