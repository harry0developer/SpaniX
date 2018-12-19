import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { DataProvider } from '../../providers/data/data';
import { FeedbackProvider } from '../../providers/feedback/feedback';
import { OtpPage } from '../otp/otp';

@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {
  data = {
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    otp: 0
  }

  type = 'password';
  showPass = false;

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    private dataProvider: DataProvider, private feedbackProvider: FeedbackProvider) {
  }

  ionViewDidLoad() {
  }


  sendOtpCode(){
    this.data.otp = this.dataProvider.getOTPCode();
    this.feedbackProvider.presentLoading("Please wait...");
    let res;
    this.dataProvider.postDataToDB(this.data,'sendOTP').then(result => {
      res = result;
      this.feedbackProvider.dismissLoading();
      console.log(res);
      if(res && res.error){
        this.feedbackProvider.presentErrorAlert("Signup Failed");
      }else{
        const d = {
          otp: res.data,
          firstname: this.data.firstname,
          lastname: this.data.lastname,
          email: this.data.email,
          password: this.data.password
        }
        this.navCtrl.setRoot(OtpPage, {data: d, page: 'signup'});
      }
    }).catch(err => {
      console.log(err);
      this.feedbackProvider.presentAlert("Signup Failed", "Invalid email address");

      this.feedbackProvider.dismissLoading();
    })
  }

  goToLogin() {
    this.navCtrl.setRoot(LoginPage);
  }


  showPassword() {
    this.showPass = !this.showPass;
    if(this.showPass){
      this.type = 'text';
    } else {
      this.type = 'password';
    }
  }
}
