import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cession, CessionDocument } from './entities/cession.entity';

@Injectable()
export class CessionModelService {
  constructor(@InjectModel(Cession.name) private readonly cessionModel: Model<CessionDocument>) {}

  async create(entry: Partial<Cession>) { return this.cessionModel.create(entry); }
}


