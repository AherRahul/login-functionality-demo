import { BaseQueue } from '../../services/queues/base.queue';
import { IUserJob } from '../../../features/user/interfaces/user.interface';
import { userWorker } from '../../workers/user.worker';

class UserQueue extends BaseQueue {
  constructor() {
    super('user');
    this.processJob('addUserToDB', 5, userWorker.addUserToDB);
    // this.processJob('updateSocialLinksInDB', 5, userWorker.updateSocialLinks);
    // this.processJob('updateBasicInfoInDB', 5, userWorker.updateUserInfo);
    // this.processJob('updateNotificationSettings', 5, userWorker.updateNotificationSettings);
  }

  public addUserJob(name: string, data: IUserJob): void {
    this.addJob(name, data);
  }
}

export const userQueue: UserQueue = new UserQueue();
