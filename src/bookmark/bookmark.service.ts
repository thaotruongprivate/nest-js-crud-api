import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Bookmark } from '@prisma/client';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}
  getBookmarks(userId: number): Promise<Bookmark[]> {
    return this.prisma.bookmark.findMany({
      where: {
        userId,
      },
    });
  }

  createBookmark(id: number, dto: CreateBookmarkDto) {
    return this.prisma.bookmark.create({
      data: {
        ...dto,
        userId: id,
      },
    });
  }

  async updateBookmark(userId: number, id: number, dto: EditBookmarkDto) {
    const bookmark = await this.prisma.bookmark.findUnique({ where: { id } });
    if (!bookmark || bookmark.userId !== userId) {
      throw new NotFoundException('Bookmark not found');
    }
    await this.prisma.bookmark.update({
      where: { id },
      data: { ...dto },
    });
    return this.prisma.bookmark.findUnique({ where: { id } });
  }

  async deleteBookmark(userId: number, id: number) {
    const bookmark = await this.prisma.bookmark.findUnique({ where: { id } });
    if (!bookmark || bookmark.userId !== userId) {
      throw new NotFoundException('Bookmark not found');
    }
    await this.prisma.bookmark.deleteMany({
      where: {
        id,
      },
    });
  }
}
