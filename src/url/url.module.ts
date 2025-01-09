import { Module } from '@nestjs/common';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from './entities/url.entity';
import { Analytic } from './entities/analytic.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Url, Analytic]),
  ],
  controllers: [UrlController],
  providers: [UrlService],
})
export class UrlModule {}
