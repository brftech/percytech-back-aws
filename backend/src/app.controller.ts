import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("health")
  getHealth() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "PercyTech Modern Backend",
      version: "1.0.0",
    };
  }

  @Get("api/status")
  getApiStatus() {
    return {
      status: "operational",
      endpoints: {
        auth: "/api/auth",
        users: "/api/users",
        brands: "/api/brands",
      },
    };
  }
}
