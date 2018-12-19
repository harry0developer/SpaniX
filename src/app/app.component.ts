import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LoginPage } from '../pages/login/login';
import { CandidatesPage } from '../pages/candidates/candidates';
import { ProfilePage } from '../pages/profile/profile';
import { JobsPage } from '../pages/jobs/jobs';
import { AppointmentsPage } from '../pages/appointments/appointments';
import { DataProvider } from '../providers/data/data';
import { LocationProvider } from '../providers/location/location';
import { MyJobsPage } from '../pages/my-jobs/my-jobs';
import { ConnectionProvider } from '../providers/connection/connection';
import { FeedbackProvider } from '../providers/feedback/feedback';
import { ConnectionPage } from '../pages/connection/connection';
import { DashboardPage } from '../pages/dashboard/dashboard';
import { Profile } from '../models/Profile';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  profile: Profile;
  rootPage: any = LoginPage;
  defaultImg: string = '';
  pages2: any = {};

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public events: Events,
    public dataProvider: DataProvider,
    public locationProvider: LocationProvider,
    private connectionProvider: ConnectionProvider,
    private feedbackProvider: FeedbackProvider,
  ) {

    this.initializeApp();

    this.connectionProvider.getConnection();


    this.defaultImg = `${this.dataProvider.getMediaUrl()}Male.svg`;

    this.events.subscribe(this.dataProvider.LOCATION_SET, (location) => {
      this.dataProvider.setLocation(location);
    });

    this.events.subscribe(this.dataProvider.NETWORK_CONNECTED, () => {
      this.feedbackProvider.presentToast("You are now connected");
      this.nav.pop();
    });

    this.events.subscribe(this.dataProvider.NETWORK_DISCONNECTED, () => {
      this.feedbackProvider.presentToast("You have lost internet connection");
      this.nav.push(ConnectionPage);
    });

    this.events.subscribe(this.dataProvider.USER_LOGGED_IN, (profile) => {
      this.profile = profile;
      this.dataProvider.initializeData();
      this.defaultImg = `${this.dataProvider.getMediaUrl()}${this.profile.gender}.svg`;
      this.getLocation();
    });

    this.pages2 = {
      dashboardPage: DashboardPage,
      recruitersPage: JobsPage,
      candidatesPage: CandidatesPage,
      myJobsPage: MyJobsPage,
      profilePage: ProfilePage,
      appointmentPage: AppointmentsPage,
      loginPage: LoginPage
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  getLocation() {
    this.locationProvider.getLocation().then(location => {
      this.dataProvider.setLocation(location);
      this.events.publish(this.dataProvider.LOCATION_SET, location);
    }).catch(err => {
      console.log(err);
    });
  }

  openPage(page) {
    this.nav.setRoot(page.component);
  }

  loadProfile(page, user) {
    this.nav.setRoot(page.component);
  }

  isRecruiter() {
    return this.profile && this.profile.type.toLowerCase() === 'recruiter' ? true : false;
  }

  profilePicture(): string {
    return this.dataProvider.getMediaUrl() + this.profile.picture;
  }

  logout() {
    localStorage.removeItem('user');
    this.nav.setRoot(LoginPage);
  }
}
