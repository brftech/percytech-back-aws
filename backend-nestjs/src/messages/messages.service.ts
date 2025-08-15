import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsWhere,
  Like,
  Between,
  MoreThan,
  LessThan,
} from 'typeorm';
import {
  Message,
  MessageDirection,
  MessageStatus,
  MessageType,
} from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

interface MessageFilters {
  personId?: number;
  gPhoneId?: number;
  direction?: string;
  status?: string;
  type?: string;
  fromNumber?: string;
  toNumber?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

interface PaginationOptions {
  page: number;
  limit: number;
}

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = this.messagesRepository.create(createMessageDto);

    // Set default status if not provided
    if (!message.status) {
      message.status = MessageStatus.PENDING;
    }

    // Set default type if not provided
    if (!message.type) {
      message.type = MessageType.SMS;
    }

    // Set sentAt for outbound messages
    if (message.direction === MessageDirection.OUTBOUND) {
      message.sentAt = new Date();
    }

    return await this.messagesRepository.save(message);
  }

  async findAll(
    filters: MessageFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 10 },
  ): Promise<{ data: Message[]; total: number; page: number; limit: number }> {
    const where: FindOptionsWhere<Message> = {};

    if (filters.personId) {
      where.personId = filters.personId;
    }

    if (filters.gPhoneId) {
      where.gPhoneId = filters.gPhoneId;
    }

    if (filters.direction) {
      where.direction = filters.direction as MessageDirection;
    }

    if (filters.status) {
      where.status = filters.status as MessageStatus;
    }

    if (filters.type) {
      where.type = filters.type as MessageType;
    }

    if (filters.fromNumber) {
      where.fromNumber = Like(`%${filters.fromNumber}%`);
    }

    if (filters.toNumber) {
      where.toNumber = Like(`%${filters.toNumber}%`);
    }

    let query = this.messagesRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.person', 'person')
      .leftJoinAndSelect('message.gPhone', 'gPhone')
      .where(where);

    if (filters.dateFrom && filters.dateTo) {
      query = query.andWhere(
        'message.createdAt BETWEEN :dateFrom AND :dateTo',
        {
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
        },
      );
    }

    const [data, total] = await query
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit)
      .orderBy('message.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data,
      total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  async findOne(id: number): Promise<Message | null> {
    return await this.messagesRepository.findOne({
      where: { id },
      relations: ['person', 'gPhone'],
    });
  }

  async findByPerson(personId: number): Promise<Message[]> {
    return await this.messagesRepository.find({
      where: { personId },
      order: { createdAt: 'DESC' },
      relations: ['person', 'gPhone'],
    });
  }

  async findByGPhone(gPhoneId: number): Promise<Message[]> {
    return await this.messagesRepository.find({
      where: { gPhoneId },
      order: { createdAt: 'DESC' },
      relations: ['person', 'gPhone'],
    });
  }

  async findByPhoneNumber(phoneNumber: string): Promise<Message[]> {
    return await this.messagesRepository.find({
      where: [{ fromNumber: phoneNumber }, { toNumber: phoneNumber }],
      order: { createdAt: 'DESC' },
      relations: ['person', 'gPhone'],
    });
  }

  async update(
    id: number,
    updateMessageDto: UpdateMessageDto,
  ): Promise<Message | null> {
    const message = await this.findOne(id);
    if (!message) {
      return null;
    }

    Object.assign(message, updateMessageDto);
    return await this.messagesRepository.save(message);
  }

  async remove(id: number): Promise<boolean> {
    const message = await this.findOne(id);
    if (!message) {
      return false;
    }

    await this.messagesRepository.remove(message);
    return true;
  }

  async markAsSent(id: number): Promise<Message | null> {
    const message = await this.findOne(id);
    if (!message) {
      return null;
    }

    message.status = MessageStatus.SENT;
    message.sentAt = new Date();

    return await this.messagesRepository.save(message);
  }

  async markAsDelivered(id: number): Promise<Message | null> {
    const message = await this.findOne(id);
    if (!message) {
      return null;
    }

    message.status = MessageStatus.DELIVERED;
    message.deliveredAt = new Date();

    return await this.messagesRepository.save(message);
  }

  async markAsRead(id: number): Promise<Message | null> {
    const message = await this.findOne(id);
    if (!message) {
      return null;
    }

    message.status = MessageStatus.READ;
    message.readAt = new Date();

    return await this.messagesRepository.save(message);
  }

  async markAsFailed(id: number): Promise<Message | null> {
    const message = await this.findOne(id);
    if (!message) {
      return null;
    }

    message.status = MessageStatus.FAILED;

    return await this.messagesRepository.save(message);
  }

  async findInboundMessages(): Promise<Message[]> {
    return await this.messagesRepository.find({
      where: { direction: MessageDirection.INBOUND },
      order: { createdAt: 'DESC' },
      relations: ['person', 'gPhone'],
    });
  }

  async findOutboundMessages(): Promise<Message[]> {
    return await this.messagesRepository.find({
      where: { direction: MessageDirection.OUTBOUND },
      order: { createdAt: 'DESC' },
      relations: ['person', 'gPhone'],
    });
  }

  async findPendingMessages(): Promise<Message[]> {
    return await this.messagesRepository.find({
      where: { status: MessageStatus.PENDING },
      order: { createdAt: 'ASC' },
      relations: ['person', 'gPhone'],
    });
  }

  async findFailedMessages(): Promise<Message[]> {
    return await this.messagesRepository.find({
      where: { status: MessageStatus.FAILED },
      order: { createdAt: 'DESC' },
      relations: ['person', 'gPhone'],
    });
  }

  async findUnreadMessages(): Promise<Message[]> {
    return await this.messagesRepository.find({
      where: [
        { status: MessageStatus.DELIVERED },
        { status: MessageStatus.SENT },
      ],
      order: { createdAt: 'DESC' },
      relations: ['person', 'gPhone'],
    });
  }

  async findMessagesByDateRange(
    dateFrom: Date,
    dateTo: Date,
  ): Promise<Message[]> {
    return await this.messagesRepository.find({
      where: {
        createdAt: Between(dateFrom, dateTo),
      },
      order: { createdAt: 'DESC' },
      relations: ['person', 'gPhone'],
    });
  }

  async findRecentMessages(hours: number = 24): Promise<Message[]> {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);

    return await this.messagesRepository.find({
      where: {
        createdAt: MoreThan(cutoffDate),
      },
      order: { createdAt: 'DESC' },
      relations: ['person', 'gPhone'],
    });
  }

  async searchMessages(query: string): Promise<Message[]> {
    return await this.messagesRepository.find({
      where: [
        { content: Like(`%${query}%`) },
        { fromNumber: Like(`%${query}%`) },
        { toNumber: Like(`%${query}%`) },
        { messageId: Like(`%${query}%`) },
      ],
      order: { createdAt: 'DESC' },
      relations: ['person', 'gPhone'],
    });
  }

  async getMessageStats(personId?: number): Promise<{
    total: number;
    inbound: number;
    outbound: number;
    pending: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    sms: number;
    mms: number;
    voice: number;
  }> {
    const where: FindOptionsWhere<Message> = {};
    if (personId) {
      where.personId = personId;
    }

    const [
      total,
      inbound,
      outbound,
      pending,
      sent,
      delivered,
      read,
      failed,
      sms,
      mms,
      voice,
    ] = await Promise.all([
      this.messagesRepository.count({ where }),
      this.messagesRepository.count({
        where: { ...where, direction: MessageDirection.INBOUND },
      }),
      this.messagesRepository.count({
        where: { ...where, direction: MessageDirection.OUTBOUND },
      }),
      this.messagesRepository.count({
        where: { ...where, status: MessageStatus.PENDING },
      }),
      this.messagesRepository.count({
        where: { ...where, status: MessageStatus.SENT },
      }),
      this.messagesRepository.count({
        where: { ...where, status: MessageStatus.DELIVERED },
      }),
      this.messagesRepository.count({
        where: { ...where, status: MessageStatus.READ },
      }),
      this.messagesRepository.count({
        where: { ...where, status: MessageStatus.FAILED },
      }),
      this.messagesRepository.count({
        where: { ...where, type: MessageType.SMS },
      }),
      this.messagesRepository.count({
        where: { ...where, type: MessageType.MMS },
      }),
      this.messagesRepository.count({
        where: { ...where, type: MessageType.VOICE },
      }),
    ]);

    return {
      total,
      inbound,
      outbound,
      pending,
      sent,
      delivered,
      read,
      failed,
      sms,
      mms,
      voice,
    };
  }

  async findMessagesByDirection(
    direction: MessageDirection,
    personId?: number,
  ): Promise<Message[]> {
    const where: FindOptionsWhere<Message> = { direction };
    if (personId) {
      where.personId = personId;
    }

    return await this.messagesRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['person', 'gPhone'],
    });
  }

  async findMessagesByStatus(
    status: MessageStatus,
    personId?: number,
  ): Promise<Message[]> {
    const where: FindOptionsWhere<Message> = { status };
    if (personId) {
      where.personId = personId;
    }

    return await this.messagesRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['person', 'gPhone'],
    });
  }

  async findMessagesByType(
    type: MessageType,
    personId?: number,
  ): Promise<Message[]> {
    const where: FindOptionsWhere<Message> = { type };
    if (personId) {
      where.personId = personId;
    }

    return await this.messagesRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['person', 'gPhone'],
    });
  }

  async getConversationHistory(
    personId: number,
    limit: number = 50,
  ): Promise<Message[]> {
    return await this.messagesRepository.find({
      where: { personId },
      order: { createdAt: 'ASC' },
      take: limit,
      relations: ['person', 'gPhone'],
    });
  }
}
