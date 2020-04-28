import httpStatuses from 'http-statuses';
import { Rule } from '../domains/rule';

export = function createAppError(rule: Rule, value?: any) {
  const { message, name, httpStatus = httpStatuses.BAD_REQUEST } = rule;
  return httpStatus.createError(message, {
    type: 'app',
    error: 'RulesViolation',
    details: {
      rule: name,
      value,
    },
  });
};
