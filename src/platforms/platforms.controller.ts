import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { PlatformsService } from './platforms.service';
import { Platform, PlatformType } from './entities/platform.entity';

@Controller('platforms')
export class PlatformsController {
  constructor(private readonly platformsService: PlatformsService) {}

  @Get()
  async findAll(): Promise<Platform[]> {
    return this.platformsService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Platform> {
    return this.platformsService.findById(+id);
  }

  @Get('type/:type')
  async findByType(@Param('type') type: PlatformType): Promise<Platform> {
    return this.platformsService.findByType(type);
  }

  @Post()
  async create(@Body() platformData: Partial<Platform>): Promise<Platform> {
    return this.platformsService.create(platformData);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() platformData: Partial<Platform>,
  ): Promise<Platform> {
    return this.platformsService.update(+id, platformData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.platformsService.delete(+id);
  }

  @Post('seed')
  async seedDefaultPlatforms(): Promise<void> {
    return this.platformsService.seedDefaultPlatforms();
  }
}
