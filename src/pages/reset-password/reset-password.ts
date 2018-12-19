import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { FeedbackProvider } from '../../providers/feedback/feedback';
import { DataProvider } from '../../providers/data/data';


@IonicPage()
@Component({
  selector: 'page-reset-password',
  templateUrl: 'reset-password.html',
})
export class ResetPasswordPage {
  data = {
    email: '',
    new_password: '',
    cpassword: '',
    date_updated: ''
  }
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private feedbackProvider: FeedbackProvider,
    private dataProvider: DataProvider,
  ) {
  }

  ionViewDidLoad() {
    this.data = this.navParams.get('data');
  }

  goToLogin() {
    this.navCtrl.setRoot(LoginPage);
  }

  createNewPassword() {
    this.feedbackProvider.presentLoading("Please wait...");
    let res;
    this.data.date_updated = this.dataProvider.getDate();
    this.dataProvider.postDataToDB(this.data,'updatePassword').then(result => {
      res = result;
      this.feedbackProvider.dismissLoading();
      if(res && res.error){
        this.feedbackProvider.presentErrorAlert("Reset Password Failed");
      }else{
        this.navCtrl.setRoot(LoginPage);
        this.feedbackProvider.presentAlert("Password changed successfully", "Please login with a new password");
      }
    }).catch(err => {
      console.log(err);
      this.feedbackProvider.dismissLoading();
    });
  }

}
