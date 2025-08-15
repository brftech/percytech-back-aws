import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { Company } from './entities/company.entity';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  async findAll(): Promise<Company[]> {
    return this.companiesService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Company> {
    return this.companiesService.findById(+id);
  }

  @Post()
  async create(@Body() companyData: Partial<Company>): Promise<Company> {
    return this.companiesService.create(companyData);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() companyData: Partial<Company>,
  ): Promise<Company> {
    return this.companiesService.update(+id, companyData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.companiesService.delete(+id);
  }

  @Post('seed')
  async seedDefaultCompanies(): Promise<void> {
    return this.companiesService.seedDefaultCompanies();
  }
}
