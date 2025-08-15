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
import { GPhonesService } from './g-phones.service';
import { CreateGPhoneDto } from './dto/create-g-phone.dto';
import { UpdateGPhoneDto } from './dto/update-g-phone.dto';
import { gPhone } from './entities/g-phone.entity';

@Controller('g-phones')
export class GPhonesController {
  constructor(private readonly gPhonesService: GPhonesService) {}

  @Post()
  async create(@Body() createGPhoneDto: CreateGPhoneDto): Promise<gPhone> {
    try {
      return await this.gPhonesService.create(createGPhoneDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create gPhone',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async findAll(
    @Query('inboxId') inboxId?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{ data: gPhone[]; total: number; page: number; limit: number }> {
    try {
      const filters = {
        inboxId: inboxId ? parseInt(inboxId) : undefined,
        status,
        type,
      };
      const pagination = {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
      };
      return await this.gPhonesService.findAll(filters, pagination);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch gPhones',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<gPhone> {
    try {
      const gPhone = await this.gPhonesService.findOne(+id);
      if (!gPhone) {
        throw new HttpException('gPhone not found', HttpStatus.NOT_FOUND);
      }
      return gPhone;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to fetch gPhone',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateGPhoneDto: UpdateGPhoneDto,
  ): Promise<gPhone> {
    try {
      const gPhone = await this.gPhonesService.update(+id, updateGPhoneDto);
      if (!gPhone) {
        throw new HttpException('gPhone not found', HttpStatus.NOT_FOUND);
      }
      return gPhone;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to update gPhone',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const result = await this.gPhonesService.remove(+id);
      if (!result) {
        throw new HttpException('gPhone not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'gPhone deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to delete gPhone',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/assign')
  async assignToInbox(
    @Param('id') id: string,
    @Body() body: { inboxId: number },
  ): Promise<gPhone> {
    try {
      const gPhone = await this.gPhonesService.assignToInbox(+id, body.inboxId);
      if (!gPhone) {
        throw new HttpException('gPhone not found', HttpStatus.NOT_FOUND);
      }
      return gPhone;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to assign gPhone',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/unassign')
  async unassignFromInbox(@Param('id') id: string): Promise<gPhone> {
    try {
      const gPhone = await this.gPhonesService.unassignFromInbox(+id);
      if (!gPhone) {
        throw new HttpException('gPhone not found', HttpStatus.NOT_FOUND);
      }
      return gPhone;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to unassign gPhone',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/mark-in-use')
  async markInUse(@Param('id') id: string): Promise<gPhone> {
    try {
      const gPhone = await this.gPhonesService.markInUse(+id);
      if (!gPhone) {
        throw new HttpException('gPhone not found', HttpStatus.NOT_FOUND);
      }
      return gPhone;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to mark gPhone in use',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/mark-available')
  async markAvailable(@Param('id') id: string): Promise<gPhone> {
    try {
      const gPhone = await this.gPhonesService.markAvailable(+id);
      if (!gPhone) {
        throw new HttpException('gPhone not found', HttpStatus.NOT_FOUND);
      }
      return gPhone;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to mark gPhone available',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/set-default')
  async setAsDefault(@Param('id') id: string): Promise<gPhone> {
    try {
      const gPhone = await this.gPhonesService.setAsDefault(+id);
      if (!gPhone) {
        throw new HttpException('gPhone not found', HttpStatus.NOT_FOUND);
      }
      return gPhone;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to set gPhone as default',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/remove-default')
  async removeAsDefault(@Param('id') id: string): Promise<gPhone> {
    try {
      const gPhone = await this.gPhonesService.removeAsDefault(+id);
      if (!gPhone) {
        throw new HttpException('gPhone not found', HttpStatus.NOT_FOUND);
      }
      return gPhone;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to remove gPhone as default',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('inbox/:inboxId')
  async findByInbox(@Param('inboxId') inboxId: string): Promise<gPhone[]> {
    try {
      return await this.gPhonesService.findByInbox(+inboxId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch inbox gPhones',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('inbox/:inboxId/available')
  async findAvailableByInbox(
    @Param('inboxId') inboxId: string,
  ): Promise<gPhone[]> {
    try {
      return await this.gPhonesService.findAvailableByInbox(+inboxId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch available inbox gPhones',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('inbox/:inboxId/default')
  async findDefaultByInbox(
    @Param('inboxId') inboxId: string,
  ): Promise<gPhone | null> {
    try {
      return await this.gPhonesService.findDefaultByInbox(+inboxId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch default inbox gPhone',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats/status')
  async getStatusStats(@Query('inboxId') inboxId?: string): Promise<{
    total: number;
    available: number;
    assigned: number;
    inUse: number;
    suspended: number;
    expired: number;
  }> {
    try {
      const filters = {
        inboxId: inboxId ? parseInt(inboxId) : undefined,
      };
      return await this.gPhonesService.getStatusStats(filters);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch status stats',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats/type')
  async getTypeStats(@Query('inboxId') inboxId?: string): Promise<{
    total: number;
    local: number;
    tollFree: number;
    shortCode: number;
    international: number;
  }> {
    try {
      const filters = {
        inboxId: inboxId ? parseInt(inboxId) : undefined,
      };
      return await this.gPhonesService.getTypeStats(filters);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch type stats',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('search/number')
  async searchByNumber(
    @Query('phoneNumber') phoneNumber: string,
    @Query('inboxId') inboxId?: string,
  ): Promise<gPhone[]> {
    try {
      const filters = {
        inboxId: inboxId ? parseInt(inboxId) : undefined,
      };
      return await this.gPhonesService.searchByNumber(phoneNumber, filters);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to search gPhones',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('search/area-code')
  async searchByAreaCode(
    @Query('areaCode') areaCode: string,
    @Query('inboxId') inboxId?: string,
  ): Promise<gPhone[]> {
    try {
      const filters = {
        inboxId: inboxId ? parseInt(inboxId) : undefined,
      };
      return await this.gPhonesService.searchByAreaCode(areaCode, filters);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to search gPhones by area code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('recently-used')
  async findRecentlyUsed(
    @Query('inboxId') inboxId?: string,
    @Query('days') days?: string,
  ): Promise<gPhone[]> {
    try {
      const filters = {
        inboxId: inboxId ? parseInt(inboxId) : undefined,
        days: days ? parseInt(days) : 7,
      };
      return await this.gPhonesService.findRecentlyUsed(filters);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch recently used gPhones',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stale')
  async findStale(
    @Query('inboxId') inboxId?: string,
    @Query('days') days?: string,
  ): Promise<gPhone[]> {
    try {
      const filters = {
        inboxId: inboxId ? parseInt(inboxId) : undefined,
        days: days ? parseInt(days) : 30,
      };
      return await this.gPhonesService.findStale(filters);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch stale gPhones',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
