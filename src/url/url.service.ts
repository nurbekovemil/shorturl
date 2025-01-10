import { BadRequestException, ConflictException, GoneException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Url } from './entities/url.entity';
import { CreateUrlDto } from './dto/create-url.dto';
import { v4 as uuid } from 'uuid';
import { Analytic } from './entities/analytic.entity';

@Injectable()
export class UrlService {
  constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
    @InjectRepository(Analytic)
    private readonly analyticRepository: Repository<Analytic>,
  ) {}

  async createShortUrl(createUrlDto: CreateUrlDto) {
    try {
      const { originalUrl, alias, expiresAt  } = createUrlDto;
      if(alias && await this.urlRepository.findOne({ where: { shortUrl: alias } })) {
        throw new ConflictException(`Alias ${alias} already exists`);
      }
      const shortUrl = alias || uuid().slice(0, 6);
      const url = this.urlRepository.create({ originalUrl, shortUrl, expiresAt  });
      const savedUrl = await this.urlRepository.save(url);
      return {
        shortUrl: `http://localhost:3001/${savedUrl.shortUrl}`,
      };
    } catch (error) {
      throw error
    }
  }

  async getOriginalUrl(shortUrl: string, res, ip){
    try {
      const url = await this.urlRepository.findOne({ where: { shortUrl } });
      if (!url) {
        throw new NotFoundException(`Short URL not found: ${shortUrl}`);
      }
      if (url.expiresAt && url.expiresAt < new Date()) {
        throw new GoneException('Short URL has expired');
      }
      const isExistIp = await this.analyticRepository.findOne({
        where: { shortUrlId: url.shortUrl, ipAddress: ip },
      });
      if (!isExistIp) {
        url.clickCount += 1;
        this.analyticRepository.save({ shortUrlId: url.shortUrl, ipAddress: ip });
        this.urlRepository.save(url);
      }
      return res.redirect(url.originalUrl);
    } catch (error) {
      throw error
    }
  }
  
  async getAnalytics(shortUrl: string): Promise<{ clickCount: number; lastIPs: string[] }> {
    try {
      const analytics = await this.analyticRepository.find({
        where: { shortUrlId: shortUrl },
        order: { accessedAt: 'DESC' },
      });
      if (!analytics.length) {
        throw new NotFoundException(`Analytics not found for URL: ${shortUrl}`);
      }
      const clickCount = analytics.length;
      const lastIPs = analytics.slice(0, 5).map((entry) => entry.ipAddress);
      return { clickCount, lastIPs };
    } catch (error) {
        throw error;
    }
  }
  

  async getUrlInfo(shortUrl: string) {
    try {
      const url = await this.urlRepository.findOne({ where: { shortUrl } });
      if (!url) {
        throw new NotFoundException(`ShortURL not found: ${shortUrl}`);
      }
      return url;
    } catch (error) {
      throw error;
    }
  }

  async deleteShortUrl(shortUrl: string) {
    try {
      const result = await this.urlRepository.delete({ shortUrl });
      if (result.affected === 0) {
        throw new NotFoundException(`Short URL not found: ${shortUrl}`);
      }
      this.analyticRepository.delete({ shortUrlId: shortUrl });
      return { message: 'Short URL deleted' };
    } catch (error) {
      throw error;
    }
  }
}
