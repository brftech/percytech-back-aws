import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Brand } from "./entities/brand.entity";

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private brandsRepository: Repository<Brand>
  ) {}

  async create(brandData: Partial<Brand>): Promise<Brand> {
    const brand = this.brandsRepository.create(brandData);
    return await this.brandsRepository.save(brand);
  }

  async findAll(): Promise<Brand[]> {
    return await this.brandsRepository.find();
  }

  async findOne(id: number): Promise<Brand> {
    return await this.brandsRepository.findOne({ where: { id } });
  }

  async findByCompanyId(companyId: number): Promise<Brand[]> {
    return await this.brandsRepository.find({ where: { companyId } });
  }

  async update(id: number, brandData: Partial<Brand>): Promise<Brand> {
    await this.brandsRepository.update(id, brandData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.brandsRepository.delete(id);
  }

  async seedDefaultBrands(): Promise<void> {
    // Note: This method is now deprecated as Brand entities represent user business entities
    // not platform branding. Platform branding is handled by the Platform entity.
    console.log(
      "seedDefaultBrands is deprecated - use Platform entity for platform branding"
    );
  }
}
