import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { Campaign } from './entities/campaign.entity';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  async create(
    @Body() createCampaignDto: CreateCampaignDto,
  ): Promise<Campaign> {
    try {
      return await this.campaignsService.create(createCampaignDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create campaign',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async findAll(
    @Query('brandId') brandId?: string,
    @Query('status') status?: string,
    @Query('useCase') useCase?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{ data: Campaign[]; total: number; page: number; limit: number }> {
    try {
      const filters = {
        brandId: brandId ? parseInt(brandId) : undefined,
        status,
        useCase,
      };
      const pagination = {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
      };
      return await this.campaignsService.findAll(filters, pagination);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch campaigns',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Campaign> {
    try {
      const campaign = await this.campaignsService.findOne(+id);
      if (!campaign) {
        throw new HttpException('Campaign not found', HttpStatus.NOT_FOUND);
      }
      return campaign;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to fetch campaign',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/inboxes')
  async findCampaignInboxes(@Param('id') id: string): Promise<Campaign> {
    try {
      const campaign = await this.campaignsService.findOneWithInboxes(+id);
      if (!campaign) {
        throw new HttpException('Campaign not found', HttpStatus.NOT_FOUND);
      }
      return campaign;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to fetch campaign inboxes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ): Promise<Campaign> {
    try {
      const campaign = await this.campaignsService.update(
        +id,
        updateCampaignDto,
      );
      if (!campaign) {
        throw new HttpException('Campaign not found', HttpStatus.NOT_FOUND);
      }
      return campaign;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to update campaign',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const result = await this.campaignsService.remove(+id);
      if (!result) {
        throw new HttpException('Campaign not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'Campaign deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to delete campaign',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/submit-tcr')
  async submitTCR(@Param('id') id: string): Promise<Campaign> {
    try {
      const campaign = await this.campaignsService.submitTCR(+id);
      if (!campaign) {
        throw new HttpException('Campaign not found', HttpStatus.NOT_FOUND);
      }
      return campaign;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to submit TCR',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/submit-bandwidth')
  async submitBandwidth(@Param('id') id: string): Promise<Campaign> {
    try {
      const campaign = await this.campaignsService.submitBandwidth(+id);
      if (!campaign) {
        throw new HttpException('Campaign not found', HttpStatus.NOT_FOUND);
      }
      return campaign;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to submit to Bandwidth',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/activate')
  async activate(@Param('id') id: string): Promise<Campaign> {
    try {
      const campaign = await this.campaignsService.activate(+id);
      if (!campaign) {
        throw new HttpException('Campaign not found', HttpStatus.NOT_FOUND);
      }
      return campaign;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to activate campaign',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/pause')
  async pause(@Param('id') id: string): Promise<Campaign> {
    try {
      const campaign = await this.campaignsService.pause(+id);
      if (!campaign) {
        throw new HttpException('Campaign not found', HttpStatus.NOT_FOUND);
      }
      return campaign;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to pause campaign',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/expire')
  async expire(@Param('id') id: string): Promise<Campaign> {
    try {
      const campaign = await this.campaignsService.expire(+id);
      if (!campaign) {
        throw new HttpException('Campaign not found', HttpStatus.NOT_FOUND);
      }
      return campaign;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to expire campaign',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('brand/:brandId')
  async findByBrand(@Param('brandId') brandId: string): Promise<Campaign[]> {
    try {
      return await this.campaignsService.findByBrand(+brandId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch brand campaigns',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('brand/:brandId/active')
  async findActiveByBrand(
    @Param('brandId') brandId: string,
  ): Promise<Campaign[]> {
    try {
      return await this.campaignsService.findActiveByBrand(+brandId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch active brand campaigns',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats/approval-status')
  async getApprovalStats(@Query('brandId') brandId?: string): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    active: number;
    expired: number;
  }> {
    try {
      const filters = {
        brandId: brandId ? parseInt(brandId) : undefined,
      };
      return await this.campaignsService.getApprovalStats(filters);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch approval stats',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('use-cases/regulated')
  async findRegulatedUseCases(): Promise<Campaign[]> {
    try {
      return await this.campaignsService.findRegulatedUseCases();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch regulated campaigns',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('expiring-soon')
  async findExpiringSoon(
    @Query('brandId') brandId?: string,
    @Query('days') days?: string,
  ): Promise<Campaign[]> {
    try {
      const filters = {
        brandId: brandId ? parseInt(brandId) : undefined,
        days: days ? parseInt(days) : 30,
      };
      return await this.campaignsService.findExpiringSoon(filters);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch expiring campaigns',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
