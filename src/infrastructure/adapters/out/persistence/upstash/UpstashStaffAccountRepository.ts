import { Redis } from '@upstash/redis';
import { StaffRepositoryPort, StaffAccount, StaffId, StaffRole } from '@domain/auth';

interface PersistedStaff {
  id: string;
  username: string;
  passwordHash: string;
  role: string;
  active: boolean;
}

export class UpstashStaffAccountRepository implements StaffRepositoryPort {
  private readonly redis: Redis;
  private static readonly NAMESPACE = 'fast-foodiy';
  private readonly staffKeyPrefix = `${UpstashStaffAccountRepository.NAMESPACE}:auth:staff:`;
  private readonly staffIndexKey = `${UpstashStaffAccountRepository.NAMESPACE}:auth:staff:index`;
  private readonly staffUsernameKeyPrefix = `${UpstashStaffAccountRepository.NAMESPACE}:auth:staff:username:`;

  constructor(redis: Redis) {
    this.redis = redis;
  }

  async save(staff: StaffAccount): Promise<void> {
    const persisted: PersistedStaff = {
      id: staff.id.value,
      username: staff.username,
      passwordHash: staff.passwordHash,
      role: staff.role.role,
      active: staff.isActive,
    };

    const staffKey = `${this.staffKeyPrefix}${staff.id.value}`;

    // Set the staff account key
    await this.redis.set(staffKey, persisted);

    // Add to the staff index set
    await this.redis.sadd(this.staffIndexKey, staff.id.value);

    // Set the username map (lowercase → staffId)
    const normalizedUsername = staff.username.toLowerCase();
    await this.redis.set(`${this.staffUsernameKeyPrefix}${normalizedUsername}`, staff.id.value);
  }

  async findById(id: StaffId): Promise<StaffAccount | null> {
    const staffKey = `${this.staffKeyPrefix}${id.value}`;
    const persisted = await this.redis.get<PersistedStaff>(staffKey);

    if (!persisted) {
      return null;
    }

    return this.toDomain(persisted);
  }

  async findByUsername(username: string): Promise<StaffAccount | null> {
    const normalizedUsername = username.toLowerCase();
    const staffId = await this.redis.get(`${this.staffUsernameKeyPrefix}${normalizedUsername}`) as string | null;

    if (!staffId) {
      return null;
    }

    return this.findById(StaffId.fromString(staffId)!);
  }

  private toDomain(persisted: PersistedStaff): StaffAccount {
    return StaffAccount.reconstruct(
      StaffId.fromString(persisted.id),
      persisted.username,
      persisted.passwordHash,
      StaffRole.create(persisted.role),
      persisted.active,
    );
  }
}