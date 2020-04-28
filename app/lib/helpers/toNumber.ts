export default (param: string | undefined, defaultValue: number): number => (
  param ? parseInt(param, 10) : defaultValue
);
