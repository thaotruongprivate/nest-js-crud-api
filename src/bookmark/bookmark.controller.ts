import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { User } from '@prisma/client';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}
  @Post()
  createBookmark(@GetUser() user: User, @Body() dto: CreateBookmarkDto) {
    return this.bookmarkService.createBookmark(user.id, dto);
  }
  @Get()
  getBookmarks(@GetUser() user: User) {
    return this.bookmarkService.getBookmarks(user.id);
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  updateBookmark(
    @GetUser() user: User,
    @Body() dto: EditBookmarkDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.bookmarkService.updateBookmark(user.id, id, dto);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBookmark(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.bookmarkService.deleteBookmark(user.id, id);
  }
}
