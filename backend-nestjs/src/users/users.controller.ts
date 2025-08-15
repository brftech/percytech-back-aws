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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create user',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('preferredLoginMethod') preferredLoginMethod?: string,
    @Query('isVerified') isVerified?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    try {
      const filters = {
        status,
        preferredLoginMethod,
        isVerified: isVerified ? isVerified === 'true' : undefined,
      };
      const pagination = {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
      };
      return await this.usersService.findAll(filters, pagination);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    try {
      const user = await this.usersService.findOne(+id);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to fetch user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('username/:username')
  async findByUsername(@Param('username') username: string): Promise<User> {
    try {
      const user = await this.usersService.findByUsername(username);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to fetch user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string): Promise<User> {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to fetch user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('phone/:phoneNumber')
  async findByPhoneNumber(
    @Param('phoneNumber') phoneNumber: string,
  ): Promise<User> {
    try {
      const user = await this.usersService.findByPhoneNumber(phoneNumber);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to fetch user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    try {
      const user = await this.usersService.update(+id, updateUserDto);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to update user',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const result = await this.usersService.remove(+id);
      if (!result) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'User deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to delete user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/activate')
  async activate(@Param('id') id: string): Promise<User> {
    try {
      const user = await this.usersService.activate(+id);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to activate user',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/suspend')
  async suspend(@Param('id') id: string): Promise<User> {
    try {
      const user = await this.usersService.suspend(+id);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to suspend user',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/verify')
  async verify(@Param('id') id: string): Promise<User> {
    try {
      const user = await this.usersService.verify(+id);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to verify user',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('status/active')
  async findActiveUsers(): Promise<User[]> {
    try {
      return await this.usersService.findActiveUsers();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch active users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('status/pending')
  async findPendingUsers(): Promise<User[]> {
    try {
      return await this.usersService.findPendingUsers();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch pending users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('status/suspended')
  async findSuspendedUsers(): Promise<User[]> {
    try {
      return await this.usersService.findSuspendedUsers();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch suspended users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('verification/verified')
  async findVerifiedUsers(): Promise<User[]> {
    try {
      return await this.usersService.findVerifiedUsers();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch verified users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('verification/unverified')
  async findUnverifiedUsers(): Promise<User[]> {
    try {
      return await this.usersService.findUnverifiedUsers();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch unverified users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('login-method/:method')
  async findUsersByLoginMethod(
    @Param('method') method: string,
  ): Promise<User[]> {
    try {
      return await this.usersService.findUsersByLoginMethod(method as any);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch users by login method',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('search/:query')
  async searchUsers(@Param('query') query: string): Promise<User[]> {
    try {
      return await this.usersService.searchUsers(query);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to search users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats/overview')
  async getUserStats(): Promise<{
    total: number;
    active: number;
    pending: number;
    suspended: number;
    verified: number;
    unverified: number;
    smsUsers: number;
    emailUsers: number;
  }> {
    try {
      return await this.usersService.getUserStats();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch user stats',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('access/phone')
  async findUsersWithPhoneAccess(): Promise<User[]> {
    try {
      return await this.usersService.findUsersWithPhoneAccess();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch users with phone access',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('access/email')
  async findUsersWithEmailAccess(): Promise<User[]> {
    try {
      return await this.usersService.findUsersWithEmailAccess();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch users with email access',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
