import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SharedJob } from '../../models/jobs';
import { Job } from '../../models/job';
import { DataProvider } from '../../providers/data/data';

@IonicPage()
@Component({
  selector: 'page-shared-jobs',
  templateUrl: 'shared-jobs.html',
})
export class SharedJobsPage {
  facebook: Array<SharedJob> = [];
  twitter: Array<SharedJob> = [];
  linkedin: Array<SharedJob> = [];
  whatsapp: Array<SharedJob> = [];
  jobs: Job[];
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public dataProvider: DataProvider,
  ) {
  }

  ionViewDidLoad() {
    const shared = this.navParams.get('data');
    this.jobs = this.dataProvider.getJobs();
    if (shared.length && this.jobs) {
      shared.forEach(job => {
        if (job.platform.toLowerCase() === 'facebook') {
          this.facebook.push(job);
        }
        else if (job.platform.toLowerCase() === 'twitter') {
          this.twitter.push(job);
        }
        else if (job.platform.toLowerCase() === 'linkedin') {
          this.linkedin.push(job);
        }
        else if (job.platform.toLowerCase() === 'whatsapp') {
          this.whatsapp.push(job);
        }
      });
    }
    console.log('Shared jobs data', shared);
  }

  getMappedJob(sharedJob): Job {
    this.jobs.forEach(job => {
      if (job.job_id === sharedJob.job_id_fk) {
        return job;
      }
    });
    return null;
  }

}
