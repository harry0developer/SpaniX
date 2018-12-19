import { Component } from '@angular/core';
import { IonicPage, NavController, Events, ModalController, Modal } from 'ionic-angular';
import { SignupPage } from '../signup/signup';
import { ForgotPasswordPage } from '../forgot-password/forgot-password';
import { DataProvider } from '../../providers/data/data';
import { FeedbackProvider } from '../../providers/feedback/feedback';
import { CandidatesPage } from '../candidates/candidates';
import { JobsPage } from '../jobs/jobs';
import { LocationProvider } from '../../providers/location/location';
import { ErrorPage } from '../error/error';
import { DashboardPage } from '../dashboard/dashboard';
import { IntroPage } from '../intro/intro';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  data = {
    email: '',
    password: '',
    status: '',
    date_updated: ''
  };

  type = 'password';
  showPass = false;
  active: boolean = false;
  modal: any;
  introModal: Modal;

  constructor(
    private navCtrl: NavController,
    private dataProvider: DataProvider,
    private locationProvider: LocationProvider,
    private feedbackProvider: FeedbackProvider,
    private events: Events,
    private modalCtrl: ModalController
  ) {
  }

  ionViewDidLoad() {
    if (!this.showedIntro()) {
      this.presentIntroModal();
    }
    this.autoLogin();
  }

  presentIntroModal() {
    const introModal = this.modalCtrl.create(IntroPage);
    introModal.onDidDismiss(() => {
      this.dataProvider.setLocalStorageItem('intro', true);
    });
    introModal.present();
  }

  showedIntro(): boolean {
    return !!this.dataProvider.getLocalStorageItem('intro');
  }

  setPassword(password) {
    this.data.password = password;
  }

  setEmail(email) {
    this.data.email = email;
  }

  isValid() {
    if (this.data.email && this.data.password)
      return true;
    return false;
  }

  autoLogin() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.email) {
      this.init(user);
    }
  }

  init(user) {
    this.events.publish(this.dataProvider.USER_LOGGED_IN, user);
    this.navCtrl.setRoot(DashboardPage);
  }

  showModal() {
    this.active = true;
    this.modal = this.modalCtrl.create(ErrorPage, null, { cssClass: "modal-fullscreen" });
    this.modal.onDidDismiss(data => {
      this.active = false;
    });
    this.modal.present()
  }


  login() {
    let response: any;
    this.data.status = 'Active';
    this.data.date_updated = this.dataProvider.getDate();

    this.feedbackProvider.presentLoading('Logging in...');
    this.dataProvider.postDataToDB(this.data, 'login').then(res => {
      response = res;
      if (response.data) {
        this.events.publish(this.dataProvider.USER_PROFILE_UPDATED, response.data);
        this.feedbackProvider.dismissLoading();
        this.init(response.data);
      } else {
        this.feedbackProvider.dismissLoading();
        this.feedbackProvider.presentAlert('Login failed', 'Username and password do not match');
      }
    }).catch(errors => {
      this.feedbackProvider.dismissLoading();
      this.feedbackProvider.presentErrorAlert('Login failed');
      console.log(errors);
    });
  }

  goToSignup() {
    this.navCtrl.setRoot(SignupPage);
  }

  goToForgotPassword() {
    this.navCtrl.setRoot(ForgotPasswordPage);
  }

  showPassword() {
    this.showPass = !this.showPass;

    if (this.showPass) {
      this.type = 'text';
    } else {
      this.type = 'password';
    }
  }

}
