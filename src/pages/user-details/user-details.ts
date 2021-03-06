import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, ActionSheetController, ModalController } from 'ionic-angular';
import { FeedbackProvider } from '../../providers/feedback/feedback';
import { DataProvider } from '../../providers/data/data';
import { LoginPage } from '../login/login';
import { Rating, Rate } from '../../models/Ratings';
import { Error } from '../../models/error';
import { RatingsModalPage } from '../ratings-modal/ratings-modal';


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

  isRated: boolean = false;
  rating: number;
  userRating: Rate;

  fromPage: string;
  didView: boolean;
  countViews: number;
  appointmentDate: string;

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    private feedbackProvider: FeedbackProvider,
    private dataProvider: DataProvider,
    private events: Events,
    private actionSheetCtrl: ActionSheetController,
    private ionEvent: Events,
    private modalCtrl: ModalController,
  ) {
    this.didView = false;
  }

  ionViewWillLeave() {
    if (this.isRated) {
      this.rateCandidate(this.rating);
      console.log("User rated :)", this.rating);
    }
  }

  ionViewDidLoad() {
    this.candidate = this.navParams.get('user');
    this.profile = this.dataProvider.getProfile();
    this.defaultImg = `${this.dataProvider.getMediaUrl()}${this.profile.gender}.svg`;
    const settingz = this.dataProvider.getSettings();
    this.settings = this.getUserSettings(this.candidate, settingz);
    this.fromPage = this.navParams.get('page');

    this.userRating = this.dataProvider.getMyRatingsData(this.candidate.user_id);
    this.rating = 0;

    this.hasViewedCandidate();
    this.setData();

    this.events.subscribe(this.dataProvider.APPOINTMENTS_UPDATED, () => {
      this.appointments = this.dataProvider.getMyAppointments(this.candidate.user_id, this.dataProvider.USER_TYPE_CANDIDATE);
    });


    this.hasBeenHired(this.candidate);

    if (!this.profile || !this.profile.type) {
      this.logout();
    }
  }

  loadMyAppliedJobs() {
  }

  hasAppointments(): boolean {
    let dateCreated: string = "";
    this.appointments.forEach(app => {
      if (app.user.user_id === this.profile.user_id) {
        dateCreated = app.appointment.date_created;
      }
    });
    this.appointmentDate = this.dataProvider.getDateTime(dateCreated);
    return this.dataProvider.isDateValid(dateCreated);
  }

  get canRateUser(): boolean {
    return this.fromPage === 'Appointments' || this.fromPage === 'Ratings';
  }

  get updateUserRate() {
    const rate = this.rating > 0 ? (this.userRating.rating + this.rating) / 2 : this.userRating.rating;
    return (Math.floor(rate * 100) / 100).toFixed(1);
  }

  get userCanBeRated(): boolean {
    console.log(this.appointments);

    return true; //this.candidate.appointments;
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
    this.postedJobs = this.dataProvider.getMyPostedJobs(userId);
    this.appliedUsers = this.dataProvider.getMyAppliedJobs(userId, userType);

    this.viewedCandidates = this.dataProvider.getMyViewedCandidates(userId);
    this.appointments = this.dataProvider.getMyAppointments(this.candidate.user_id, this.dataProvider.USER_TYPE_CANDIDATE);
    this.appliedJobs = this.dataProvider.getDistinct(this.appliedUsers);
  }

  // calculateRatings() {
  //   if (!this.ratings || !this.ratings.user_id_fk) {
  //     return {
  //       rating: this.rating,
  //       user_id_fk: this.candidate.user_id,
  //       count_raters: 1,
  //       date_rated: this.dataProvider.getDate()
  //     }
  //   } else {
  //     return {
  //       rating: (parseInt(this.ratings.rating) + this.rating) / 2,
  //       user_id_fk: this.candidate.user_id,
  //       count_raters: parseInt(this.ratings.count_raters) + 1,
  //       date_rated: this.dataProvider.getDate()
  //     }
  //   }
  // }


  calculateAverageRating(rating) {
    return this.userRating && this.userRating.rating ? (rating + this.userRating.rating) / 2 : rating;
  }

  rateCandidate(rating) {
    let data: Rating;
    data = {
      rated_id_fk: this.candidate.user_id,
      rater_id_fk: this.profile.user_id,
      rating: this.calculateAverageRating(rating),
      date_rated: this.dataProvider.getDate()
    };

    this.dataProvider.postDataToDB(data, 'updateRatings').then(res => {
      const results: Error = res;
      if (results.data) {
        this.events.publish(this.dataProvider.USER_RATED);
        this.feedbackProvider.presentToast("User rated succesfully");
      } else {
        this.feedbackProvider.presentToast("Something went wrong, user not rated");
      }
    }).catch(err => {
      console.log(err);
    });
  }

  rateUser(rating) {
    this.isRated = true;
    this.rating = rating;
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
      status: this.dataProvider.APPOINTMENT_STATUS_IN_PROGRESS, //"completed" , "inprogress"
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
    const appointments = this.dataProvider.getInProgressAppointments();
    appointments.forEach(app => {
      if (app.candidate_id_fk === user.user_id && app.recruiter_id_fk === this.profile.user_id) {
        this.hired = true;
      }
    });
  }

  completeCandidateAppointment(user) {
    this.feedbackProvider.presentLoading("Please wait...");
    let data = {
      recruiter_id_fk: this.profile.user_id,
      candidate_id_fk: user.user_id,
      status: this.dataProvider.APPOINTMENT_STATUS_COMPLETED,
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
        this.feedbackProvider.presentToast("Appointment has been completed");
      }
      else {
        this.feedbackProvider.presentErrorAlert('Error occured while completing the appointment');
      }
    }).catch(err => {
      this.feedbackProvider.dismissLoading();
      this.feedbackProvider.presentErrorAlert('Error occured while completing the appointment');
    })
  }

  isRecruiter() {
    return this.profile && this.profile.type.toLowerCase() === 'recruiter' ? true : false;
  }

  completeAppointmentActionSheep(candidate) {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'You are about to complete the appointment',
      buttons: [
        {
          text: 'Complete appointment',
          role: 'destructive',
          handler: () => {
            this.completeCandidateAppointment(candidate);
          }
        },
        {
          text: "Don't complete",
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

  presentRateUserModal(user) {
    let profileModal = this.modalCtrl.create(RatingsModalPage, { user: Object.assign(user, { ratings: this.userRating }) });
    profileModal.onDidDismiss(data => {
      if (data) {
        const requestData = {
          rater_id_fk: this.profile.user_id,
          rated_id_fk: data.user_id,
          rating: data.ratings.rating,
          date_rated: this.dataProvider.getDate()
        };
        this.dataProvider.postDataToDB(requestData, 'updateRatings').then(res => {
          const results: Error = res;
          if (results.error) {
            this.feedbackProvider.presentToast("Error: User rating failed");
          } else {
            this.feedbackProvider.presentToast("User rated successfully");
            this.events.publish(this.dataProvider.USER_RATED, data);
          }
        })
      }
    });
    profileModal.present();
  }

}
