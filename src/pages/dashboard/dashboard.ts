import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { DataProvider } from '../../providers/data/data';
import { Profile } from '../../models/Profile';
import { SettingsPage } from '../settings/settings';
import { Rating } from 'ngx-rating';
import { CardDetailsPage } from '../card-details/card-details';
import { AppointmentsPage } from '../appointments/appointments';
import { FeedbackProvider } from '../../providers/feedback/feedback';
import { MyJobsPage } from '../my-jobs/my-jobs';
import { Rate } from '../../models/Ratings';
import { RatingsPage } from '../ratings/ratings';


@IonicPage()
@Component({
  selector: 'page-dashboard',
  templateUrl: 'dashboard.html',
})
export class DashboardPage {
  profile: Profile;
  appliedJobs: any = [];
  viewedJobs: any = [];
  viewedCandidates: any = [];
  postedJobs: any = [];
  appointments: any = [];
  sharedJobs: any = [];
  lastImage: string;
  defaultImg: string = '';
  stars: number;
  ratingsData: Rate;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private events: Events,
    private dataProvider: DataProvider,
    private feedbackProvider: FeedbackProvider) {
  }

  ionViewDidLoad() {
    this.profile = this.dataProvider.getProfile();
    this.defaultImg = `${this.dataProvider.getMediaUrl()}${this.profile.gender}.svg`;

    // this.stars = this.dataProvider.getMyRating(this.profile.user_id) || 0;

    this.events.subscribe(this.dataProvider.USER_LOGGED_IN, user => {
      this.profile = user;
      this.init();
    });

    this.events.subscribe(this.dataProvider.USER_PROFILE_UPDATED, () => {
      this.profile = this.dataProvider.getProfile();
      this.feedbackProvider.presentToast('Profile updated successfully');
      this.init();
    });

    this.events.subscribe(this.dataProvider.JOBS_UPDATED, () => {
      this.init();
    });

    this.events.subscribe(this.dataProvider.SHARED_JOBS_UPDATED, () => {
      this.init();
    });

    this.events.subscribe(this.dataProvider.APPLIED_JOBS_UPDATED, () => {
      this.init();
    });

    this.events.subscribe(this.dataProvider.VIEWED_JOBS_UPDATED, () => {
      this.init();
    });

    this.events.subscribe(this.dataProvider.VIEWED_CANDIDATES_UPDATED, () => {
      this.init();
    });

    this.events.subscribe(this.dataProvider.USER_RATED, () => {
      this.init();
    });

    this.events.subscribe(this.dataProvider.APPOINTMENTS_UPDATED, () => {
      this.init();
    });

    this.init();
  }

  init() {
    let userType;
    if (this.isRecruiter()) {
      userType = 'recruiter';
      this.postedJobs = this.dataProvider.getMyPostedJobs(this.profile.user_id);
    } else {
      userType = 'candidate';
      this.appliedJobs = this.dataProvider.getMyAppliedJobs(this.profile.user_id, userType);
    }
    this.viewedJobs = this.dataProvider.getMyViewedJobs(this.profile.user_id, userType);
    this.sharedJobs = this.dataProvider.getMySharedJobs(this.profile.user_id, userType);
    // const iRated = this.dataProvider.getUsersIRated(this.profile.user_id);
    // const ratedMe = this.dataProvider.getUsersRatedMe(this.profile.user_id);
    // this.rated = iRated.concat(ratedMe);

    this.ratingsData = this.dataProvider.getMyRatingsData(this.profile.user_id);
    console.log(this.ratingsData);

  }

  isRecruiter() {
    return this.profile && this.profile.type.toLowerCase() === 'recruiter' ? true : false;
  }

  profilePicture(): string {
    return this.dataProvider.getMediaUrl() + this.profile.picture;
  }

  editProfile() {
    this.navCtrl.push(SettingsPage);
  }

  viewAppliedJobs() {
    this.navCtrl.push(CardDetailsPage, { category: 'applied' });
  }

  viewViewedJobs() {
    this.navCtrl.push(CardDetailsPage, { category: 'viewed' });
  }

  viewPostedJobs() {
    this.navCtrl.push(MyJobsPage);
  }

  viewSharedJobs() {
    this.navCtrl.push(CardDetailsPage, { category: 'shared' });
  }

  viewRaters() {
    this.navCtrl.push(RatingsPage, { ratingsData: this.ratingsData });
  }

  getMyRaters(): number {
    return this.ratingsData.ratedMe.length + this.ratingsData.iRated.length;
  }

}
