import { Test, TestingModule } from '@nestjs/testing';
import { AtlanticService } from './atlantic.service';

describe('AtlanticService', () => {
  let service: AtlanticService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AtlanticService],
    }).compile();

    service = module.get<AtlanticService>(AtlanticService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
