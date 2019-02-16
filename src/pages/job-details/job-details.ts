import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, ActionSheetController } from 'ionic-angular';
import { DataProvider } from '../../providers/data/data';
import { FeedbackProvider } from '../../providers/feedback/feedback';
import { PostJobPage } from '../post-job/post-job';
import { SocialSharing } from '@ionic-native/social-sharing';

@IonicPage()
@Component({
  selector: 'page-job-details',
  templateUrl: 'job-details.html',
})
export class JobDetailsPage {
  job: any;
  user: any;
  profile: any;
  countApplied: number;
  countViews: number;
  countShared: number;
  applied: boolean;
  viewedJobs: any;
  didView: boolean;

  constructor(
    public navCtrl: NavController, public ionEvent: Events,
    public actionSheetCtrl: ActionSheetController,
    public dataProvider: DataProvider, public navParams: NavParams,
    private feedbackProvider: FeedbackProvider,
    private socialSharing: SocialSharing) {
    this.profile = this.dataProvider.getUserProfile();
    this.didView = false;
  }

  ionViewDidLoad() {
    this.job = this.navParams.get('job');
    this.user = this.navParams.get('user');
    this.applied = this.hasApplied();
    const shared = this.dataProvider.getSharedJobs();
    this.countAppliedUsers();
    this.hasViewedJob();
    this.countJobShares(shared);
  }

  getSkills(skills) {
    return skills.split(',');
  }

  applyNow(job) {
    this.feedbackProvider.presentLoading();
    let data = {
      candidate_id_fk: this.profile.user_id,
      job_id_fk: job.job_id,
      recruiter_id_fk: job.recruiter_id_fk,
      date_applied: this.dataProvider.getDate()
    }
    this.dataProvider.postDataToDB(data, 'addToAppliedJobs').then(res => {
      this.feedbackProvider.dismissLoading();
      let jobs;
      jobs = res;
      if (!jobs || jobs.error) {
        this.feedbackProvider.presentToast("Oops, Something went wrong");
      } else {
        this.ionEvent.publish(this.dataProvider.APPLIED_JOBS_UPDATED, jobs.data);
        this.applied = !this.applied;
        this.feedbackProvider.presentToast("You have successfully applied for this job");
        this.countAppliedUsers();
      }
    }).catch(err => {
      this.feedbackProvider.dismissLoading();
      console.log(err);
    })
  }


  confirmWithdrawApplication(job) {
    this.presentActionSheet(job);
  }

  withdrawApplication(job) {
    let data = {
      candidate_id_fk: this.profile.user_id,
      recruiter_id_fk: job.recruiter_id_fk,
      job_id_fk: job.job_id
    }
    this.dataProvider.postDataToDB(data, 'removeJobFromAppliedJobs').then(res => {
      let jobs;
      jobs = res;
      if (!jobs && jobs.error) {
        this.feedbackProvider.presentAlert("Oops, Something went wrong", "Your appointment was not canceled, please try again");
      } else {
        this.applied = !this.applied;
        this.feedbackProvider.presentToast("Your have successfully canceled your application");
        this.ionEvent.publish(this.dataProvider.APPLIED_JOBS_UPDATED, jobs.data);
        this.countAppliedUsers();
      }
    }).catch(err => {
      console.log(err);
    })
  }

  hasApplied(): boolean {
    const appliedJobs = this.dataProvider.getAppliedJobs();
    let isApplied = false;
    appliedJobs.forEach(aJob => {
      if (aJob.job_id_fk === this.job.job_id && this.profile.user_id === aJob.candidate_id_fk) {
        isApplied = true;
      }
    });
    return isApplied;
  }

  countAppliedUsers() {
    let counter = 0;
    const appliedJobs = this.dataProvider.getAppliedJobs() || [];
    appliedJobs.forEach(job => {
      if (job.job_id_fk === this.job.job_id) {
        counter++;
      }
    });
    this.countApplied = counter;
  }

  private hasViewedJob() {
    this.viewedJobs = this.dataProvider.getViewedJobs();
    if (this.viewedJobs.length > 0) {
      this.countJobViews(this.viewedJobs);
      for (let i = 0; i < this.viewedJobs.length; i++) {
        if (this.job.recruiter_id_fk !== this.profile.user_id && this.viewedJobs[i].job_id_fk == this.job.job_id && this.profile.user_id == this.viewedJobs[i].candidate_id_fk) {
          this.didView = true;
        }
      }
      if (!this.didView) {
        this.addToViewedHelper();
      }
    }
    else {
      this.addToViewedHelper();
    }
  }

  private countJobViews(viewed) {
    let count = 0;
    viewed.forEach(v => {
      if (v.job_id_fk == this.job.job_id) {
        count++;
      }
    });
    this.countViews = count;
  }

  countJobShares(shared) {
    let count = 0;
    shared.forEach(v => {
      if (v.job_id_fk == this.job.job_id) {
        count++;
      }
    });
    this.countShared = count;
  }

