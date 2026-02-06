import { Module } from '@nestjs/common'
import { DatabaseModule } from 'src/database/database.module'
import { StorageModule } from 'src/storage/storage.module'
import { BlogController } from './blog.controller'
import { BlogRepository } from './blog.repository'
import { BlogService } from './blog.service'

@Module({
  imports: [DatabaseModule, StorageModule],
  controllers: [BlogController],
  providers: [BlogService, BlogRepository],
})
export class BlogModule {}
