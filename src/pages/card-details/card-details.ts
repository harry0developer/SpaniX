import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { JobDetailsPage } from '../job-details/job-details';
import { DataProvider } from '../../providers/data/data';
import { bounceIn } from '../../util/animations';
import { UserDetailsPage } from '../user-details/user-details';

@IonicPage()
@Component({
  selector: 'page-card-details',
  templateUrl: 'card-details.html',
  animations: [bounceIn]

})
export class CardDetailsPage {

  appliedJobs = [];
  viewedJobs = [];
  sharedJobs = [];
  appointments = [];
  category: string = '';
  pageTitle: string = '';
  somethings: any = new Array(20);
  profile: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public dataProvider: DataProvider,
    public ionEvents: Events,
  ) {
  }

  ionViewDidLoad() {
    this.profile = this.dataProvider.getProfile();
    this.category = this.navParams.get('category');
    this.getCategoryInfo(this.category);
  }

  getPageTitle(): string {
    return this.pageTitle;
  }

  getAppliedJobs(): Array<any> {
    this.category = 'applied';
    this.appliedJobs = this.dataProvider.getMyAppliedJobs(this.profile.user_id, this.profile.type);
    return this.appliedJobs;
  }

  getViewedJobs(): Array<any> {
    this.category = 'viewed';
    this.viewedJobs = this.dataProvider.getMyViewedJobs(this.profile.user_id, this.profile.type);
    return this.viewedJobs;
  }

  getSharedJobs(): Array<any> {
    this.category = 'shared';
    this.sharedJobs = this.dataProvider.getMySharedJobs(this.profile.user_id, this.profile.type);
    return this.sharedJobs;
  }

  getAppointments(): Array<any> {
    this.category = 'appointments';
    this.appointments = this.dataProvider.getMyAppointments(this.profile.user_id, this.profile.type);
    return this.appointments;
  }

  getCategoryInfo(category) {
    switch (category) {
      case 'applied':
        this.pageTitle = 'My Applied Jobs';
        return this.getAppliedJobs();
      case 'viewed':
        this.pageTitle = 'My Viewed Jobs';
        return this.getViewedJobs();

      case 'shared':
        this.pageTitle = 'My Shared Jobs';
        return this.getSharedJobs();

      case 'appointments':
        this.pageTitle = 'My Appointments';
        return this.getAppointments();

      default:
        return [];
    }
  }

  isRecruiter() {
    return this.profile && this.profile.type === 'recruiter';
  }

  jobDetails(job) {
    this.navCtrl.push(JobDetailsPage, { job: job, user: this.profile });
  }

  getJobMoment(date): string {
    return this.dataProvider.getDateTime(date);
  }

  countJobApplicants(appliedJob): number {
    let counter = 0;
    const appliedJobs = this.dataProvider.getAppliedJobs() || [];
    appliedJobs.forEach(job => {
      if (job.job_id_fk == appliedJob.job_id) {
        counter++;
      }
    });
    return counter;
  }

  // Appointments stuff
  viewUserDetails(candidate) {
    this.navCtrl.push(UserDetailsPage, { user: candidate, page: 'Appointments' });
  }

  profilePicture(profile): string {
    return this.dataProvider.getMediaUrl() + profile.picture;
  }

  getDefaultProfilePic(profile) {
    return `${this.dataProvider.getMediaUrl()}${profile.gender}.svg`;
  }

  getDateAppointed(user): string {
    let appointment_date = '';
    this.appointments.forEach(app => {
      if (app.candidate_id_fk === user.user_id && app.recruiter_id_fk === this.profile.user_id) {
        appointment_date = this.dataProvider.getDateTime(app.date_created);
      } else if (app.recruiter_id_fk === user.user_id && app.candidate_id_fk === this.profile.user_id) {
        appointment_date = this.dataProvider.getDateTime(app.date_created);
      }
    });
    return appointment_date;
  }

}