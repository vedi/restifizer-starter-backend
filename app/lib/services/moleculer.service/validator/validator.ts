import { Errors, GenericObject, Validator as BaseValidator } from 'moleculer';
import { Ajv, ValidateFunction } from 'ajv';

import ajvFactory from './ajvFactory';

const ROOT_AJV_KEYWORDS = ['properties', 'not', 'oneOf', 'anyOf', 'if', 'type'];

class AjvValidator extends BaseValidator {
  constructor(private ajvValidator: Ajv) {
    super();
    this.ajvValidator = ajvFactory();
  }

  compile(schema: GenericObject) {
    const isAjv = ROOT_AJV_KEYWORDS.some((keyword: string) => schema[keyword]);
    if (isAjv) {
      try {
        const validate = this.ajvValidator.compile(schema);
        return (params: GenericObject) => this.validate(params, validate);
      } catch (err) {
        // do nothing
      }
    }
    return super.compile(schema);
  }

  validate(params: GenericObject, validate: ValidateFunction) {
    const valid = validate(params);
    if (!valid) {
      throw new Errors.ValidationError(
        this.ajvValidator.errorsText(validate.errors),
        '',
        <GenericObject>validate.errors,
      );
    }

    return true;
  }
}

export default AjvValidator;
