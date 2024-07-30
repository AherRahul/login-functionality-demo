import Queue, { Job } from 'bull';
import Logger from 'bunyan';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';

import { config } from '../../../config';
import { IAuthJob } from '../../../features/auth/interfaces/auth.interface';
import {
  IEmailJob,
  IUserJob,
} from '../../../features/user/interfaces/user.interface';
// import { IPostJobData } from '@post/interfaces/post.interface';
// import { IReactionJob } from '@reaction/interfaces/reaction.interface';
// import { ICommentJob } from '@comment/interfaces/comment.interface';
// import { IBlockedUserJobData, IFollowerJobData } from '@follower/interfaces/follower.interface';
// import { INotificationJobData } from '@notification/interfaces/notification.interface';
// import { IFileImageJobData } from '@image/interfaces/image.interface';
// import { IChatJobData, IMessageData } from '@chat/interfaces/chat.interface';

type IBaseJobData =
  | IAuthJob
  | IEmailJob
  // | IPostJobData
  // | IReactionJob
  // | ICommentJob
  // | IFollowerJobData
  // | IBlockedUserJobData
  // | INotificationJobData
  // | IFileImageJobData
  // | IChatJobData
  // | IMessageData
  | IUserJob;

let bullAdapters: BullAdapter[] = [];
export let serverAdapter: ExpressAdapter;

export abstract class BaseQueue {
  queue: Queue.Queue;
  log: Logger;

  constructor(queueName: string) {
    // creating new queue
    this.queue = new Queue(queueName, `${config.REDIS_HOST}`);

    // pushing queue into adapter
    bullAdapters.push(new BullAdapter(this.queue));

    // removing duplicate queue name
    bullAdapters = [...new Set(bullAdapters)];

    serverAdapter = new ExpressAdapter();

    // setting path to view on dashboard
    serverAdapter.setBasePath('/queues');

    // creating actual dashboard
    createBullBoard({
      queues: bullAdapters,
      serverAdapter,
    });

    // logging queue name
    this.log = config.createLogger(`${queueName}Queue`);

    // event to listen - When job completed successfully => 'completed' get trigger
    this.queue.on('completed', (job: Job) => {
      this.log.info(`Job ${job} completed`);
      job.remove();
    });

    //
    this.queue.on('global:completed', (jobId: string) => {
      this.log.info(`Job ${jobId} completed`);
    });

    //
    this.queue.on('global:stalled', (jobId: string) => {
      this.log.info(`Job ${jobId} is stalled`);
    });
  }

  // Adding job to the queue
  // attempt: how many time we can attempt if a job fails
  protected addJob(name: string, data: IBaseJobData): void {
    this.queue.add(name, data, {
      attempts: 3,
      backoff: { type: 'fixed', delay: 5000 },
    });
  }

  // processing the job in the queue
  // concurrency: number of job can be process at a time
  protected processJob(
    name: string,
    concurrency: number,
    callback: Queue.ProcessCallbackFunction<void>,
  ): void {
    this.queue.process(name, concurrency, callback);
  }
}
