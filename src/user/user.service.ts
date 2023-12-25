import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async update(id: number, data: EditUserDto) {
    console.log(id);
    await this.prisma.user.update({
      where: { id },
      data: { ...data },
    });
    const user = await this.prisma.user.findUnique({ where: { id } });
    delete user.hash;
    return user;
  }
}
