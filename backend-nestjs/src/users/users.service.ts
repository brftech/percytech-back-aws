import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like } from 'typeorm';
import { User, UserStatus, LoginMethod } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

interface UserFilters {
  status?: string;
  preferredLoginMethod?: string;
  isVerified?: boolean;
}

interface PaginationOptions {
  page: number;
  limit: number;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);

    // Set default status if not provided
    if (!user.status) {
      user.status = UserStatus.PENDING;
    }

    // Set default login method if not provided
    if (!user.preferredLoginMethod) {
      user.preferredLoginMethod = LoginMethod.SMS;
    }

    return await this.usersRepository.save(user);
  }

  async findAll(
    filters: UserFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 10 },
  ): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const where: FindOptionsWhere<User> = {};

    if (filters.status) {
      where.status = filters.status as UserStatus;
    }

    if (filters.preferredLoginMethod) {
      where.preferredLoginMethod = filters.preferredLoginMethod as LoginMethod;
    }

    if (filters.isVerified !== undefined) {
      where.isVerified = filters.isVerified;
    }

    const [data, total] = await this.usersRepository.findAndCount({
      where,
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  async findOne(id: number): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { id } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { phoneNumber } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    const user = await this.findOne(id);
    if (!user) {
      return null;
    }

    Object.assign(user, updateUserDto);
    return await this.usersRepository.save(user);
  }

  async remove(id: number): Promise<boolean> {
    const user = await this.findOne(id);
    if (!user) {
      return false;
    }

    await this.usersRepository.remove(user);
    return true;
  }

  async activate(id: number): Promise<User | null> {
    const user = await this.findOne(id);
    if (!user) {
      return null;
    }

    user.status = UserStatus.ACTIVE;
    return await this.usersRepository.save(user);
  }

  async suspend(id: number): Promise<User | null> {
    const user = await this.findOne(id);
    if (!user) {
      return null;
    }

    user.status = UserStatus.SUSPENDED;
    return await this.usersRepository.save(user);
  }

  async verify(id: number): Promise<User | null> {
    const user = await this.findOne(id);
    if (!user) {
      return null;
    }

    user.isVerified = true;
    if (user.status === UserStatus.PENDING) {
      user.status = UserStatus.ACTIVE;
    }

    return await this.usersRepository.save(user);
  }

  async findActiveUsers(): Promise<User[]> {
    return await this.usersRepository.find({
      where: { status: UserStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  async findPendingUsers(): Promise<User[]> {
    return await this.usersRepository.find({
      where: { status: UserStatus.PENDING },
      order: { createdAt: 'ASC' },
    });
  }

  async findSuspendedUsers(): Promise<User[]> {
    return await this.usersRepository.find({
      where: { status: UserStatus.SUSPENDED },
      order: { createdAt: 'DESC' },
    });
  }

  async findVerifiedUsers(): Promise<User[]> {
    return await this.usersRepository.find({
      where: { isVerified: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findUnverifiedUsers(): Promise<User[]> {
    return await this.usersRepository.find({
      where: { isVerified: false },
      order: { createdAt: 'ASC' },
    });
  }

  async findUsersByLoginMethod(loginMethod: LoginMethod): Promise<User[]> {
    return await this.usersRepository.find({
      where: { preferredLoginMethod: loginMethod },
      order: { createdAt: 'DESC' },
    });
  }

  async searchUsers(query: string): Promise<User[]> {
    return await this.usersRepository.find({
      where: [
        { username: Like(`%${query}%`) },
        { firstName: Like(`%${query}%`) },
        { lastName: Like(`%${query}%`) },
        { email: Like(`%${query}%`) },
        { phoneNumber: Like(`%${query}%`) },
      ],
      order: { username: 'ASC' },
    });
  }

  async getUserStats(): Promise<{
    total: number;
    active: number;
    pending: number;
    suspended: number;
    verified: number;
    unverified: number;
    smsUsers: number;
    emailUsers: number;
  }> {
    const [
      total,
      active,
      pending,
      suspended,
      verified,
      unverified,
      smsUsers,
      emailUsers,
    ] = await Promise.all([
      this.usersRepository.count(),
      this.usersRepository.count({ where: { status: UserStatus.ACTIVE } }),
      this.usersRepository.count({ where: { status: UserStatus.PENDING } }),
      this.usersRepository.count({ where: { status: UserStatus.SUSPENDED } }),
      this.usersRepository.count({ where: { isVerified: true } }),
      this.usersRepository.count({ where: { isVerified: false } }),
      this.usersRepository.count({
        where: { preferredLoginMethod: LoginMethod.SMS },
      }),
      this.usersRepository.count({
        where: { preferredLoginMethod: LoginMethod.EMAIL },
      }),
    ]);

    return {
      total,
      active,
      pending,
      suspended,
      verified,
      unverified,
      smsUsers,
      emailUsers,
    };
  }

  async findUsersWithPhoneAccess(): Promise<User[]> {
    return await this.usersRepository.find({
      where: { phoneNumber: null as any },
      order: { createdAt: 'DESC' },
    });
  }

  async findUsersWithEmailAccess(): Promise<User[]> {
    return await this.usersRepository.find({
      where: { email: null as any },
      order: { createdAt: 'DESC' },
    });
  }

  async findUsersByStatus(status: UserStatus): Promise<User[]> {
    return await this.usersRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  async findUsersByVerificationStatus(isVerified: boolean): Promise<User[]> {
    return await this.usersRepository.find({
      where: { isVerified },
      order: { createdAt: 'DESC' },
    });
  }
}
