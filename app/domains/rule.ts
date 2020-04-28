import { HttpStatus } from 'http-statuses';

export interface Rule {
  name: string;
  message: string;
  httpStatus?: HttpStatus;
}
