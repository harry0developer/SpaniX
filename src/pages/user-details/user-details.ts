import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, ActionSheetController } from 'ionic-angular';
import { FeedbackProvider } from '../../providers/feedback/feedback';
import { DataProvider } from '../../providers/data/data';
import { LoginPage } from '../login/login';


@IonicPage()
@Component({
  selector: 'page-user-details',
  templateUrl: 'user-details.html',
})
export class UserDetailsPage {
  profile: any;
  candidate: any;
  hired: boolean = false;
  settings: any;
  defaultImg: string = '';
  postedJobs: any = [];
  appliedJobs: any = [];
  viewedCandidates: any = [];
  appointments: any = [];
  appliedUsers: any = [];
  stars: number;

  ratings: any = {};
  isRated: boolean = false;
  rating: number;
  fromPage: string;
  didView: boolean;
  countViews: number;

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    private feedbackProvider: FeedbackProvider,
    private dataProvider: DataProvider,
    private events: Events,
    private actionSheetCtrl: ActionSheetController,
    private ionEvent: Events
  ) {
    this.didView = false;
  }

  ionViewWillLeave() {
    if (this.isRated) {
      this.rateCandidate();
      console.log("User rated :)");
    }
  }

  ionViewDidLoad() {
    this.rating = 0;
    this.candidate = this.navParams.get('user');
    this.profile = this.dataProvider.getProfile();
    this.defaultImg = `${this.dataProvider.getMediaUrl()}${this.profile.gender}.svg`;
    const settingz = this.dataProvider.getSettings();
    this.settings = this.getUserSettings(this.candidate, settingz);
    this.ratings = this.dataProvider.getMyRating(this.candidate.user_id) || 0;
    this.fromPage = this.navParams.get('page');
    this.hasViewedCandidate();

    this.events.subscribe(this.dataProvider.APPOINTMENTS_UPDATED, () => {
      this.appointments = this.dataProvider.getAppointments();
      this.appointments = [];
      this.appointments.map(candidate => {
        if (candidate.candidate_id_fk === this.candidate.user_id) {
          this.appointments.push(candidate);
        }
      });
    });

    this.setData();

    this.hasBeenHired(this.candidate);

    if (!this.profile || !this.profile.type) {
      this.logout();
    }
  }

  private hasViewedCandidate() {
    this.viewedCandidates = this.dataProvider.getViewedCandidates();
    if (this.viewedCandidates.length > 0) {
      this.countViewedCandidates(this.viewedCandidates);
      for (let i = 0; i < this.viewedCandidates.length; i++) {
        if (this.candidate.user_id !== this.profile.user_id && this.viewedCandidates[i].candidate_id_fk == this.candidate.user_id && this.profile.user_id == this.viewedCandidates[i].candidate_id_fk) {
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

  private countViewedCandidates(viewed) {
    let count = 0;
    viewed.forEach(v => {
      if (v.candidate_id_fk == this.candidate.user_id) {
        count++;
      }
    });
    this.countViews = count;
  }


  private addToViewedHelper() {
    let data = {
      candidate_id_fk: this.candidate.user_id,
      recruiter_id_fk: this.profile.user_id,
      date_viewed: this.dataProvider.getDate(),
    }
    this.dataProvider.postDataToDB(data, "addToViewedCandidates").then(res => {
      let results;
      results = res;
      if (results.error) {
        console.log(results);
      } else {
        this.ionEvent.publish(this.dataProvider.VIEWED_CANDIDATES_UPDATED, results.data);
        this.viewedCandidates = results.data;
      }
    }).catch(error => {
      console.log(error);
    });
  }

  private setData() {
    const userType = this.candidate.type;
    const userId = this.candidate.user_id;
    console.log('profile', this.candidate);

    this.postedJobs = this.dataProvider.getMyPostedJobs(userId);
    this.appliedUsers = this.dataProvider.getMyAppliedJobs(userId, userType);

    this.viewedCandidates = this.dataProvider.getMyViewedCandidates(userId);
    this.appointments = this.dataProvider.getMyAppointments(userId, userType);
    this.appliedJobs = this.dataProvider.getDistinct(this.appliedUsers);
  }

  calculateRatings() {
    if (!this.ratings || !this.ratings.user_id_fk) {
      return {
        rating: this.rating,
        user_id_fk: this.candidate.user_id,
        count_raters: 1,
        date_rated: this.dataProvider.getDate()
      }
    } else {
      return {
        rating: (parseInt(this.ratings.rating) + this.rating) / 2,
        user_id_fk: this.candidate.user_id,
        count_raters: parseInt(this.ratings.count_raters) + 1,
        date_rated: this.dataProvider.getDate()
      }
    }
  }

  rateCandidate() {
    let data;
    data = this.calculateRatings();
    this.dataProvider.postDataToDB(data, 'updateRatings').then(res => {
      this.events.publish(this.dataProvider.USER_RATED);
    }).catch(err => {
      console.log(err);
    });
  }

  rate(rating) {
    this.isRated = true;
    this.rating = rating;
    console.log(rating);

  }

  logout() {
    localStorage.clear();
    this.navCtrl.setRoot(LoginPage);
  }

  getUserSettings(user, settingz) {
    let settings;
    let newSettings;
    settingz.forEach(s => {
      if (s.user_id_fk === user.user_id) {
        settings = s;
      }
    });
    if (settings && settings.hide_dob && settings.hide_email && settings.hide_phone && settings.hide_nationality) {
      newSettings = {
        hide_dob: settings.hide_dob === '1' ? true : false,
        hide_email: settings.hide_email === '1' ? true : false,
        hide_phone: settings.hide_phone === '1' ? true : false,
        hide_nationality: settings.hide_nationality === '1' ? true : false,
      }
    } else {
      newSettings = {
        hide_dob: false,
        hide_email: false,
        hide_phone: false,
        hide_nationality: false,
      };
    }
    return newSettings;
  }


  offerUserEmployment(user) {
    this.feedbackProvider.presentLoading("Please wait...");
    let data = {
      recruiter_id_fk: this.profile.user_id,
      candidate_id_fk: user.user_id,
      status: this.dataProvider.APPOINTMENT_STATUS_APPOINTED, //"REMOVED" , "APPOINTED"
      date_created: this.dataProvider.getDate()
    }
    this.dataProvider.postDataToDB(data, 'addToAppointments').then(res => {
      let result
      result = res;
      if (result && result.data) {
        this.feedbackProvider.dismissLoading();
        this.dataProvider.appointments = null;
        this.events.publish(this.dataProvider.APPOINTMENTS_UPDATED, result.data);
        this.hasBeenHired(user);
        this.feedbackProvider.presentToast("Appointment has been made successfully");
      } else {
        this.feedbackProvider.dismissLoading();
        this.feedbackProvider.presentAlert("Job offer Failed", result.error);
      }
    }).catch(err => {
      this.feedbackProvider.dismissLoading();
      console.log(err);
    })
  }

  hasBeenHired(user) {
    const appointments = this.dataProvider.getAppointments();
    appointments.forEach(app => {
      if (app.candidate_id_fk === user.user_id && app.recruiter_id_fk === this.profile.user_id) {
        this.hired = true;
      }
    });
  }

  removeCandidateFromAppointments(user) {
    this.feedbackProvider.presentLoading("Please wait...");
    let data = {
      recruiter_id_fk: this.profile.user_id,
      candidate_id_fk: user.user_id,
      status: this.dataProvider.APPOINTMENT_STATUS_REMOVED,
      date_created: this.dataProvider.getDate()
    }
    this.dataProvider.postDataToDB(data, 'updateAppointmentStatus').then(res => {
      this.feedbackProvider.dismissLoading();
      let results;
      results = res;
      if (results && results.data) {
        this.dataProvider.appointments = null;
        this.events.publish(this.dataProvider.APPOINTMENTS_UPDATED, results.data);
        this.hired = !this.hired;
        this.feedbackProvider.presentToast("Appointment has been cancelled");
      }
      else {
        console.log(res);
      }
    }).catch(err => {
      this.feedbackProvider.dismissLoading();
      console.log(err);
    })
  }

  isRecruiter() {
    return this.profile && this.profile.type.toLowerCase() === 'recruiter' ? true : false;
  }

  removeAppointmentActionSheep(candidate) {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'You are about to cancel the appointment',
      buttons: [
        {
          text: 'Cancel appointment',
          role: 'destructive',
          handler: () => {
            this.removeCandidateFromAppointments(candidate);
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

  getLastSeen(date): string {
    return this.dataProvider.getDateTime(date);
  }

  profilePicture(profile): string {
    return this.dataProvider.getMediaUrl() + profile.picture;
  }

  getDefaultProfilePic(profile) {
    return `${this.dataProvider.getMediaUrl()}${profile.gender}.svg`;
  }

}
