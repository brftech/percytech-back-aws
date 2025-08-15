import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, FindOptionsWhere } from 'typeorm';
import {
  Campaign,
  CampaignStatus,
  ApprovalStatus,
  UseCase,
} from './entities/campaign.entity';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

interface CampaignFilters {
  brandId?: number;
  status?: string;
  useCase?: string;
}

interface PaginationOptions {
  page: number;
  limit: number;
}

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private campaignsRepository: Repository<Campaign>,
  ) {}

  async create(createCampaignDto: CreateCampaignDto): Promise<Campaign> {
    const campaign = this.campaignsRepository.create(createCampaignDto);

    // Set default status if not provided
    if (!campaign.status) {
      campaign.status = CampaignStatus.DRAFT;
    }

    // Set default approval statuses
    if (!campaign.tcrStatus) {
      campaign.tcrStatus = ApprovalStatus.PENDING;
    }
    if (!campaign.bandwidthStatus) {
      campaign.bandwidthStatus = ApprovalStatus.PENDING;
    }

    return await this.campaignsRepository.save(campaign);
  }

  async findAll(
    filters: CampaignFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 10 },
  ): Promise<{ data: Campaign[]; total: number; page: number; limit: number }> {
    const where: FindOptionsWhere<Campaign> = {};

    if (filters.brandId) {
      where.brandId = filters.brandId;
    }

    if (filters.status) {
      where.status = filters.status as CampaignStatus;
    }

    if (filters.useCase) {
      where.useCase = filters.useCase as UseCase;
    }

    const [data, total] = await this.campaignsRepository.findAndCount({
      where,
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      order: { createdAt: 'DESC' },
      relations: ['brand'],
    });

    return {
      data,
      total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  async findOne(id: number): Promise<Campaign | null> {
    return await this.campaignsRepository.findOne({
      where: { id },
      relations: ['brand'],
    });
  }

  async findOneWithInboxes(id: number): Promise<Campaign | null> {
    return await this.campaignsRepository.findOne({
      where: { id },
      relations: ['brand', 'inboxes'],
    });
  }

  async findByBrand(brandId: number): Promise<Campaign[]> {
    return await this.campaignsRepository.find({
      where: { brandId },
      order: { createdAt: 'DESC' },
      relations: ['brand'],
    });
  }

  async findActiveByBrand(brandId: number): Promise<Campaign[]> {
    return await this.campaignsRepository.find({
      where: { brandId, status: CampaignStatus.ACTIVE },
      order: { createdAt: 'DESC' },
      relations: ['brand'],
    });
  }

  async update(
    id: number,
    updateCampaignDto: UpdateCampaignDto,
  ): Promise<Campaign | null> {
    const campaign = await this.findOne(id);
    if (!campaign) {
      return null;
    }

    Object.assign(campaign, updateCampaignDto);
    return await this.campaignsRepository.save(campaign);
  }

  async remove(id: number): Promise<boolean> {
    const campaign = await this.findOne(id);
    if (!campaign) {
      return false;
    }

    await this.campaignsRepository.remove(campaign);
    return true;
  }

  async submitTCR(id: number): Promise<Campaign | null> {
    const campaign = await this.findOne(id);
    if (!campaign) {
      return null;
    }

    if (!campaign.requiresTCRApproval) {
      throw new Error('This campaign does not require TCR approval');
    }

    // Simulate TCR submission
    campaign.tcrStatus = ApprovalStatus.UNDER_REVIEW;
    campaign.tcrSubmittedAt = new Date();
    campaign.tcrResponse = {
      submitted: true,
      submittedAt: new Date().toISOString(),
      campaignId: `TCR_CAMPAIGN_${campaign.id}_${Date.now()}`,
    };

    return await this.campaignsRepository.save(campaign);
  }

  async submitBandwidth(id: number): Promise<Campaign | null> {
    const campaign = await this.findOne(id);
    if (!campaign) {
      return null;
    }

    // Simulate Bandwidth submission
    campaign.bandwidthStatus = ApprovalStatus.UNDER_REVIEW;
    campaign.bandwidthResponse = {
      submitted: true,
      submittedAt: new Date().toISOString(),
      campaignId: `BW_CAMPAIGN_${campaign.id}_${Date.now()}`,
    };

    return await this.campaignsRepository.save(campaign);
  }

  async activate(id: number): Promise<Campaign | null> {
    const campaign = await this.findOne(id);
    if (!campaign) {
      return null;
    }

    if (!campaign.isApproved) {
      throw new Error('Campaign must be approved before activation');
    }

    campaign.status = CampaignStatus.ACTIVE;
    return await this.campaignsRepository.save(campaign);
  }

  async pause(id: number): Promise<Campaign | null> {
    const campaign = await this.findOne(id);
    if (!campaign) {
      return null;
    }

    if (campaign.status !== CampaignStatus.ACTIVE) {
      throw new Error('Only active campaigns can be paused');
    }

    campaign.status = CampaignStatus.PAUSED;
    return await this.campaignsRepository.save(campaign);
  }

  async expire(id: number): Promise<Campaign | null> {
    const campaign = await this.findOne(id);
    if (!campaign) {
      return null;
    }

    campaign.status = CampaignStatus.EXPIRED;
    return await this.campaignsRepository.save(campaign);
  }

  async getApprovalStats(filters: { brandId?: number } = {}): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    active: number;
    expired: number;
  }> {
    const where: FindOptionsWhere<Campaign> = {};
    if (filters.brandId) {
      where.brandId = filters.brandId;
    }

    const [total, pending, approved, rejected, active, expired] =
      await Promise.all([
        this.campaignsRepository.count({ where }),
        this.campaignsRepository.count({
          where: { ...where, status: CampaignStatus.PENDING_APPROVAL },
        }),
        this.campaignsRepository.count({
          where: {
            ...where,
            tcrStatus: ApprovalStatus.APPROVED,
            bandwidthStatus: ApprovalStatus.APPROVED,
          },
        }),
        this.campaignsRepository.count({
          where: {
            ...where,
            tcrStatus: ApprovalStatus.REJECTED,
          },
        }),
        this.campaignsRepository.count({
          where: { ...where, status: CampaignStatus.ACTIVE },
        }),
        this.campaignsRepository.count({
          where: { ...where, status: CampaignStatus.EXPIRED },
        }),
      ]);

    return {
      total,
      pending,
      approved,
      rejected,
      active,
      expired,
    };
  }

  async findRegulatedUseCases(): Promise<Campaign[]> {
    const regulatedUseCases = [
      UseCase.TWO_FACTOR,
      UseCase.ACCOUNT_NOTIFICATION,
      UseCase.CUSTOMER_SERVICE,
      UseCase.DELIVERY_NOTIFICATION,
      UseCase.APPOINTMENT_REMINDER,
    ];

    return await this.campaignsRepository.find({
      where: { useCase: regulatedUseCases as any },
      order: { createdAt: 'DESC' },
      relations: ['brand'],
    });
  }

  async findExpiringSoon(
    filters: { brandId?: number; days?: number } = {},
  ): Promise<Campaign[]> {
    const { brandId, days = 30 } = filters;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    const where: FindOptionsWhere<Campaign> = {
      expiresAt: LessThan(expiryDate),
      status: CampaignStatus.ACTIVE,
    };

    if (brandId) {
      where.brandId = brandId;
    }

    return await this.campaignsRepository.find({
      where,
      order: { expiresAt: 'ASC' },
      relations: ['brand'],
    });
  }

  async findExpired(): Promise<Campaign[]> {
    return await this.campaignsRepository.find({
      where: {
        expiresAt: LessThan(new Date()),
        status: CampaignStatus.ACTIVE,
      },
      order: { expiresAt: 'DESC' },
      relations: ['brand'],
    });
  }

  async findPendingApproval(brandId?: number): Promise<Campaign[]> {
    const where: FindOptionsWhere<Campaign> = {
      status: CampaignStatus.PENDING_APPROVAL,
    };

    if (brandId) {
      where.brandId = brandId;
    }

    return await this.campaignsRepository.find({
      where,
      order: { createdAt: 'ASC' },
      relations: ['brand'],
    });
  }

  async findApprovedNotActive(brandId?: number): Promise<Campaign[]> {
    const where: FindOptionsWhere<Campaign> = {
      tcrStatus: ApprovalStatus.APPROVED,
      bandwidthStatus: ApprovalStatus.APPROVED,
      status: CampaignStatus.APPROVED,
    };

    if (brandId) {
      where.brandId = brandId;
    }

    return await this.campaignsRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['brand'],
    });
  }

  async searchByName(name: string, brandId?: number): Promise<Campaign[]> {
    const where: FindOptionsWhere<Campaign> = {
      name: `%${name}%` as any,
    };

    if (brandId) {
      where.brandId = brandId;
    }

    return await this.campaignsRepository.find({
      where,
      order: { name: 'ASC' },
      relations: ['brand'],
    });
  }

  async getCampaignStats(brandId?: number): Promise<{
    total: number;
    draft: number;
    pendingApproval: number;
    approved: number;
    active: number;
    paused: number;
    expired: number;
  }> {
    const where: FindOptionsWhere<Campaign> = {};
    if (brandId) {
      where.brandId = brandId;
    }

    const [total, draft, pendingApproval, approved, active, paused, expired] =
      await Promise.all([
        this.campaignsRepository.count({ where }),
        this.campaignsRepository.count({
          where: { ...where, status: CampaignStatus.DRAFT },
        }),
        this.campaignsRepository.count({
          where: { ...where, status: CampaignStatus.PENDING_APPROVAL },
        }),
        this.campaignsRepository.count({
          where: { ...where, status: CampaignStatus.APPROVED },
        }),
        this.campaignsRepository.count({
          where: { ...where, status: CampaignStatus.ACTIVE },
        }),
        this.campaignsRepository.count({
          where: { ...where, status: CampaignStatus.PAUSED },
        }),
        this.campaignsRepository.count({
          where: { ...where, status: CampaignStatus.EXPIRED },
        }),
      ]);

    return {
      total,
      draft,
      pendingApproval,
      approved,
      active,
      paused,
      expired,
    };
  }
}
