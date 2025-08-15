import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { BrandsService } from "./brands.service";
import { Brand } from "./entities/brand.entity";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("brands")
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  findAll() {
    return this.brandsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.brandsService.findOne(+id);
  }

  @Get("company/:companyId")
  findByCompanyId(@Param("companyId") companyId: string) {
    return this.brandsService.findByCompanyId(+companyId);
  }

  @Post("seed")
  @UseGuards(JwtAuthGuard)
  seedDefaultBrands() {
    return this.brandsService.seedDefaultBrands();
  }
}
