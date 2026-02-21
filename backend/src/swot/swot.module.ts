import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Swot, SwotSchema } from './schemas/swot.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Swot.name, schema: SwotSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class SwotModule {}
