import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { INS_TRIGGERS_QUEUE } from '../../../common/bull/queues';
import { TriggerEventDto } from '../dto/trigger-event.dto';

function verifyOracleSignatureStub(_payload: any, _sig: string): boolean {
  // TODO: implement real signature verification (out of MVP scope)
  return true;
}

@Injectable()
export class TriggersService {
  constructor(@InjectQueue(INS_TRIGGERS_QUEUE) private readonly triggersQueue: Queue) {}

  async enqueueTriggerEvent(dto: TriggerEventDto) {
    if (!verifyOracleSignatureStub(dto, dto.oracleSig)) {
      throw new Error('Invalid oracle signature');
    }
    return this.triggersQueue.add('trigger-event', dto, { removeOnComplete: true, attempts: 3 });
  }
}


