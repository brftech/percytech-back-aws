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
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { Conversation } from './entities/conversation.entity';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  async create(
    @Body() createConversationDto: CreateConversationDto,
  ): Promise<Conversation> {
    try {
      return await this.conversationsService.create(createConversationDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create conversation',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async findAll(
    @Query('personId') personId?: string,
    @Query('inboxId') inboxId?: string,
    @Query('status') status?: string,
    @Query('hasUnread') hasUnread?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{
    data: Conversation[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const filters = {
        personId: personId ? parseInt(personId) : undefined,
        inboxId: inboxId ? parseInt(inboxId) : undefined,
        status,
        hasUnread: hasUnread ? hasUnread === 'true' : undefined,
      };
      const pagination = {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
      };
      return await this.conversationsService.findAll(filters, pagination);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch conversations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Conversation> {
    try {
      const conversation = await this.conversationsService.findOne(+id);
      if (!conversation) {
        throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);
      }
      return conversation;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to fetch conversation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('person/:personId')
  async findByPerson(
    @Param('personId') personId: string,
  ): Promise<Conversation[]> {
    try {
      return await this.conversationsService.findByPerson(+personId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch person conversations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('inbox/:inboxId')
  async findByInbox(
    @Param('inboxId') inboxId: string,
  ): Promise<Conversation[]> {
    try {
      return await this.conversationsService.findByInbox(+inboxId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch inbox conversations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
  ): Promise<Conversation> {
    try {
      const conversation = await this.conversationsService.update(
        +id,
        updateConversationDto,
      );
      if (!conversation) {
        throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);
      }
      return conversation;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to update conversation',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const result = await this.conversationsService.remove(+id);
      if (!result) {
        throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'Conversation deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to delete conversation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/archive')
  async archive(@Param('id') id: string): Promise<Conversation> {
    try {
      const conversation = await this.conversationsService.archive(+id);
      if (!conversation) {
        throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);
      }
      return conversation;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to archive conversation',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/close')
  async close(@Param('id') id: string): Promise<Conversation> {
    try {
      const conversation = await this.conversationsService.close(+id);
      if (!conversation) {
        throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);
      }
      return conversation;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to close conversation',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/reactivate')
  async reactivate(@Param('id') id: string): Promise<Conversation> {
    try {
      const conversation = await this.conversationsService.reactivate(+id);
      if (!conversation) {
        throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);
      }
      return conversation;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to reactivate conversation',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('status/active')
  async findActiveConversations(): Promise<Conversation[]> {
    try {
      return await this.conversationsService.findActiveConversations();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch active conversations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('status/archived')
  async findArchivedConversations(): Promise<Conversation[]> {
    try {
      return await this.conversationsService.findArchivedConversations();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch archived conversations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('status/closed')
  async findClosedConversations(): Promise<Conversation[]> {
    try {
      return await this.conversationsService.findClosedConversations();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch closed conversations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('unread/with-unread')
  async findUnreadConversations(): Promise<Conversation[]> {
    try {
      return await this.conversationsService.findUnreadConversations();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch unread conversations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('activity/recently-active')
  async findRecentlyActiveConversations(
    @Query('days') days?: string,
  ): Promise<Conversation[]> {
    try {
      const daysNumber = days ? parseInt(days) : 7;
      return await this.conversationsService.findRecentlyActiveConversations(
        daysNumber,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch recently active conversations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('activity/stale')
  async findStaleConversations(
    @Query('days') days?: string,
  ): Promise<Conversation[]> {
    try {
      const daysNumber = days ? parseInt(days) : 30;
      return await this.conversationsService.findStaleConversations(daysNumber);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch stale conversations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('search/:query')
  async searchConversations(
    @Param('query') query: string,
  ): Promise<Conversation[]> {
    try {
      return await this.conversationsService.searchConversations(query);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to search conversations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats/overview')
  async getConversationStats(@Query('inboxId') inboxId?: string): Promise<{
    total: number;
    active: number;
    archived: number;
    closed: number;
    unread: number;
    recentlyActive: number;
    stale: number;
  }> {
    try {
      const filters = {
        inboxId: inboxId ? parseInt(inboxId) : undefined,
      };
      return await this.conversationsService.getConversationStats(
        filters.inboxId,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch conversation stats',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