  addToViewedHelper() {
    let data = {
      candidate_id_fk: this.profile.user_id,
      recruiter_id_fk: this.job.recruiter_id_fk,
      job_id_fk: this.job.job_id,
      date_viewed: this.dataProvider.getDate(),
    }
    this.dataProvider.postDataToDB(data, "addToViewedJobs").then(res => {
      let results;
      results = res;
      if (results.error) {
        console.log(results);
      } else {
        this.ionEvent.publish(this.dataProvider.VIEWED_JOBS_UPDATED, results.data);
        this.viewedJobs = results.data;
        this.countJobShares(results.data);

      }
    }).catch(error => {
      console.log(error);
    });
  }

  getDateTime(date) {
    return this.dataProvider.getDateTime(date);
  }

  isCandidate() {
    return this.profile && this.profile.type.toLowerCase() === 'candidate' ? true : false;
  }

  editJob(job) {
    this.navCtrl.push(PostJobPage, { job: job, action: 'edit' });
  }

  presentActionSheet(job) {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'You are about to cancel the application',
      buttons: [
        {
          text: 'Cancel Application',
          role: 'destructive',
          handler: () => {
            this.withdrawApplication(job);
          }
        },
        {
          text: "Don't Cancel",
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });
    actionSheet.present();
  }


  shareJobWithFacebook(job) {
    let shared: boolean = false;
    this.socialSharing.shareViaFacebook(job, "img.png", "www.job.co.za").then(res => {
      shared = true;
    }).catch(err => {
      console.log('Error shareJobWithFacebook');
    });
    return shared;
  }

  shareJobWithTwitter(job) {
    let shared: boolean = false;
    this.socialSharing.shareViaTwitter(job, "img.png", "www.job.co.za").then(res => {
      shared = true;
    }).catch(err => {
      console.log('Error shareJobWithTwitter');
    });
    return shared;
  }

  shareJobWithInstagram(job) {
    let shared: boolean = false;
    this.socialSharing.shareViaInstagram(job, "img.png").then(res => {
      shared = true;
    }).catch(err => {
      console.log('Error shareJobWithInstagram');
    });
    return shared;
  }

  unsubscribeFromSocialEvents() {
    this.ionEvent.unsubscribe('action:facebook');
    this.ionEvent.unsubscribe('action:twitter');
    this.ionEvent.unsubscribe('action:instagram');
  }

  presentShareJobActionSheet(job) {
    this.feedbackProvider.shareJobActionSheet();
    this.ionEvent.subscribe('action:facebook', () => {
      this.unsubscribeFromSocialEvents();
      if (this.shareJobWithFacebook(job)) {
        this.addToSharedJobs(job, 'facebook');
      } else {
        this.feedbackProvider.presentToast('Sharing job with Facebook failed, try again');
      }
    });

    this.ionEvent.subscribe('action:twitter', () => {
      this.unsubscribeFromSocialEvents();
      if (this.shareJobWithTwitter(job)) {
        this.addToSharedJobs(job, 'twitter');
      } else {
        this.feedbackProvider.presentToast('Sharing job with Twitter failed, try again');
      }
    });

    this.ionEvent.subscribe('action:instagram', () => {
      this.unsubscribeFromSocialEvents();
      if (this.shareJobWithInstagram(job)) {
        this.addToSharedJobs(job, 'instagram');
      } else {
        this.feedbackProvider.presentToast('Sharing job with Instagram failed, try again');
      }
    });

  }

  addToSharedJobs(job, platform) {
    let data = {
      candidate_id_fk: -999,
      recruiter_id_fk: -999,
      job_id_fk: this.job.job_id,
      date_viewed: this.dataProvider.getDate(),
      platform
    }
    if (this.isCandidate()) {
      data.candidate_id_fk = this.profile.user_id;
      data.recruiter_id_fk = this.user.user_id;
    } else {
      data.recruiter_id_fk = this.profile.user_id;
      data.candidate_id_fk = this.user.user_id;
    }
    this.dataProvider.postDataToDB(data, "addToSharedJobs").then(res => {
      let results;
      results = res;
      if (results.error) {
        this.feedbackProvider.presentErrorAlert("Error while sharing a job, please try again");
      } else {
        this.feedbackProvider.presentToast("Job shared successfully");
        this.ionEvent.publish(this.dataProvider.SHARED_JOBS_UPDATED, results.data);
        this.viewedJobs = results.data;
        this.countJobViews(results.data);
      }
    }).catch(error => {
      console.log(error);
    })
  }

  deleteJob(job) {
    let results;
    this.dataProvider.postDataToDB(job, "removeFromJobs").then(res => {
      console.log(res);
      results = res;
      if (!results || results.error) {
        this.feedbackProvider.presentAlert("Remove Job Failed", "Error while sharing a job, please try again");
      } else {
        this.navCtrl.pop();
        this.feedbackProvider.presentToast("The job has been deleted successfully");
        this.ionEvent.publish(this.dataProvider.JOBS_UPDATED, results.data);
      }
    }).catch(error => {
      console.log(error);
      this.feedbackProvider.presentAlert("Remove Job Failed", "Error while sharing a job, please try again");
    });
  }

  manageJob(job) {
    const actionSheet = this.actionSheetCtrl.create({
      title: `Manage: ${job.name}`,
      buttons: [
        {
          text: 'Edit Job',
          icon: 'create',
          handler: () => {
            this.editJob(job);
          }
        },
        {
          text: 'Delete Job',
          icon: 'trash',
          handler: () => {
            this.deleteJob(job);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }
}
