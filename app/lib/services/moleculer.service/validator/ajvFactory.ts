import Ajv from 'ajv';

export = () => new Ajv({ allErrors: true, jsonPointers: true, nullable: true });
