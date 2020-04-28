import { UserDomain } from '../../../domains/user';

export interface SnOptions {
  fieldsToFetch: string;
  [key: string]: any;
}

export interface SnHelper {
  getProfile(snData: any): Promise<Record<string, any>>;
  buildQuery(snData: any): Record<string, any>;
  extract(profile: Record<string, any>): Partial<UserDomain>;
}
