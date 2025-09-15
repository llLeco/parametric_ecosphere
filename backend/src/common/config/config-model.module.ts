import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Config, ConfigSchema } from '../../modules/config/entities/config.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: Config.name, schema: ConfigSchema }])],
  exports: [MongooseModule],
})
export class ConfigModelModule {}


