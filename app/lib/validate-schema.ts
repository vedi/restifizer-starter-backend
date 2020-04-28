import httpStatuses, { HttpStatus } from 'http-statuses';
import ajvFactory from './services/moleculer.service/validator/ajvFactory';

const type = 'app';

const ajvValidator = ajvFactory();

export = (value: any, schema: object, httpStatus: HttpStatus = httpStatuses.BAD_REQUEST) => {
  const isValid = ajvValidator.validate(schema, value);
  if (isValid) {
    return value;
  }
  // transforming to more generic way
  const details = ajvValidator.errors!.reduce(
    (result, { keyword: kind, dataPath: path, data: errValue, message }) => {
      result[path] = { kind, path, value: errValue, message };
      return result;
    },
    {} as Record<string, any>,
  );
  throw httpStatus.createError(
    ajvValidator.errorsText(),
    { error: 'SchemaValidationError', type, details },
  );
};
