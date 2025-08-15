import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Platform,
  PlatformType,
  PlatformStatus,
} from './entities/platform.entity';

@Injectable()
export class PlatformsService {
  constructor(
    @InjectRepository(Platform)
    private platformsRepository: Repository<Platform>,
  ) {}

  async findAll(): Promise<Platform[]> {
    return this.platformsRepository.find();
  }

  async findById(id: number): Promise<Platform> {
    const platform = await this.platformsRepository.findOne({ where: { id } });
    if (!platform) {
      throw new NotFoundException(`Platform with ID ${id} not found`);
    }
    return platform;
  }

  async findByType(type: PlatformType): Promise<Platform> {
    const platform = await this.platformsRepository.findOne({
      where: { type },
    });
    if (!platform) {
      throw new NotFoundException(`Platform with type ${type} not found`);
    }
    return platform;
  }

  async create(platformData: Partial<Platform>): Promise<Platform> {
    const platform = this.platformsRepository.create(platformData);
    return this.platformsRepository.save(platform);
  }

  async update(id: number, platformData: Partial<Platform>): Promise<Platform> {
    await this.platformsRepository.update(id, platformData);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.platformsRepository.delete(id);
  }

  async seedDefaultPlatforms(): Promise<void> {
    const existingPlatforms = await this.findAll();
    if (existingPlatforms.length > 0) return;

    const defaultPlatforms = [
      {
        type: PlatformType.PERCYTECH,
        name: 'PercyTech',
        displayName: 'PercyTech Core',
        description: 'Core SMS communication platform',
        status: PlatformStatus.ACTIVE,
        isDefault: true,
      },
      {
        type: PlatformType.GNYMBLE,
        name: 'Gnymble',
        displayName: 'Gnymble',
        description: 'Highly-regulated SMS platform',
        status: PlatformStatus.ACTIVE,
        isDefault: false,
      },
      {
        type: PlatformType.PERCYMD,
        name: 'PercyMD',
        displayName: 'PercyMD',
        description: 'Healthcare SMS platform',
        status: PlatformStatus.ACTIVE,
        isDefault: false,
      },
      {
        type: PlatformType.PERCYTEXT,
        name: 'PercyText',
        displayName: 'PercyText',
        description: 'General business SMS platform',
        status: PlatformStatus.ACTIVE,
        isDefault: false,
      },
    ];

    for (const platformData of defaultPlatforms) {
      await this.create(platformData);
    }
  }
}
