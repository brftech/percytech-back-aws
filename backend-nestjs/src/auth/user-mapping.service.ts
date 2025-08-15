import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class UserMappingService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getOrCreateLocalUser(supabaseUserId: string): Promise<User> {
    // First, try to find existing user by supabase_user_id
    let user = await this.userRepository.findOne({
      where: { supabaseUserId },
    });

    if (!user) {
      // Create new local user
      user = this.userRepository.create({
        supabaseUserId,
        username: `user_${supabaseUserId.substring(0, 8)}`,
        status: 'pending',
        isVerified: false,
      });

      await this.userRepository.save(user);
    }

    return user;
  }

  async updateUserFromSupabase(
    supabaseUserId: string,
    supabaseUserData: any,
  ): Promise<User> {
    const user = await this.getOrCreateLocalUser(supabaseUserId);

    // Update user data from Supabase
    if (supabaseUserData.email && user.email !== supabaseUserData.email) {
      user.email = supabaseUserData.email;
    }

    if (supabaseUserData.phone && user.phoneNumber !== supabaseUserData.phone) {
      user.phoneNumber = supabaseUserData.phone;
    }

    // Update verification status if user is confirmed in Supabase
    if (supabaseUserData.email_confirmed_at && !user.isVerified) {
      user.isVerified = true;
      user.status = 'active';
    }

    return await this.userRepository.save(user);
  }
}
