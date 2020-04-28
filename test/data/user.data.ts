import { Gender } from '../../app/domains/user';

export default (seed: number) => ({
  username: `fakeUsername${seed}`,
  password: `password${seed}`,
  firstName: `firstName ${seed}`,
  lastName: `lastName ${seed}`,
  age: 23,
});

const createQueryFn = (newCriteria: Record<string, any>) => (
  (criteria: Record<string, any> = {}) => ({ ...criteria, ...newCriteria })
);

export const modelQuery = {
  asFemale: createQueryFn({ gender: Gender.Female }),
};
