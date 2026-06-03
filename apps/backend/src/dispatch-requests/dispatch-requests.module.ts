import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DispatchPoint } from '../dispatch-points/entities/dispatch-point.entity';
import { DispatchRequest } from './entities/dispatch-request.entity';
import { DispatchRequestsController } from './dispatch-requests.controller';
import { DispatchRequestsService } from './dispatch-requests.service';

@Module({
  imports: [TypeOrmModule.forFeature([DispatchRequest, DispatchPoint])],
  controllers: [DispatchRequestsController],
  providers: [DispatchRequestsService],
  exports: [DispatchRequestsService],
})
export class DispatchRequestsModule {}
