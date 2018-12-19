import { Component } from '@angular/core';
import { IonicPage, NavController, Events, ModalController, ActionSheetController } from 'ionic-angular';
import { DataProvider } from '../../providers/data/data';
import { JobDetailsPage } from '../job-details/job-details';
import { PostJobPage } from '../post-job/post-job';
import { FeedbackProvider } from '../../providers/feedback/feedback';
import { bounceIn } from '../../util/animations';

@IonicPage()
@Component({
  selector: 'page-my-jobs',
  templateUrl: 'my-jobs.html',
  animations: [ bounceIn ]
})
export class MyJobsPage {
  profile: any;
  myJobs: any = [];

  constructor(
    public navCtrl: NavController,
    private dataProvider: DataProvider,
    private events: Events,
    private modalCtrl: ModalController,
    private feedbackProvider: FeedbackProvider,
    private actionSheetCtrl: ActionSheetController
  ) {
  }

  ionViewDidLoad() {
    this.profile = this.dataProvider.getProfile();
    this.initializeJobs();
    this.events.subscribe(this.dataProvider.JOBS_UPDATED, jobs => {
      this.dataProvider.setJobs(jobs);
      this.initializeJobs();
    });

    this.events.subscribe(this.dataProvider.APPLIED_JOBS_UPDATED, jobs => {
      this.dataProvider.setAppliedJobs(jobs);
      this.initializeJobs();
    });
  }

  isRecruiter(): boolean {
    return this.profile && this.profile.type.toLowerCase() === 'recruiter' ? true : false;
  }

  initializeJobs() {
    const jobs = this.dataProvider.getJobs();
    if(this.isRecruiter()) {
      this.myJobs = jobs.filter(job => job.recruiter_id_fk === this.profile.user_id);
    } else {
      this.mapAppliedJobsWithJobs(jobs);
    }
  }

  mapAppliedJobsWithJobs(jobs) {
    let jobz = [];
    const appliedJobs = this.dataProvider.getAppliedJobs();
    const myAppliedJobs = appliedJobs.filter(aJob => this.profile.user_id === aJob.candidate_id_fk);
    jobs.forEach(job => {
      myAppliedJobs.forEach(aJob => {
        if(job.job_id === aJob.job_id_fk) {
          jobz.push(Object.assign(job,aJob));
        }
      });
    });
    this.myJobs = jobz;
  }

  jobDetails(job){
    this.navCtrl.push(JobDetailsPage, {job: job, user: this.profile});
  }

  getJobMoment(date): string {
    return this.dataProvider.getDateTime(date);
  }

  countJobApplicants(appliedJob): number{
    let counter = 0;
    const appliedJobs = this.dataProvider.getAppliedJobs() || [];
    appliedJobs.forEach(job => {
      if(job.job_id_fk == appliedJob.job_id){
        counter++;
      }
    });
    return counter;
  }

  postJob() {
    let profileModal = this.modalCtrl.create(PostJobPage, {action: 'post'});
    profileModal.onDidDismiss(data => {
      if(data) {
        this.events.publish(this.dataProvider.JOBS_UPDATED, data);
        this.feedbackProvider.presentAlert("Your post was successful", "To manage your posts, go to 'My Jobs' on the side menu navigation")
      } else {
        console.log("Clear filter");
      }
    });
    profileModal.present();
  }

}
