import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { FriendService } from './friend.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

}
