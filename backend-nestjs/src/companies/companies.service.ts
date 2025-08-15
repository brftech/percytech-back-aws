import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company, CompanyStatus } from './entities/company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
  ) {}

  async findAll(): Promise<Company[]> {
    return this.companiesRepository.find();
  }

  async findById(id: number): Promise<Company> {
    const company = await this.companiesRepository.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    return company;
  }

  async create(companyData: Partial<Company>): Promise<Company> {
    const company = this.companiesRepository.create(companyData);
    return this.companiesRepository.save(company);
  }

  async update(id: number, companyData: Partial<Company>): Promise<Company> {
    await this.companiesRepository.update(id, companyData);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.companiesRepository.delete(id);
  }

  async seedDefaultCompanies(): Promise<void> {
    const existingCompanies = await this.findAll();
    if (existingCompanies.length === 0) {
      const defaultCompanies = [
        {
          platformId: 1, // PercyTech platform
          name: 'Test Company 1',
          status: CompanyStatus.ACTIVE,
          businessType: 'technology',
        },
        {
          platformId: 1, // PercyTech platform
          name: 'Test Company 2',
          status: CompanyStatus.ACTIVE,
          businessType: 'healthcare',
        },
      ];

      for (const companyData of defaultCompanies) {
        await this.create(companyData);
      }
    }
  }
}
