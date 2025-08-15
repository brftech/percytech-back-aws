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
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async create(@Body() createMessageDto: CreateMessageDto): Promise<Message> {
    try {
      return await this.messagesService.create(createMessageDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create message',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async findAll(
    @Query('personId') personId?: string,
    @Query('gPhoneId') gPhoneId?: string,
    @Query('direction') direction?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('fromNumber') fromNumber?: string,
    @Query('toNumber') toNumber?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{ data: Message[]; total: number; page: number; limit: number }> {
    try {
      const filters = {
        personId: personId ? parseInt(personId) : undefined,
        gPhoneId: gPhoneId ? parseInt(gPhoneId) : undefined,
        direction,
        status,
        type,
        fromNumber,
        toNumber,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
      };
      const pagination = {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
      };
      return await this.messagesService.findAll(filters, pagination);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch messages',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Message> {
    try {
      const message = await this.messagesService.findOne(+id);
      if (!message) {
        throw new HttpException('Message not found', HttpStatus.NOT_FOUND);
      }
      return message;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to fetch message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('person/:personId')
  async findByPerson(@Param('personId') personId: string): Promise<Message[]> {
    try {
      return await this.messagesService.findByPerson(+personId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch person messages',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('g-phone/:gPhoneId')
  async findByGPhone(@Param('gPhoneId') gPhoneId: string): Promise<Message[]> {
    try {
      return await this.messagesService.findByGPhone(+gPhoneId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch gPhone messages',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('phone/:phoneNumber')
  async findByPhoneNumber(
    @Param('phoneNumber') phoneNumber: string,
  ): Promise<Message[]> {
    try {
      return await this.messagesService.findByPhoneNumber(phoneNumber);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch phone messages',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ): Promise<Message> {
    try {
      const message = await this.messagesService.update(+id, updateMessageDto);
      if (!message) {
        throw new HttpException('Message not found', HttpStatus.NOT_FOUND);
      }
      return message;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to update message',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const result = await this.messagesService.remove(+id);
      if (!result) {
        throw new HttpException('Message not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'Message deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to delete message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/mark-sent')
  async markAsSent(@Param('id') id: string): Promise<Message> {
    try {
      const message = await this.messagesService.markAsSent(+id);
      if (!message) {
        throw new HttpException('Message not found', HttpStatus.NOT_FOUND);
      }
      return message;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to mark message as sent',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/mark-delivered')
  async markAsDelivered(@Param('id') id: string): Promise<Message> {
    try {
      const message = await this.messagesService.markAsDelivered(+id);
      if (!message) {
        throw new HttpException('Message not found', HttpStatus.NOT_FOUND);
      }
      return message;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to mark message as delivered',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/mark-read')
  async markAsRead(@Param('id') id: string): Promise<Message> {
    try {
      const message = await this.messagesService.markAsRead(+id);
      if (!message) {
        throw new HttpException('Message not found', HttpStatus.NOT_FOUND);
      }
      return message;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to mark message as read',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/mark-failed')
  async markAsFailed(@Param('id') id: string): Promise<Message> {
    try {
      const message = await this.messagesService.markAsFailed(+id);
      if (!message) {
        throw new HttpException('Message not found', HttpStatus.NOT_FOUND);
      }
      return message;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to mark message as failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('direction/inbound')
  async findInboundMessages(): Promise<Message[]> {
    try {
      return await this.messagesService.findInboundMessages();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch inbound messages',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('direction/outbound')
  async findOutboundMessages(): Promise<Message[]> {
    try {
      return await this.messagesService.findOutboundMessages();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch outbound messages',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('status/pending')
  async findPendingMessages(): Promise<Message[]> {
    try {
      return await this.messagesService.findPendingMessages();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch pending messages',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('status/failed')
  async findFailedMessages(): Promise<Message[]> {
    try {
      return await this.messagesService.findFailedMessages();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch failed messages',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('status/unread')
  async findUnreadMessages(): Promise<Message[]> {
    try {
      return await this.messagesService.findUnreadMessages();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch unread messages',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('date-range')
  async findMessagesByDateRange(
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
  ): Promise<Message[]> {
    try {
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      return await this.messagesService.findMessagesByDateRange(
        fromDate,
        toDate,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch messages by date range',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('recent')
  async findRecentMessages(@Query('hours') hours?: string): Promise<Message[]> {
    try {
      const hoursNumber = hours ? parseInt(hours) : 24;
      return await this.messagesService.findRecentMessages(hoursNumber);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch recent messages',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('search/:query')
  async searchMessages(@Param('query') query: string): Promise<Message[]> {
    try {
      return await this.messagesService.searchMessages(query);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to search messages',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats/overview')
  async getMessageStats(@Query('personId') personId?: string): Promise<{
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
    try {
      const filters = {
        personId: personId ? parseInt(personId) : undefined,
      };
      return await this.messagesService.getMessageStats(filters.personId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch message stats',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('conversation/:personId')
  async getConversationHistory(
    @Param('personId') personId: string,
    @Query('limit') limit?: string,
  ): Promise<Message[]> {
    try {
      const limitNumber = limit ? parseInt(limit) : 50;
      return await this.messagesService.getConversationHistory(
        +personId,
        limitNumber,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch conversation history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
