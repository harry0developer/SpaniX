import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { DataProvider } from '../../providers/data/data';
import { Profile } from '../../models/Profile';
import { SettingsPage } from '../settings/settings';
import { Rating } from 'ngx-rating';
import { CardDetailsPage } from '../card-details/card-details';
import { AppointmentsPage } from '../appointments/appointments';
import { FeedbackProvider } from '../../providers/feedback/feedback';
import { RatedPage } from '../rated/rated';


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
  rated: any = [];
  lastImage: string;
  defaultImg: string = '';
  stars: number;
  ratings: Array<Rating> = [];

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

    this.stars = this.dataProvider.getMyRating(this.profile.user_id) || 0;

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
      this.viewedCandidates = this.dataProvider.getMyViewedCandidates(this.profile.user_id);
    } else {
      userType = 'candidate';
      this.viewedJobs = this.dataProvider.getMyViewedJobs(this.profile.user_id, userType);
      this.appliedJobs = this.dataProvider.getMyAppliedJobs(this.profile.user_id, userType);
    }
    this.sharedJobs = this.dataProvider.getMySharedJobs(this.profile.user_id, userType);
    const iRated = this.dataProvider.getUsersIRated(this.profile.user_id);
    const ratedMe = this.dataProvider.getUsersRatedMe(this.profile.user_id);

    this.rated = iRated.concat(ratedMe);
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

  viewSharedJobs() {
    this.navCtrl.push(CardDetailsPage, { category: 'shared' });
  }

  viewRated() {
    this.navCtrl.push(RatedPage);
  }

}
