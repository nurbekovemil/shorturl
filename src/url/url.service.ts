import { Injectable } from '@nestjs/common';
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

  async createShortUrl(createUrlDto: CreateUrlDto): Promise<Url> {
    const { originalUrl, alias, expiresAt  } = createUrlDto;
    const shortUrl = alias || uuid().slice(0, 6);
    const url = this.urlRepository.create({ originalUrl, shortUrl, expiresAt  });
    const savedUrl = this.urlRepository.save(url);
    return savedUrl;
  }

  async getOriginalUrl(shortUrl: string, res, req){
    const url = await this.urlRepository.findOne({ where: { shortUrl } });
    if (!url) {
      return res.status(404).json({ error: 'Short URL not found' });
    }
    if (url.expiresAt && url.expiresAt < new Date()) {
      return res.status(410).json({ error: 'Short URL has expired' });
    }
    const isExistIp = await this.analyticRepository.findOne({ where: { shortUrlId: url.shortUrl, ipAddress: req.ip } });
    if (!isExistIp) {

      url.clickCount += 1;
      this.analyticRepository.save({ shortUrlId: url.shortUrl, ipAddress: req.ip });
      this.urlRepository.save(url);
    }
    return res.redirect(url.originalUrl);
  }
  
  async getAnanlytics(shortUrl: string): Promise<Analytic[]> {
    return this.analyticRepository.find({ where: { shortUrlId: shortUrl } });
  }

  async getUrlInfo(shortUrl: string): Promise<Url | null> {
    return this.urlRepository.findOne({ where: { shortUrl } });
  }

  async deleteShortUrl(shortUrl: string): Promise<{ message: string }> {
    const result = await this.urlRepository.delete({ shortUrl });
    if (result.affected === 0) {
      throw new Error('Short URL not found');
    }
    return { message: 'Short URL deleted' };
  }
}
