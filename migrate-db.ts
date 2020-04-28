// @ts-ignore
import migrate from 'migrate';
import app from 'app';

app.config.isMigration = true;

module.exports = async () => {
  try {
    await app.init();
    const log = app.createLog(module);
    const { modelProvider: { Migration } } = app;
    const key = 'main';

    log.info('Running migration...');

    const migration = migrate.load('migrations/.migrate', 'migrations');

    migration.save = async function save(callback: (err?: Error | null) => void) {
      try {
        await Migration
          .findOneAndUpdate({
            key,
          }, {
            migrations: this.migrations,
            pos: this.pos,
          }, {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
          });
        this.emit('save');
        callback();
      } catch (err) {
        callback(err);
      }
    };

    migration.load = async function load(
      callback: (err: Error | null, migrationData?: any) => void,
    ) {
      this.emit('load');
      try {
        let migrationData = await Migration.findOne({ key }).lean();
        if (!migrationData) {
          migrationData = {
            pos: 0,
          };
        }
        callback(null, migrationData);
      } catch (err) {
        callback(err);
      }
    };

    const isUp = (process.argv[3] !== 'down');

    const callback = (err: Error) => {
      if (err) {
        throw err;
      }
      log.info('Migration completed');
      process.exit(0);
    };

    if (isUp) {
      log.info('migrating up');
      migration.up(callback);
    } else {
      log.info('migrating down');
      migration.down(callback);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('The migration failed with error', err);
    process.exit(1);
  }
};
