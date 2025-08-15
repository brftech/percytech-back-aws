import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsWhere,
  Like,
  LessThan,
  MoreThan,
} from 'typeorm';
import {
  Conversation,
  ConversationStatus,
} from './entities/conversation.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

interface ConversationFilters {
  personId?: number;
  inboxId?: number;
  status?: string;
  hasUnread?: boolean;
}

interface PaginationOptions {
  page: number;
  limit: number;
}

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private conversationsRepository: Repository<Conversation>,
  ) {}

  async create(
    createConversationDto: CreateConversationDto,
  ): Promise<Conversation> {
    const conversation = this.conversationsRepository.create(
      createConversationDto,
    );

    // Set default status if not provided
    if (!conversation.status) {
      conversation.status = ConversationStatus.ACTIVE;
    }

    return await this.conversationsRepository.save(conversation);
  }

  async findAll(
    filters: ConversationFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 10 },
  ): Promise<{
    data: Conversation[];
    total: number;
    page: number;
    limit: number;
  }> {
    const where: FindOptionsWhere<Conversation> = {};

    if (filters.personId) {
      where.personId = filters.personId;
    }

    if (filters.inboxId) {
      where.inboxId = filters.inboxId;
    }

    if (filters.status) {
      where.status = filters.status as ConversationStatus;
    }

    let query = this.conversationsRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.person', 'person')
      .leftJoinAndSelect('conversation.inbox', 'inbox')
      .where(where);

    if (filters.hasUnread !== undefined) {
      if (filters.hasUnread) {
        query = query.andWhere('conversation.unreadCount > 0');
      } else {
        query = query.andWhere('conversation.unreadCount = 0');
      }
    }

    const [data, total] = await query
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit)
      .orderBy('conversation.lastMessageAt', 'DESC')
      .addOrderBy('conversation.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data,
      total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  async findOne(id: number): Promise<Conversation | null> {
    return await this.conversationsRepository.findOne({
      where: { id },
      relations: ['person', 'inbox'],
    });
  }

  async findByPerson(personId: number): Promise<Conversation[]> {
    return await this.conversationsRepository.find({
      where: { personId },
      order: { lastMessageAt: 'DESC' },
      relations: ['person', 'inbox'],
    });
  }

  async findByInbox(inboxId: number): Promise<Conversation[]> {
    return await this.conversationsRepository.find({
      where: { inboxId },
      order: { lastMessageAt: 'DESC' },
      relations: ['person', 'inbox'],
    });
  }

  async update(
    id: number,
    updateConversationDto: UpdateConversationDto,
  ): Promise<Conversation | null> {
    const conversation = await this.findOne(id);
    if (!conversation) {
      return null;
    }

    Object.assign(conversation, updateConversationDto);
    return await this.conversationsRepository.save(conversation);
  }

  async remove(id: number): Promise<boolean> {
    const conversation = await this.findOne(id);
    if (!conversation) {
      return false;
    }

    await this.conversationsRepository.remove(conversation);
    return true;
  }

  async archive(id: number): Promise<Conversation | null> {
    const conversation = await this.findOne(id);
    if (!conversation) {
      return null;
    }

    conversation.status = ConversationStatus.ARCHIVED;
    return await this.conversationsRepository.save(conversation);
  }

  async close(id: number): Promise<Conversation | null> {
    const conversation = await this.findOne(id);
    if (!conversation) {
      return null;
    }

    conversation.status = ConversationStatus.CLOSED;
    return await this.conversationsRepository.save(conversation);
  }

  async reactivate(id: number): Promise<Conversation | null> {
    const conversation = await this.findOne(id);
    if (!conversation) {
      return null;
    }

    conversation.status = ConversationStatus.ACTIVE;
    return await this.conversationsRepository.save(conversation);
  }

  async updateMessageCount(
    id: number,
    increment: boolean = true,
  ): Promise<Conversation | null> {
    const conversation = await this.findOne(id);
    if (!conversation) {
      return null;
    }

    if (increment) {
      conversation.messageCount += 1;
    } else {
      conversation.messageCount = Math.max(0, conversation.messageCount - 1);
    }

    conversation.lastMessageAt = new Date();
    return await this.conversationsRepository.save(conversation);
  }

  async updateUnreadCount(
    id: number,
    increment: boolean = true,
  ): Promise<Conversation | null> {
    const conversation = await this.findOne(id);
    if (!conversation) {
      return null;
    }

    if (increment) {
      conversation.unreadCount += 1;
    } else {
      conversation.unreadCount = Math.max(0, conversation.unreadCount - 1);
    }

    return await this.conversationsRepository.save(conversation);
  }

  async findActiveConversations(): Promise<Conversation[]> {
    return await this.conversationsRepository.find({
      where: { status: ConversationStatus.ACTIVE },
      order: { lastMessageAt: 'DESC' },
      relations: ['person', 'inbox'],
    });
  }

  async findArchivedConversations(): Promise<Conversation[]> {
    return await this.conversationsRepository.find({
      where: { status: ConversationStatus.ARCHIVED },
      order: { lastMessageAt: 'DESC' },
      relations: ['person', 'inbox'],
    });
  }

  async findClosedConversations(): Promise<Conversation[]> {
    return await this.conversationsRepository.find({
      where: { status: ConversationStatus.CLOSED },
      order: { lastMessageAt: 'DESC' },
      relations: ['person', 'inbox'],
    });
  }

  async findUnreadConversations(): Promise<Conversation[]> {
    return await this.conversationsRepository.find({
      where: { unreadCount: MoreThan(0) },
      order: { lastMessageAt: 'DESC' },
      relations: ['person', 'inbox'],
    });
  }

  async findRecentlyActiveConversations(
    days: number = 7,
  ): Promise<Conversation[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return await this.conversationsRepository.find({
      where: { lastMessageAt: MoreThan(cutoffDate) },
      order: { lastMessageAt: 'DESC' },
      relations: ['person', 'inbox'],
    });
  }

  async findStaleConversations(days: number = 30): Promise<Conversation[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return await this.conversationsRepository.find({
      where: { lastMessageAt: LessThan(cutoffDate) },
      order: { lastMessageAt: 'ASC' },
      relations: ['person', 'inbox'],
    });
  }

  async searchConversations(query: string): Promise<Conversation[]> {
    return await this.conversationsRepository.find({
      where: [{ title: Like(`%${query}%`) }],
      order: { lastMessageAt: 'DESC' },
      relations: ['person', 'inbox'],
    });
  }

  async getConversationStats(inboxId?: number): Promise<{
    total: number;
    active: number;
    archived: number;
    closed: number;
    unread: number;
    recentlyActive: number;
    stale: number;
  }> {
    const where: FindOptionsWhere<Conversation> = {};
    if (inboxId) {
      where.inboxId = inboxId;
    }

    const [total, active, archived, closed, unread, recentlyActive, stale] =
      await Promise.all([
        this.conversationsRepository.count({ where }),
        this.conversationsRepository.count({
          where: { ...where, status: ConversationStatus.ACTIVE },
        }),
        this.conversationsRepository.count({
          where: { ...where, status: ConversationStatus.ARCHIVED },
        }),
        this.conversationsRepository.count({
          where: { ...where, status: ConversationStatus.CLOSED },
        }),
        this.conversationsRepository.count({
          where: { ...where, unreadCount: MoreThan(0) },
        }),
        this.conversationsRepository.count({
          where: {
            ...where,
            lastMessageAt: MoreThan(
              new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            ),
          },
        }),
        this.conversationsRepository.count({
          where: {
            ...where,
            lastMessageAt: LessThan(
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            ),
          },
        }),
      ]);

    return {
      total,
      active,
      archived,
      closed,
      unread,
      recentlyActive,
      stale,
    };
  }

  async findConversationsByStatus(
    status: ConversationStatus,
    inboxId?: number,
  ): Promise<Conversation[]> {
    const where: FindOptionsWhere<Conversation> = { status };
    if (inboxId) {
      where.inboxId = inboxId;
    }

    return await this.conversationsRepository.find({
      where,
      order: { lastMessageAt: 'DESC' },
      relations: ['person', 'inbox'],
    });
  }

  async findConversationsByUnreadStatus(
    hasUnread: boolean,
    inboxId?: number,
  ): Promise<Conversation[]> {
    const where: FindOptionsWhere<Conversation> = {};
    if (inboxId) {
      where.inboxId = inboxId;
    }

    if (hasUnread) {
      where.unreadCount = MoreThan(0);
    } else {
      where.unreadCount = 0;
    }

    return await this.conversationsRepository.find({
      where,
      order: { lastMessageAt: 'DESC' },
      relations: ['person', 'inbox'],
    });
  }
}
