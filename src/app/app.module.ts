import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Network } from '@ionic-native/network';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';

import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { File } from '@ionic-native/file';
import { Transfer } from '@ionic-native/transfer';
import { FilePath } from '@ionic-native/file-path';
import { Camera } from '@ionic-native/camera';

import { RatingModule } from "ngx-rating";

import { MyApp } from './app.component';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { DataProvider } from '../providers/data/data';
import { FeedbackProvider } from '../providers/feedback/feedback';
import { LocationProvider } from '../providers/location/location';
import { LoginPage } from '../pages/login/login';
import { SignupPage } from '../pages/signup/signup';
import { OtpPage } from '../pages/otp/otp';
import { ForgotPasswordPage } from '../pages/forgot-password/forgot-password';
import { ProfilePage } from '../pages/profile/profile';
import { JobsPage } from '../pages/jobs/jobs';
import { AppointmentsPage } from '../pages/appointments/appointments';
import { IntroPage } from '../pages/intro/intro';
import { HttpModule } from '@angular/http';
import { CandidatesPage } from '../pages/candidates/candidates';
import { JobDetailsPage } from '../pages/job-details/job-details';
import { MyJobsPage } from '../pages/my-jobs/my-jobs';
import { FilterPage } from '../pages/filter/filter';
import { PlacesPage } from '../pages/places/places';
import { PostJobPage } from '../pages/post-job/post-job';
import { EditProfilePage } from '../pages/edit-profile/edit-profile';
import { SettingsPage } from '../pages/settings/settings';
import { ChangePasswordPage } from '../pages/change-password/change-password';
import { FeedbackPage } from '../pages/feedback/feedback';
import { ErrorPage } from '../pages/error/error';

import { SetupPage } from '../pages/setup/setup';
import { ResetPasswordPage } from '../pages/reset-password/reset-password';
import { ConnectionProvider } from '../providers/connection/connection';
import { ConnectionPage } from '../pages/connection/connection';
import { DashboardPage } from '../pages/dashboard/dashboard';
import { SharedJobsPage } from '../pages/shared-jobs/shared-jobs';
import { CardDetailsPage } from '../pages/card-details/card-details';
import { ShrinkingSegmentHeader } from '../components/shrinking-segment-header/shrinking-segment-header';
import { UserDetailsPage } from '../pages/user-details/user-details';
import { RatingsPage } from '../pages/ratings/ratings';
import { RatingsModalPage } from '../pages/ratings-modal/ratings-modal';

@NgModule({
  declarations: [
    AppointmentsPage,
    CandidatesPage,
    UserDetailsPage,
    ForgotPasswordPage,
    IntroPage,
    JobsPage,
    LoginPage,
    MyApp,
    OtpPage,
    ProfilePage,
    SignupPage,
    JobDetailsPage,
    MyJobsPage,
    FilterPage,
    PlacesPage,
    PostJobPage,
    EditProfilePage,
    SettingsPage,
    ChangePasswordPage,
    FeedbackPage,
    ErrorPage,
    SetupPage,
    ResetPasswordPage,
    ConnectionPage,
    DashboardPage,
    SharedJobsPage,
    ShrinkingSegmentHeader,
    CardDetailsPage,
    RatingsPage,
    RatingsModalPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    BrowserAnimationsModule,
    RatingModule,
    IonicModule.forRoot(MyApp, {
      backButtonText: '',
    }),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    AppointmentsPage,
    CandidatesPage,
    UserDetailsPage,
    ForgotPasswordPage,
    IntroPage,
    JobsPage,
    LoginPage,
    MyApp,
    OtpPage,
    ProfilePage,
    SignupPage,
    JobDetailsPage,
    MyJobsPage,
    FilterPage,
    PlacesPage,
    PostJobPage,
    EditProfilePage,
    SettingsPage,
    ChangePasswordPage,
    FeedbackPage,
    ErrorPage,
    SetupPage,
    ResetPasswordPage,
    ConnectionPage,
    DashboardPage,
    SharedJobsPage,
    ShrinkingSegmentHeader,
    CardDetailsPage,
    RatingsPage,
    RatingsModalPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    Network,
    File,
    OpenNativeSettings,
    Transfer,
    Camera,
    FilePath,
    SocialSharing,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    DataProvider,
    FeedbackProvider,
    LocationProvider,
    ConnectionProvider,
  ]
  // schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
