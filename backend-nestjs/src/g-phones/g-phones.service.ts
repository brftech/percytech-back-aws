import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, FindOptionsWhere, Like } from 'typeorm';
import { gPhone, gPhoneStatus, gPhoneType } from './entities/g-phone.entity';
import { CreateGPhoneDto } from './dto/create-g-phone.dto';
import { UpdateGPhoneDto } from './dto/update-g-phone.dto';

interface GPhoneFilters {
  inboxId?: number;
  status?: string;
  type?: string;
}

interface PaginationOptions {
  page: number;
  limit: number;
}

@Injectable()
export class GPhonesService {
  constructor(
    @InjectRepository(gPhone)
    private gPhonesRepository: Repository<gPhone>,
  ) {}

  async create(createGPhoneDto: CreateGPhoneDto): Promise<gPhone> {
    const gPhone = this.gPhonesRepository.create(createGPhoneDto);

    // Set default status if not provided
    if (!gPhone.status) {
      gPhone.status = gPhoneStatus.AVAILABLE;
    }

    // Set default type if not provided
    if (!gPhone.type) {
      gPhone.type = gPhoneType.LOCAL;
    }

    return await this.gPhonesRepository.save(gPhone);
  }

  async findAll(
    filters: GPhoneFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 10 },
  ): Promise<{ data: gPhone[]; total: number; page: number; limit: number }> {
    const where: FindOptionsWhere<gPhone> = {};

    if (filters.inboxId) {
      where.inboxId = filters.inboxId;
    }

    if (filters.status) {
      where.status = filters.status as gPhoneStatus;
    }

    if (filters.type) {
      where.type = filters.type as gPhoneType;
    }

    const [data, total] = await this.gPhonesRepository.findAndCount({
      where,
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      order: { createdAt: 'DESC' },
      relations: ['inbox'],
    });

    return {
      data,
      total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  async findOne(id: number): Promise<gPhone | null> {
    return await this.gPhonesRepository.findOne({
      where: { id },
      relations: ['inbox'],
    });
  }

  async findByInbox(inboxId: number): Promise<gPhone[]> {
    return await this.gPhonesRepository.find({
      where: { inboxId },
      order: { createdAt: 'DESC' },
      relations: ['inbox'],
    });
  }

  async findAvailableByInbox(inboxId: number): Promise<gPhone[]> {
    return await this.gPhonesRepository.find({
      where: { inboxId, status: gPhoneStatus.AVAILABLE },
      order: { createdAt: 'ASC' },
      relations: ['inbox'],
    });
  }

  async findDefaultByInbox(inboxId: number): Promise<gPhone | null> {
    return await this.gPhonesRepository.findOne({
      where: { inboxId, isDefault: true },
      relations: ['inbox'],
    });
  }

  async update(
    id: number,
    updateGPhoneDto: UpdateGPhoneDto,
  ): Promise<gPhone | null> {
    const gPhone = await this.findOne(id);
    if (!gPhone) {
      return null;
    }

    Object.assign(gPhone, updateGPhoneDto);
    return await this.gPhonesRepository.save(gPhone);
  }

  async remove(id: number): Promise<boolean> {
    const gPhone = await this.findOne(id);
    if (!gPhone) {
      return false;
    }

    await this.gPhonesRepository.remove(gPhone);
    return true;
  }

  async assignToInbox(id: number, inboxId: number): Promise<gPhone | null> {
    const gPhone = await this.findOne(id);
    if (!gPhone) {
      return null;
    }

    if (gPhone.status !== gPhoneStatus.AVAILABLE) {
      throw new Error('Phone must be available to assign');
    }

    gPhone.assignToInbox(inboxId);
    return await this.gPhonesRepository.save(gPhone);
  }

  async unassignFromInbox(id: number): Promise<gPhone | null> {
    const gPhone = await this.findOne(id);
    if (!gPhone) {
      return null;
    }

    gPhone.unassignFromInbox();
    return await this.gPhonesRepository.save(gPhone);
  }

  async markInUse(id: number): Promise<gPhone | null> {
    const gPhone = await this.findOne(id);
    if (!gPhone) {
      return null;
    }

    if (!gPhone.isAssignedToInbox) {
      throw new Error('Phone must be assigned to an inbox to mark as in use');
    }

    gPhone.markAsInUse();
    return await this.gPhonesRepository.save(gPhone);
  }

  async markAvailable(id: number): Promise<gPhone | null> {
    const gPhone = await this.findOne(id);
    if (!gPhone) {
      return null;
    }

    gPhone.markAsAvailable();
    return await this.gPhonesRepository.save(gPhone);
  }

  async setAsDefault(id: number): Promise<gPhone | null> {
    const gPhone = await this.findOne(id);
    if (!gPhone) {
      return null;
    }

    // Remove default from other phones in the same inbox
    if (gPhone.inboxId) {
      await this.gPhonesRepository.update(
        { inboxId: gPhone.inboxId, isDefault: true },
        { isDefault: false },
      );
    }

    gPhone.setAsDefault();
    return await this.gPhonesRepository.save(gPhone);
  }

  async removeAsDefault(id: number): Promise<gPhone | null> {
    const gPhone = await this.findOne(id);
    if (!gPhone) {
      return null;
    }

    gPhone.removeAsDefault();
    return await this.gPhonesRepository.save(gPhone);
  }

  async getStatusStats(filters: { inboxId?: number } = {}): Promise<{
    total: number;
    available: number;
    assigned: number;
    inUse: number;
    suspended: number;
    expired: number;
  }> {
    const where: FindOptionsWhere<gPhone> = {};
    if (filters.inboxId) {
      where.inboxId = filters.inboxId;
    }

    const [total, available, assigned, inUse, suspended, expired] =
      await Promise.all([
        this.gPhonesRepository.count({ where }),
        this.gPhonesRepository.count({
          where: { ...where, status: gPhoneStatus.AVAILABLE },
        }),
        this.gPhonesRepository.count({
          where: { ...where, status: gPhoneStatus.ASSIGNED },
        }),
        this.gPhonesRepository.count({
          where: { ...where, status: gPhoneStatus.IN_USE },
        }),
        this.gPhonesRepository.count({
          where: { ...where, status: gPhoneStatus.SUSPENDED },
        }),
        this.gPhonesRepository.count({
          where: { ...where, status: gPhoneStatus.EXPIRED },
        }),
      ]);

    return {
      total,
      available,
      assigned,
      inUse,
      suspended,
      expired,
    };
  }

  async getTypeStats(filters: { inboxId?: number } = {}): Promise<{
    total: number;
    local: number;
    tollFree: number;
    shortCode: number;
    international: number;
  }> {
    const where: FindOptionsWhere<gPhone> = {};
    if (filters.inboxId) {
      where.inboxId = filters.inboxId;
    }

    const [total, local, tollFree, shortCode, international] =
      await Promise.all([
        this.gPhonesRepository.count({ where }),
        this.gPhonesRepository.count({
          where: { ...where, type: gPhoneType.LOCAL },
        }),
        this.gPhonesRepository.count({
          where: { ...where, type: gPhoneType.TOLL_FREE },
        }),
        this.gPhonesRepository.count({
          where: { ...where, type: gPhoneType.SHORT_CODE },
        }),
        this.gPhonesRepository.count({
          where: { ...where, type: gPhoneType.INTERNATIONAL },
        }),
      ]);

    return {
      total,
      local,
      tollFree,
      shortCode,
      international,
    };
  }

  async searchByNumber(
    phoneNumber: string,
    filters: { inboxId?: number } = {},
  ): Promise<gPhone[]> {
    const where: FindOptionsWhere<gPhone> = {
      phoneNumber: Like(`%${phoneNumber}%`),
    };

    if (filters.inboxId) {
      where.inboxId = filters.inboxId;
    }

    return await this.gPhonesRepository.find({
      where,
      order: { phoneNumber: 'ASC' },
      relations: ['inbox'],
    });
  }

  async searchByAreaCode(
    areaCode: string,
    filters: { inboxId?: number } = {},
  ): Promise<gPhone[]> {
    const where: FindOptionsWhere<gPhone> = {
      areaCode,
    };

    if (filters.inboxId) {
      where.inboxId = filters.inboxId;
    }

    return await this.gPhonesRepository.find({
      where,
      order: { phoneNumber: 'ASC' },
      relations: ['inbox'],
    });
  }

  async findRecentlyUsed(
    filters: { inboxId?: number; days?: number } = {},
  ): Promise<gPhone[]> {
    const { inboxId, days = 7 } = filters;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const where: FindOptionsWhere<gPhone> = {
      lastUsedAt: LessThan(cutoffDate),
    };

    if (inboxId) {
      where.inboxId = inboxId;
    }

    return await this.gPhonesRepository.find({
      where,
      order: { lastUsedAt: 'DESC' },
      relations: ['inbox'],
    });
  }

  async findStale(
    filters: { inboxId?: number; days?: number } = {},
  ): Promise<gPhone[]> {
    const { inboxId, days = 30 } = filters;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const where: FindOptionsWhere<gPhone> = {
      lastUsedAt: LessThan(cutoffDate),
    };

    if (inboxId) {
      where.inboxId = inboxId;
    }

    return await this.gPhonesRepository.find({
      where,
      order: { lastUsedAt: 'ASC' },
      relations: ['inbox'],
    });
  }

  async findUnassigned(): Promise<gPhone[]> {
    return await this.gPhonesRepository.find({
      where: { inboxId: null as any },
      order: { createdAt: 'DESC' },
    });
  }

  async findAssigned(): Promise<gPhone[]> {
    return await this.gPhonesRepository.find({
      where: { inboxId: null as any },
      order: { createdAt: 'DESC' },
      relations: ['inbox'],
    });
  }

  async findByLocation(
    city?: string,
    state?: string,
    country?: string,
  ): Promise<gPhone[]> {
    const where: FindOptionsWhere<gPhone> = {};

    if (city) {
      where.city = city;
    }
    if (state) {
      where.state = state;
    }
    if (country) {
      where.country = country;
    }

    return await this.gPhonesRepository.find({
      where,
      order: { city: 'ASC', state: 'ASC' },
      relations: ['inbox'],
    });
  }

  async getGPhoneStats(inboxId?: number): Promise<{
    total: number;
    assigned: number;
    unassigned: number;
    inUse: number;
    available: number;
    defaultPhone: number;
  }> {
    const where: FindOptionsWhere<gPhone> = {};
    if (inboxId) {
      where.inboxId = inboxId;
    }

    const [total, assigned, unassigned, inUse, available, defaultPhone] =
      await Promise.all([
        this.gPhonesRepository.count({ where }),
        this.gPhonesRepository.count({
          where: { ...where, inboxId: null as any },
        }),
        this.gPhonesRepository.count({
          where: { ...where, inboxId: null as any },
        }),
        this.gPhonesRepository.count({
          where: { ...where, status: gPhoneStatus.IN_USE },
        }),
        this.gPhonesRepository.count({
          where: { ...where, status: gPhoneStatus.AVAILABLE },
        }),
        this.gPhonesRepository.count({ where: { ...where, isDefault: true } }),
      ]);

    return {
      total,
      assigned,
      unassigned,
      inUse,
      available,
      defaultPhone,
    };
  }
}
