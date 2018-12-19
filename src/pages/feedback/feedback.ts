import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { DataProvider } from '../../providers/data/data';


@IonicPage()
@Component({
  selector: 'page-feedback',
  templateUrl: 'feedback.html',
})
export class FeedbackPage {
  profile: any;
  feedback = {
    found: '',
    notLooking: '',
    notUseful: '',
    other: '',
  }
  constructor(public navCtrl: NavController, public navParams: NavParams, private dataProvider: DataProvider) {
  
  }

  ionViewWillLoad() {
    this.profile = this.navParams.get('user');
  }

  goodbye() {
    console.log(this.profile);
    console.log(this.feedback);
    
    this.navCtrl.setRoot(LoginPage);
  }

  isRecruiter() {
    return this.profile.type.toLowerCase() === 'recruiter' ? true : false;
  }
}
