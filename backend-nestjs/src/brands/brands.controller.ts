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
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Brand } from './entities/brand.entity';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  async create(@Body() createBrandDto: CreateBrandDto): Promise<Brand> {
    try {
      return await this.brandsService.create(createBrandDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create brand',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{ data: Brand[]; total: number; page: number; limit: number }> {
    try {
      const filters = {
        companyId: companyId ? parseInt(companyId) : undefined,
        status,
      };
      const pagination = {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
      };
      return await this.brandsService.findAll(filters, pagination);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch brands',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Brand> {
    try {
      const brand = await this.brandsService.findOne(+id);
      if (!brand) {
        throw new HttpException('Brand not found', HttpStatus.NOT_FOUND);
      }
      return brand;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to fetch brand',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/campaigns')
  async findBrandCampaigns(@Param('id') id: string): Promise<Brand> {
    try {
      const brand = await this.brandsService.findOneWithCampaigns(+id);
      if (!brand) {
        throw new HttpException('Brand not found', HttpStatus.NOT_FOUND);
      }
      return brand;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to fetch brand campaigns',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto,
  ): Promise<Brand> {
    try {
      const brand = await this.brandsService.update(+id, updateBrandDto);
      if (!brand) {
        throw new HttpException('Brand not found', HttpStatus.NOT_FOUND);
      }
      return brand;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to update brand',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const result = await this.brandsService.remove(+id);
      if (!result) {
        throw new HttpException('Brand not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'Brand deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to delete brand',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/verify-tcr')
  async verifyTCR(@Param('id') id: string): Promise<Brand> {
    try {
      const brand = await this.brandsService.verifyTCR(+id);
      if (!brand) {
        throw new HttpException('Brand not found', HttpStatus.NOT_FOUND);
      }
      return brand;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to verify TCR',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/activate')
  async activate(@Param('id') id: string): Promise<Brand> {
    try {
      const brand = await this.brandsService.activate(+id);
      if (!brand) {
        throw new HttpException('Brand not found', HttpStatus.NOT_FOUND);
      }
      return brand;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to activate brand',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/suspend')
  async suspend(@Param('id') id: string): Promise<Brand> {
    try {
      const brand = await this.brandsService.suspend(+id);
      if (!brand) {
        throw new HttpException('Brand not found', HttpStatus.NOT_FOUND);
      }
      return brand;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to suspend brand',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
