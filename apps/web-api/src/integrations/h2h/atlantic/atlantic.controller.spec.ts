import { Test, TestingModule } from '@nestjs/testing';
import { AtlanticController } from './atlantic.controller';
import { AtlanticService } from './atlantic.service';

describe('AtlanticController', () => {
  let controller: AtlanticController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AtlanticController],
      providers: [AtlanticService],
    }).compile();

    controller = module.get<AtlanticController>(AtlanticController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
