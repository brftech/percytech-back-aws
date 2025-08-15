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
import { PersonsService } from './persons.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { Person } from './entities/person.entity';

@Controller('persons')
export class PersonsController {
  constructor(private readonly personsService: PersonsService) {}

  @Post()
  async create(@Body() createPersonDto: CreatePersonDto): Promise<Person> {
    try {
      return await this.personsService.create(createPersonDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create person',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async findAll(
    @Query('inboxId') inboxId?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('optIn') optIn?: string,
    @Query('company') company?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{ data: Person[]; total: number; page: number; limit: number }> {
    try {
      const filters = {
        inboxId: inboxId ? parseInt(inboxId) : undefined,
        status,
        type,
        optIn: optIn ? optIn === 'true' : undefined,
        company,
      };
      const pagination = {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
      };
      return await this.personsService.findAll(filters, pagination);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch persons',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Person> {
    try {
      const person = await this.personsService.findOne(+id);
      if (!person) {
        throw new HttpException('Person not found', HttpStatus.NOT_FOUND);
      }
      return person;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to fetch person',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('phone/:phoneNumber')
  async findByPhone(
    @Param('phoneNumber') phoneNumber: string,
  ): Promise<Person> {
    try {
      const person = await this.personsService.findByPhone(phoneNumber);
      if (!person) {
        throw new HttpException('Person not found', HttpStatus.NOT_FOUND);
      }
      return person;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to fetch person',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string): Promise<Person> {
    try {
      const person = await this.personsService.findByEmail(email);
      if (!person) {
        throw new HttpException('Person not found', HttpStatus.NOT_FOUND);
      }
      return person;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to fetch person',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('inbox/:inboxId')
  async findByInbox(@Param('inboxId') inboxId: string): Promise<Person[]> {
    try {
      return await this.personsService.findByInbox(+inboxId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch inbox persons',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePersonDto: UpdatePersonDto,
  ): Promise<Person> {
    try {
      const person = await this.personsService.update(+id, updatePersonDto);
      if (!person) {
        throw new HttpException('Person not found', HttpStatus.NOT_FOUND);
      }
      return person;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to update person',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const result = await this.personsService.remove(+id);
      if (!result) {
        throw new HttpException('Person not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'Person deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to delete person',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/activate')
  async activate(@Param('id') id: string): Promise<Person> {
    try {
      const person = await this.personsService.activate(+id);
      if (!person) {
        throw new HttpException('Person not found', HttpStatus.NOT_FOUND);
      }
      return person;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to activate person',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/deactivate')
  async deactivate(@Param('id') id: string): Promise<Person> {
    try {
      const person = await this.personsService.deactivate(+id);
      if (!person) {
        throw new HttpException('Person not found', HttpStatus.NOT_FOUND);
      }
      return person;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to deactivate person',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/block')
  async block(@Param('id') id: string): Promise<Person> {
    try {
      const person = await this.personsService.block(+id);
      if (!person) {
        throw new HttpException('Person not found', HttpStatus.NOT_FOUND);
      }
      return person;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to block person',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/mark-spam')
  async markAsSpam(@Param('id') id: string): Promise<Person> {
    try {
      const person = await this.personsService.markAsSpam(+id);
      if (!person) {
        throw new HttpException('Person not found', HttpStatus.NOT_FOUND);
      }
      return person;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to mark person as spam',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/opt-in')
  async optIn(@Param('id') id: string): Promise<Person> {
    try {
      const person = await this.personsService.optIn(+id);
      if (!person) {
        throw new HttpException('Person not found', HttpStatus.NOT_FOUND);
      }
      return person;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to opt in person',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/opt-out')
  async optOut(@Param('id') id: string): Promise<Person> {
    try {
      const person = await this.personsService.optOut(+id);
      if (!person) {
        throw new HttpException('Person not found', HttpStatus.NOT_FOUND);
      }
      return person;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to opt out person',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('status/active')
  async findActivePersons(): Promise<Person[]> {
    try {
      return await this.personsService.findActivePersons();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch active persons',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('opt-in/opted-in')
  async findOptedInPersons(): Promise<Person[]> {
    try {
      return await this.personsService.findOptedInPersons();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch opted in persons',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('opt-in/opted-out')
  async findOptedOutPersons(): Promise<Person[]> {
    try {
      return await this.personsService.findOptedOutPersons();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch opted out persons',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('contact/recently-contacted')
  async findRecentlyContacted(@Query('days') days?: string): Promise<Person[]> {
    try {
      const daysNumber = days ? parseInt(days) : 7;
      return await this.personsService.findRecentlyContacted(daysNumber);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch recently contacted persons',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('contact/stale')
  async findStalePersons(@Query('days') days?: string): Promise<Person[]> {
    try {
      const daysNumber = days ? parseInt(days) : 30;
      return await this.personsService.findStalePersons(daysNumber);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch stale persons',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('search/:query')
  async searchPersons(@Param('query') query: string): Promise<Person[]> {
    try {
      return await this.personsService.searchPersons(query);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to search persons',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats/overview')
  async getPersonStats(@Query('inboxId') inboxId?: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    blocked: number;
    spam: number;
    optedIn: number;
    optedOut: number;
    customers: number;
    leads: number;
    partners: number;
    employees: number;
  }> {
    try {
      const filters = {
        inboxId: inboxId ? parseInt(inboxId) : undefined,
      };
      return await this.personsService.getPersonStats(filters.inboxId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch person stats',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('type/:type')
  async findPersonsByType(
    @Param('type') type: string,
    @Query('inboxId') inboxId?: string,
  ): Promise<Person[]> {
    try {
      const filters = {
        inboxId: inboxId ? parseInt(inboxId) : undefined,
      };
      return await this.personsService.findPersonsByType(
        type as any,
        filters.inboxId,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch persons by type',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('company/:company')
  async findPersonsByCompany(
    @Param('company') company: string,
    @Query('inboxId') inboxId?: string,
  ): Promise<Person[]> {
    try {
      const filters = {
        inboxId: inboxId ? parseInt(inboxId) : undefined,
      };
      return await this.personsService.findPersonsByCompany(
        company,
        filters.inboxId,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch persons by company',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('tag/:tag')
  async findPersonsByTag(
    @Param('tag') tag: string,
    @Query('inboxId') inboxId?: string,
  ): Promise<Person[]> {
    try {
      const filters = {
        inboxId: inboxId ? parseInt(inboxId) : undefined,
      };
      return await this.personsService.findPersonsByTag(tag, filters.inboxId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch persons by tag',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
