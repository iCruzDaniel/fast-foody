import { StaffAccount, StaffId } from '@domain/auth';

export interface StaffRepositoryPort {
  save(staff: StaffAccount): Promise<void>;
  findById(id: StaffId): Promise<StaffAccount | null>;
  findByUsername(username: string): Promise<StaffAccount | null>;
}