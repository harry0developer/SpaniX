import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { FeedbackProvider } from '../../providers/feedback/feedback';
import { DataProvider } from '../../providers/data/data';
import { OtpPage } from '../otp/otp';

@IonicPage()
@Component({
  selector: 'page-forgot-password',
  templateUrl: 'forgot-password.html',
})
export class ForgotPasswordPage {
  data = {
    email: '',
    otp: 0
  }
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private feedbackProvider: FeedbackProvider,
    private dataProvider: DataProvider,
  ) {
  }

  confirmEmailAndSentOtp() {
    this.data.otp = this.dataProvider.getOTPCode();
    let response: any;
    this.feedbackProvider.presentLoading('Sending OTP Code...');
    this.dataProvider.postDataToDB(this.data, 'confirmEmailAndSentOtp').then(res => {
      response = res;
      this.feedbackProvider.dismissLoading();
      if(response.data) {
        this.navCtrl.setRoot(OtpPage, {data: this.data, page: 'forgot-password'});
      } else {
        this.feedbackProvider.presentAlert("Request password failed", "Your email address is not registered");
      }
    }).catch(errors => {
      this.feedbackProvider.dismissLoading();
      this.feedbackProvider.presentErrorAlert('Reset Password Failed');
    });
  }

  goToLogin() {
    this.navCtrl.setRoot(LoginPage);
  }
}
