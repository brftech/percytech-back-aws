import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Brand, BrandStatus } from './entities/brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

interface BrandFilters {
  companyId?: number;
  status?: string;
}

interface PaginationOptions {
  page: number;
  limit: number;
}

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private brandsRepository: Repository<Brand>,
  ) {}

  async create(createBrandDto: CreateBrandDto): Promise<Brand> {
    const brand = this.brandsRepository.create(createBrandDto);
    return await this.brandsRepository.save(brand);
  }

  async findAll(
    filters: BrandFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 10 },
  ): Promise<{ data: Brand[]; total: number; page: number; limit: number }> {
    const where: FindOptionsWhere<Brand> = {};

    if (filters.companyId) {
      where.companyId = filters.companyId;
    }

    if (filters.status) {
      where.status = filters.status as BrandStatus;
    }

    const [data, total] = await this.brandsRepository.findAndCount({
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

  async findOne(id: number): Promise<Brand | null> {
    return await this.brandsRepository.findOne({ where: { id } });
  }

  async findOneWithCampaigns(id: number): Promise<Brand | null> {
    return await this.brandsRepository.findOne({
      where: { id },
      relations: ['campaigns'],
    });
  }

  async findByCompany(companyId: number): Promise<Brand[]> {
    return await this.brandsRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveByCompany(companyId: number): Promise<Brand[]> {
    return await this.brandsRepository.find({
      where: { companyId, status: BrandStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: number,
    updateBrandDto: UpdateBrandDto,
  ): Promise<Brand | null> {
    const brand = await this.findOne(id);
    if (!brand) {
      return null;
    }

    Object.assign(brand, updateBrandDto);
    return await this.brandsRepository.save(brand);
  }

  async remove(id: number): Promise<boolean> {
    const brand = await this.findOne(id);
    if (!brand) {
      return false;
    }

    await this.brandsRepository.remove(brand);
    return true;
  }

  async verifyTCR(id: number): Promise<Brand | null> {
    const brand = await this.findOne(id);
    if (!brand) {
      return null;
    }

    // Simulate TCR verification process
    // In a real implementation, this would call an external TCR service
    brand.tcrVerified = true;
    brand.tcrVerificationDate = new Date();
    brand.status = BrandStatus.ACTIVE;
    brand.tcrResponse = {
      verified: true,
      verifiedAt: new Date().toISOString(),
      brandId: `TCR_${brand.id}_${Date.now()}`,
    };

    return await this.brandsRepository.save(brand);
  }

  async activate(id: number): Promise<Brand | null> {
    const brand = await this.findOne(id);
    if (!brand) {
      return null;
    }

    if (brand.status === BrandStatus.SUSPENDED) {
      throw new Error('Cannot activate a suspended brand');
    }

    brand.status = BrandStatus.ACTIVE;
    return await this.brandsRepository.save(brand);
  }

  async suspend(id: number): Promise<Brand | null> {
    const brand = await this.findOne(id);
    if (!brand) {
      return null;
    }

    brand.status = BrandStatus.SUSPENDED;
    return await this.brandsRepository.save(brand);
  }

  async searchByName(name: string, companyId?: number): Promise<Brand[]> {
    const where: FindOptionsWhere<Brand> = {
      name: Like(`%${name}%`),
    };

    if (companyId) {
      where.companyId = companyId;
    }

    return await this.brandsRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async getBrandStats(companyId?: number): Promise<{
    total: number;
    active: number;
    pending: number;
    suspended: number;
    verified: number;
  }> {
    const where: FindOptionsWhere<Brand> = {};
    if (companyId) {
      where.companyId = companyId;
    }

    const [total, active, pending, suspended, verified] = await Promise.all([
      this.brandsRepository.count({ where }),
      this.brandsRepository.count({
        where: { ...where, status: BrandStatus.ACTIVE },
      }),
      this.brandsRepository.count({
        where: { ...where, status: BrandStatus.PENDING },
      }),
      this.brandsRepository.count({
        where: { ...where, status: BrandStatus.SUSPENDED },
      }),
      this.brandsRepository.count({ where: { ...where, tcrVerified: true } }),
    ]);

    return {
      total,
      active,
      pending,
      suspended,
      verified,
    };
  }

  async findVerifiedBrands(companyId?: number): Promise<Brand[]> {
    const where: FindOptionsWhere<Brand> = { tcrVerified: true };
    if (companyId) {
      where.companyId = companyId;
    }

    return await this.brandsRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async findRegulatedBrands(companyId?: number): Promise<Brand[]> {
    const where: FindOptionsWhere<Brand> = {
      businessType: ['healthcare', 'financial', 'legal'] as any,
    };
    if (companyId) {
      where.companyId = companyId;
    }

    return await this.brandsRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }
}
