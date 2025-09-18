import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Cession, CessionSchema } from './entities/cession.entity';
import { CessionModelService } from './cession.model.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Cession.name, schema: CessionSchema }])],
  providers: [CessionModelService],
  exports: [CessionModelService],
})
export class CessionModelModule {}


