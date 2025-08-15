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
import { InboxesService } from './inboxes.service';
import { CreateInboxDto } from './dto/create-inbox.dto';
import { UpdateInboxDto } from './dto/update-inbox.dto';
import { Inbox } from './entities/inbox.entity';

@Controller('inboxes')
export class InboxesController {
  constructor(private readonly inboxesService: InboxesService) {}

  @Post()
  async create(@Body() createInboxDto: CreateInboxDto): Promise<Inbox> {
    try {
      return await this.inboxesService.create(createInboxDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create inbox',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('campaignId') campaignId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{ data: Inbox[]; total: number; page: number; limit: number }> {
    try {
      const filters = {
        companyId: companyId ? parseInt(companyId) : undefined,
        campaignId: campaignId ? parseInt(campaignId) : undefined,
        status,
      };
      const pagination = {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
      };
      return await this.inboxesService.findAll(filters, pagination);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch inboxes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Inbox> {
    try {
      const inbox = await this.inboxesService.findOne(+id);
      if (!inbox) {
        throw new HttpException('Inbox not found', HttpStatus.NOT_FOUND);
      }
      return inbox;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to fetch inbox',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/g-phones')
  async findInboxGPhones(@Param('id') id: string): Promise<Inbox> {
    try {
      const inbox = await this.inboxesService.findOneWithGPhones(+id);
      if (!inbox) {
        throw new HttpException('Inbox not found', HttpStatus.NOT_FOUND);
      }
      return inbox;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to fetch inbox phones',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateInboxDto: UpdateInboxDto,
  ): Promise<Inbox> {
    try {
      const inbox = await this.inboxesService.update(+id, updateInboxDto);
      if (!inbox) {
        throw new HttpException('Inbox not found', HttpStatus.NOT_FOUND);
      }
      return inbox;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to update inbox',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const result = await this.inboxesService.remove(+id);
      if (!result) {
        throw new HttpException('Inbox not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'Inbox deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to delete inbox',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/complete-setup')
  async completeSetup(@Param('id') id: string): Promise<Inbox> {
    try {
      const inbox = await this.inboxesService.completeSetup(+id);
      if (!inbox) {
        throw new HttpException('Inbox not found', HttpStatus.NOT_FOUND);
      }
      return inbox;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to complete setup',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/start-testing')
  async startTesting(@Param('id') id: string): Promise<Inbox> {
    try {
      const inbox = await this.inboxesService.startTesting(+id);
      if (!inbox) {
        throw new HttpException('Inbox not found', HttpStatus.NOT_FOUND);
      }
      return inbox;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to start testing',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/activate')
  async activate(@Param('id') id: string): Promise<Inbox> {
    try {
      const inbox = await this.inboxesService.activate(+id);
      if (!inbox) {
        throw new HttpException('Inbox not found', HttpStatus.NOT_FOUND);
      }
      return inbox;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to activate inbox',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/deactivate')
  async deactivate(@Param('id') id: string): Promise<Inbox> {
    try {
      const inbox = await this.inboxesService.deactivate(+id);
      if (!inbox) {
        throw new HttpException('Inbox not found', HttpStatus.NOT_FOUND);
      }
      return inbox;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to deactivate inbox',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/assign-temporary-campaign')
  async assignTemporaryCampaign(
    @Param('id') id: string,
    @Body() body: { campaignId: number; deadline: string },
  ): Promise<Inbox> {
    try {
      const inbox = await this.inboxesService.assignTemporaryCampaign(
        +id,
        body.campaignId,
        new Date(body.deadline),
      );
      if (!inbox) {
        throw new HttpException('Inbox not found', HttpStatus.NOT_FOUND);
      }
      return inbox;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to assign temporary campaign',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/remove-temporary-campaign')
  async removeTemporaryCampaign(@Param('id') id: string): Promise<Inbox> {
    try {
      const inbox = await this.inboxesService.removeTemporaryCampaign(+id);
      if (!inbox) {
        throw new HttpException('Inbox not found', HttpStatus.NOT_FOUND);
      }
      return inbox;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to remove temporary campaign',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('company/:companyId')
  async findByCompany(@Param('companyId') companyId: string): Promise<Inbox[]> {
    try {
      return await this.inboxesService.findByCompany(+companyId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch company inboxes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('company/:companyId/active')
  async findActiveByCompany(
    @Param('companyId') companyId: string,
  ): Promise<Inbox[]> {
    try {
      return await this.inboxesService.findActiveByCompany(+companyId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch active company inboxes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('campaign/:campaignId')
  async findByCampaign(
    @Param('campaignId') campaignId: string,
  ): Promise<Inbox[]> {
    try {
      return await this.inboxesService.findByCampaign(+campaignId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch campaign inboxes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats/onboarding')
  async getOnboardingStats(@Query('companyId') companyId?: string): Promise<{
    total: number;
    setup: number;
    testing: number;
    pendingApproval: number;
    active: number;
    inactive: number;
  }> {
    try {
      const filters = {
        companyId: companyId ? parseInt(companyId) : undefined,
      };
      return await this.inboxesService.getOnboardingStats(filters);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch onboarding stats',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('onboarding/in-progress')
  async findOnboardingInProgress(
    @Query('companyId') companyId?: string,
  ): Promise<Inbox[]> {
    try {
      const filters = {
        companyId: companyId ? parseInt(companyId) : undefined,
      };
      return await this.inboxesService.findOnboardingInProgress(filters);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch onboarding inboxes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('campaign-approval/overdue')
  async findCampaignApprovalOverdue(
    @Query('companyId') companyId?: string,
  ): Promise<Inbox[]> {
    try {
      const filters = {
        companyId: companyId ? parseInt(companyId) : undefined,
      };
      return await this.inboxesService.findCampaignApprovalOverdue(filters);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch overdue approval inboxes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
