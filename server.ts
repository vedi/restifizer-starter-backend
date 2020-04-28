import app from 'app';

const bootstrap = require('config/bootstrap');

module.exports = async () => {
  try {
    await app.init();
    const log = app.createLog(module);
    const { config: { app: { title }, port } } = app;
    app.httpServer.listen(port);
    log.info(`"${title}" application started on port ${port}`);
    log.info('Running bootstrap script...');
    await bootstrap(app);
    log.info('Bootstrap script completed');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`Starting failed with error: ${err.message}`);
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  }
};
