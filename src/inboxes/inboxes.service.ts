import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, FindOptionsWhere } from 'typeorm';
import { Inbox, InboxStatus } from './entities/inbox.entity';
import { CreateInboxDto } from './dto/create-inbox.dto';
import { UpdateInboxDto } from './dto/update-inbox.dto';

interface InboxFilters {
  companyId?: number;
  campaignId?: number;
  status?: string;
}

interface PaginationOptions {
  page: number;
  limit: number;
}

@Injectable()
export class InboxesService {
  constructor(
    @InjectRepository(Inbox)
    private inboxesRepository: Repository<Inbox>,
  ) {}

  async create(createInboxDto: CreateInboxDto): Promise<Inbox> {
    const inbox = this.inboxesRepository.create(createInboxDto);

    // Set default status if not provided
    if (!inbox.status) {
      inbox.status = InboxStatus.SETUP;
    }

    // Set default custom details limit if not provided
    if (!inbox.customDetailsLimit) {
      inbox.customDetailsLimit = 100;
    }

    return await this.inboxesRepository.save(inbox);
  }

  async findAll(
    filters: InboxFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 10 },
  ): Promise<{ data: Inbox[]; total: number; page: number; limit: number }> {
    const where: FindOptionsWhere<Inbox> = {};

    if (filters.companyId) {
      where.companyId = filters.companyId;
    }

    if (filters.campaignId) {
      where.campaignId = filters.campaignId;
    }

    if (filters.status) {
      where.status = filters.status as InboxStatus;
    }

    const [data, total] = await this.inboxesRepository.findAndCount({
      where,
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      order: { createdAt: 'DESC' },
      relations: ['company', 'campaign'],
    });

    return {
      data,
      total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  async findOne(id: number): Promise<Inbox | null> {
    return await this.inboxesRepository.findOne({
      where: { id },
      relations: ['company', 'campaign'],
    });
  }

  async findOneWithGPhones(id: number): Promise<Inbox | null> {
    return await this.inboxesRepository.findOne({
      where: { id },
      relations: ['company', 'campaign', 'gPhones'],
    });
  }

  async findByCompany(companyId: number): Promise<Inbox[]> {
    return await this.inboxesRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
      relations: ['company', 'campaign'],
    });
  }

  async findActiveByCompany(companyId: number): Promise<Inbox[]> {
    return await this.inboxesRepository.find({
      where: { companyId, status: InboxStatus.ACTIVE },
      order: { createdAt: 'DESC' },
      relations: ['company', 'campaign'],
    });
  }

  async findByCampaign(campaignId: number): Promise<Inbox[]> {
    return await this.inboxesRepository.find({
      where: { campaignId },
      order: { createdAt: 'DESC' },
      relations: ['company', 'campaign'],
    });
  }

  async update(
    id: number,
    updateInboxDto: UpdateInboxDto,
  ): Promise<Inbox | null> {
    const inbox = await this.findOne(id);
    if (!inbox) {
      return null;
    }

    Object.assign(inbox, updateInboxDto);
    return await this.inboxesRepository.save(inbox);
  }

  async remove(id: number): Promise<boolean> {
    const inbox = await this.findOne(id);
    if (!inbox) {
      return false;
    }

    await this.inboxesRepository.remove(inbox);
    return true;
  }

  async completeSetup(id: number): Promise<Inbox | null> {
    const inbox = await this.findOne(id);
    if (!inbox) {
      return null;
    }

    if (inbox.status !== InboxStatus.SETUP) {
      throw new Error('Inbox is not in setup status');
    }

    inbox.completeSetup();
    return await this.inboxesRepository.save(inbox);
  }

  async startTesting(id: number): Promise<Inbox | null> {
    const inbox = await this.findOne(id);
    if (!inbox) {
      return null;
    }

    if (inbox.status !== InboxStatus.SETUP) {
      throw new Error('Inbox must be in setup status to start testing');
    }

    inbox.startTesting();
    return await this.inboxesRepository.save(inbox);
  }

  async activate(id: number): Promise<Inbox | null> {
    const inbox = await this.findOne(id);
    if (!inbox) {
      return null;
    }

    if (inbox.status !== InboxStatus.PENDING_APPROVAL) {
      throw new Error('Inbox must be pending approval to activate');
    }

    inbox.activateWithApprovedCampaign();
    return await this.inboxesRepository.save(inbox);
  }

  async deactivate(id: number): Promise<Inbox | null> {
    const inbox = await this.findOne(id);
    if (!inbox) {
      return null;
    }

    inbox.status = InboxStatus.INACTIVE;
    return await this.inboxesRepository.save(inbox);
  }

  async assignTemporaryCampaign(
    id: number,
    campaignId: number,
    deadline: Date,
  ): Promise<Inbox | null> {
    const inbox = await this.findOne(id);
    if (!inbox) {
      return null;
    }

    inbox.assignTemporaryCampaign(campaignId, deadline);
    return await this.inboxesRepository.save(inbox);
  }

  async removeTemporaryCampaign(id: number): Promise<Inbox | null> {
    const inbox = await this.findOne(id);
    if (!inbox) {
      return null;
    }

    inbox.removeTemporaryCampaign();
    return await this.inboxesRepository.save(inbox);
  }

  async getOnboardingStats(filters: { companyId?: number } = {}): Promise<{
    total: number;
    setup: number;
    testing: number;
    pendingApproval: number;
    active: number;
    inactive: number;
  }> {
    const where: FindOptionsWhere<Inbox> = {};
    if (filters.companyId) {
      where.companyId = filters.companyId;
    }

    const [total, setup, testing, pendingApproval, active, inactive] =
      await Promise.all([
        this.inboxesRepository.count({ where }),
        this.inboxesRepository.count({
          where: { ...where, status: InboxStatus.SETUP },
        }),
        this.inboxesRepository.count({
          where: { ...where, status: InboxStatus.TESTING },
        }),
        this.inboxesRepository.count({
          where: { ...where, status: InboxStatus.PENDING_APPROVAL },
        }),
        this.inboxesRepository.count({
          where: { ...where, status: InboxStatus.ACTIVE },
        }),
        this.inboxesRepository.count({
          where: { ...where, status: InboxStatus.INACTIVE },
        }),
      ]);

    return {
      total,
      setup,
      testing,
      pendingApproval,
      active,
      inactive,
    };
  }

  async findOnboardingInProgress(
    filters: { companyId?: number } = {},
  ): Promise<Inbox[]> {
    const where: FindOptionsWhere<Inbox> = {
      status: [
        InboxStatus.SETUP,
        InboxStatus.TESTING,
        InboxStatus.PENDING_APPROVAL,
      ] as any,
    };

    if (filters.companyId) {
      where.companyId = filters.companyId;
    }

    return await this.inboxesRepository.find({
      where,
      order: { createdAt: 'ASC' },
      relations: ['company', 'campaign'],
    });
  }

  async findCampaignApprovalOverdue(
    filters: { companyId?: number } = {},
  ): Promise<Inbox[]> {
    const where: FindOptionsWhere<Inbox> = {
      campaignApprovalDeadline: LessThan(new Date()),
      isUsingTemporaryCampaign: true,
    };

    if (filters.companyId) {
      where.companyId = filters.companyId;
    }

    return await this.inboxesRepository.find({
      where,
      order: { campaignApprovalDeadline: 'ASC' },
      relations: ['company', 'campaign'],
    });
  }

  async findOperationalInboxes(companyId?: number): Promise<Inbox[]> {
    const where: FindOptionsWhere<Inbox> = {
      status: InboxStatus.ACTIVE,
    };

    if (companyId) {
      where.companyId = companyId;
    }

    return await this.inboxesRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['company', 'campaign'],
    });
  }

  async findInboxesWithDefaultPhone(companyId?: number): Promise<Inbox[]> {
    const where: FindOptionsWhere<Inbox> = {
      defaultPhoneId: null as any,
    };

    if (companyId) {
      where.companyId = companyId;
    }

    return await this.inboxesRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['company', 'campaign'],
    });
  }

  async searchByName(name: string, companyId?: number): Promise<Inbox[]> {
    const where: FindOptionsWhere<Inbox> = {
      name: `%${name}%` as any,
    };

    if (companyId) {
      where.companyId = companyId;
    }

    return await this.inboxesRepository.find({
      where,
      order: { name: 'ASC' },
      relations: ['company', 'campaign'],
    });
  }

  async getInboxStats(companyId?: number): Promise<{
    total: number;
    operational: number;
    inOnboarding: number;
    withTemporaryCampaign: number;
    overdueApproval: number;
  }> {
    const where: FindOptionsWhere<Inbox> = {};
    if (companyId) {
      where.companyId = companyId;
    }

    const [
      total,
      operational,
      inOnboarding,
      withTemporaryCampaign,
      overdueApproval,
    ] = await Promise.all([
      this.inboxesRepository.count({ where }),
      this.inboxesRepository.count({
        where: { ...where, status: InboxStatus.ACTIVE },
      }),
      this.inboxesRepository.count({
        where: {
          ...where,
          status: [
            InboxStatus.SETUP,
            InboxStatus.TESTING,
            InboxStatus.PENDING_APPROVAL,
          ] as any,
        },
      }),
      this.inboxesRepository.count({
        where: { ...where, isUsingTemporaryCampaign: true },
      }),
      this.inboxesRepository.count({
        where: {
          ...where,
          campaignApprovalDeadline: LessThan(new Date()),
          isUsingTemporaryCampaign: true,
        },
      }),
    ]);

    return {
      total,
      operational,
      inOnboarding,
      withTemporaryCampaign,
      overdueApproval,
    };
  }

  async findInboxesByAreaCode(
    areaCode: string,
    companyId?: number,
  ): Promise<Inbox[]> {
    const where: FindOptionsWhere<Inbox> = {
      areaCode,
    };

    if (companyId) {
      where.companyId = companyId;
    }

    return await this.inboxesRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['company', 'campaign'],
    });
  }

  async findInboxesByTimeZone(
    timeZone: string,
    companyId?: number,
  ): Promise<Inbox[]> {
    const where: FindOptionsWhere<Inbox> = {
      timeZone,
    };

    if (companyId) {
      where.companyId = companyId;
    }

    return await this.inboxesRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['company', 'campaign'],
    });
  }
}
