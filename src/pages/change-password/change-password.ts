import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ModalController, Events } from 'ionic-angular';
import { DataProvider } from '../../providers/data/data';
import { FeedbackProvider } from '../../providers/feedback/feedback';
import { localeData } from 'moment';


@IonicPage()
@Component({
  selector: 'page-change-password',
  templateUrl: 'change-password.html',
})
export class ChangePasswordPage {

  data = {
    password: '',
    new_password: '',
    confirm_password: ''
  };
  profile: any;
  passwordConfirmed: boolean = false;

  constructor(
    public viewCtrl: ViewController,
    public modalCtrl: ModalController,
    private dataProvider: DataProvider,
    private feedbackProvider: FeedbackProvider,
    private events: Events,
  ) {
      this.profile = this.dataProvider.getProfile();
  }

  confirmPassword() {
    const data = {
      user_id: this.profile.user_id,
      email: this.profile.email,
      password: this.data.password,
    };
    let status;
    this.feedbackProvider.presentLoading();
    this.dataProvider.postDataToDB(data, 'checkPassword').then(res => {
      this.feedbackProvider.dismissLoading();
      status = res;
      if(status.error) {
        this.feedbackProvider.presentAlert('Password not changed', 'Your old password does not match');
      } else {
        this.passwordConfirmed = true;
      }
    }).catch(err => {
      this.feedbackProvider.dismissLoading();
      this.feedbackProvider.presentAlert('Oopsie','Something went wrong, please try again')
    })
  }

  changePassword() {
    const data = {
      email: this.profile.email,
      new_password: this.data.new_password,
      date_updated: this.dataProvider.getDate()
    };
    let status;
    this.feedbackProvider.presentLoading();
    this.dataProvider.postDataToDB(data, 'updatePassword').then(res => {
      this.feedbackProvider.dismissLoading();
      status = res;
      if(status.error) {
        this.feedbackProvider.presentAlert('Password not changed', 'Your old password does not match');
      } else {
        this.events.publish(this.dataProvider.USER_PROFILE_UPDATED, status.data);
        this.viewCtrl.dismiss('success');
      }
    }).catch(err => {
      this.feedbackProvider.dismissLoading();
      this.feedbackProvider.presentAlert('Oopsie','Something went wrong, please try again')
    })
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
