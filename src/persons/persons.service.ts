import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, LessThan } from 'typeorm';
import { Person, PersonStatus, PersonType } from './entities/person.entity';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

interface PersonFilters {
  inboxId?: number;
  status?: string;
  type?: string;
  optIn?: boolean;
  company?: string;
}

interface PaginationOptions {
  page: number;
  limit: number;
}

@Injectable()
export class PersonsService {
  constructor(
    @InjectRepository(Person)
    private personsRepository: Repository<Person>,
  ) {}

  async create(createPersonDto: CreatePersonDto): Promise<Person> {
    const person = this.personsRepository.create(createPersonDto);

    // Set default status if not provided
    if (!person.status) {
      person.status = PersonStatus.ACTIVE;
    }

    // Set default type if not provided
    if (!person.type) {
      person.type = PersonType.CUSTOMER;
    }

    // Set default optIn if not provided
    if (person.optIn === undefined) {
      person.optIn = true;
    }

    return await this.personsRepository.save(person);
  }

  async findAll(
    filters: PersonFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 10 },
  ): Promise<{ data: Person[]; total: number; page: number; limit: number }> {
    const where: FindOptionsWhere<Person> = {};

    if (filters.inboxId) {
      where.inboxId = filters.inboxId;
    }

    if (filters.status) {
      where.status = filters.status as PersonStatus;
    }

    if (filters.type) {
      where.type = filters.type as PersonType;
    }

    if (filters.optIn !== undefined) {
      where.optIn = filters.optIn;
    }

    if (filters.company) {
      where.company = Like(`%${filters.company}%`);
    }

    const [data, total] = await this.personsRepository.findAndCount({
      where,
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      order: { createdAt: 'DESC' },
      relations: ['inbox'],
    });

    return {
      data,
      total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  async findOne(id: number): Promise<Person | null> {
    return await this.personsRepository.findOne({
      where: { id },
      relations: ['inbox'],
    });
  }

  async findByPhone(phoneNumber: string): Promise<Person | null> {
    return await this.personsRepository.findOne({
      where: { cell_phone: phoneNumber },
      relations: ['inbox'],
    });
  }

  async findByEmail(email: string): Promise<Person | null> {
    return await this.personsRepository.findOne({
      where: { email },
      relations: ['inbox'],
    });
  }

  async findByInbox(inboxId: number): Promise<Person[]> {
    return await this.personsRepository.find({
      where: { inboxId },
      order: { createdAt: 'DESC' },
      relations: ['inbox'],
    });
  }

  async update(
    id: number,
    updatePersonDto: UpdatePersonDto,
  ): Promise<Person | null> {
    const person = await this.findOne(id);
    if (!person) {
      return null;
    }

    Object.assign(person, updatePersonDto);
    return await this.personsRepository.save(person);
  }

  async remove(id: number): Promise<boolean> {
    const person = await this.findOne(id);
    if (!person) {
      return false;
    }

    await this.personsRepository.remove(person);
    return true;
  }

  async activate(id: number): Promise<Person | null> {
    const person = await this.findOne(id);
    if (!person) {
      return null;
    }

    person.status = PersonStatus.ACTIVE;
    return await this.personsRepository.save(person);
  }

  async deactivate(id: number): Promise<Person | null> {
    const person = await this.findOne(id);
    if (!person) {
      return null;
    }

    person.status = PersonStatus.INACTIVE;
    return await this.personsRepository.save(person);
  }

  async block(id: number): Promise<Person | null> {
    const person = await this.findOne(id);
    if (!person) {
      return null;
    }

    person.status = PersonStatus.BLOCKED;
    return await this.personsRepository.save(person);
  }

  async markAsSpam(id: number): Promise<Person | null> {
    const person = await this.findOne(id);
    if (!person) {
      return null;
    }

    person.status = PersonStatus.SPAM;
    return await this.personsRepository.save(person);
  }

  async optIn(id: number): Promise<Person | null> {
    const person = await this.findOne(id);
    if (!person) {
      return null;
    }

    person.optIn = true;
    person.optInDate = new Date();
    person.optOutDate = null as any;

    return await this.personsRepository.save(person);
  }

  async optOut(id: number): Promise<Person | null> {
    const person = await this.findOne(id);
    if (!person) {
      return null;
    }

    person.optIn = false;
    person.optOutDate = new Date();

    return await this.personsRepository.save(person);
  }

  async updateLastContact(id: number): Promise<Person | null> {
    const person = await this.findOne(id);
    if (!person) {
      return null;
    }

    person.lastContactAt = new Date();
    person.messageCount += 1;

    return await this.personsRepository.save(person);
  }

  async findActivePersons(): Promise<Person[]> {
    return await this.personsRepository.find({
      where: { status: PersonStatus.ACTIVE },
      order: { createdAt: 'DESC' },
      relations: ['inbox'],
    });
  }

  async findOptedInPersons(): Promise<Person[]> {
    return await this.personsRepository.find({
      where: { optIn: true },
      order: { createdAt: 'DESC' },
      relations: ['inbox'],
    });
  }

  async findOptedOutPersons(): Promise<Person[]> {
    return await this.personsRepository.find({
      where: { optIn: false },
      order: { createdAt: 'DESC' },
      relations: ['inbox'],
    });
  }

  async findRecentlyContacted(days: number = 7): Promise<Person[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return await this.personsRepository.find({
      where: { lastContactAt: LessThan(cutoffDate) },
      order: { lastContactAt: 'DESC' },
      relations: ['inbox'],
    });
  }

  async findStalePersons(days: number = 30): Promise<Person[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return await this.personsRepository.find({
      where: { lastContactAt: LessThan(cutoffDate) },
      order: { lastContactAt: 'ASC' },
      relations: ['inbox'],
    });
  }

  async searchPersons(query: string): Promise<Person[]> {
    return await this.personsRepository.find({
      where: [
        { firstName: Like(`%${query}%`) },
        { lastName: Like(`%${query}%`) },
        { company: Like(`%${query}%`) },
        { cell_phone: Like(`%${query}%`) },
        { email: Like(`%${query}%`) },
      ],
      order: { firstName: 'ASC' },
      relations: ['inbox'],
    });
  }

  async getPersonStats(inboxId?: number): Promise<{
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
    const where: FindOptionsWhere<Person> = {};
    if (inboxId) {
      where.inboxId = inboxId;
    }

    const [
      total,
      active,
      inactive,
      blocked,
      spam,
      optedIn,
      optedOut,
      customers,
      leads,
      partners,
      employees,
    ] = await Promise.all([
      this.personsRepository.count({ where }),
      this.personsRepository.count({
        where: { ...where, status: PersonStatus.ACTIVE },
      }),
      this.personsRepository.count({
        where: { ...where, status: PersonStatus.INACTIVE },
      }),
      this.personsRepository.count({
        where: { ...where, status: PersonStatus.BLOCKED },
      }),
      this.personsRepository.count({
        where: { ...where, status: PersonStatus.SPAM },
      }),
      this.personsRepository.count({ where: { ...where, optIn: true } }),
      this.personsRepository.count({ where: { ...where, optIn: false } }),
      this.personsRepository.count({
        where: { ...where, type: PersonType.CUSTOMER },
      }),
      this.personsRepository.count({
        where: { ...where, type: PersonType.LEAD },
      }),
      this.personsRepository.count({
        where: { ...where, type: PersonType.PARTNER },
      }),
      this.personsRepository.count({
        where: { ...where, type: PersonType.EMPLOYEE },
      }),
    ]);

    return {
      total,
      active,
      inactive,
      blocked,
      spam,
      optedIn,
      optedOut,
      customers,
      leads,
      partners,
      employees,
    };
  }

  async findPersonsByType(
    type: PersonType,
    inboxId?: number,
  ): Promise<Person[]> {
    const where: FindOptionsWhere<Person> = { type };
    if (inboxId) {
      where.inboxId = inboxId;
    }

    return await this.personsRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['inbox'],
    });
  }

  async findPersonsByStatus(
    status: PersonStatus,
    inboxId?: number,
  ): Promise<Person[]> {
    const where: FindOptionsWhere<Person> = { status };
    if (inboxId) {
      where.inboxId = inboxId;
    }

    return await this.personsRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['inbox'],
    });
  }

  async findPersonsByCompany(
    company: string,
    inboxId?: number,
  ): Promise<Person[]> {
    const where: FindOptionsWhere<Person> = { company: Like(`%${company}%`) };
    if (inboxId) {
      where.inboxId = inboxId;
    }

    return await this.personsRepository.find({
      where,
      order: { company: 'ASC' },
      relations: ['inbox'],
    });
  }

  async findPersonsByTag(tag: string, inboxId?: number): Promise<Person[]> {
    const where: FindOptionsWhere<Person> = {};
    if (inboxId) {
      where.inboxId = inboxId;
    }

    const persons = await this.personsRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['inbox'],
    });

    return persons.filter((person) => person.tags && person.tags.includes(tag));
  }
}
