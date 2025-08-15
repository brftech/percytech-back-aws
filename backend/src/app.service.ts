import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): string {
    return "🚀 PercyTech Modern Backend is running!";
  }
}
