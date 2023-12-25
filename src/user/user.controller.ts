import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';
import { EditUserDto } from './dto';
import { UserService } from './user.service';
@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('/me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  async updateMe(@Body() dto: EditUserDto, @GetUser() user: User) {
    return await this.userService.update(user.id, dto);
  }
}
