import { Component } from '@angular/core';
import { IonicPage, Events, ModalController, ActionSheetController, Platform } from 'ionic-angular';
import { DataProvider } from '../../providers/data/data';
import { EditProfilePage } from '../edit-profile/edit-profile';
import { FeedbackProvider } from '../../providers/feedback/feedback';
import { SettingsPage } from '../settings/settings';
import { File } from '@ionic-native/file';
import { Transfer, TransferObject } from '@ionic-native/transfer';
import { FilePath } from '@ionic-native/file-path';
import { Camera } from '@ionic-native/camera';
import { slideIn, listSlideUp } from '../../util/animations';

declare var cordova: any;

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
  animations: [slideIn, listSlideUp]

})

export class ProfilePage {
  profile: any;
  job: any;
  countViewed: number;
  appliedViewed: number;
  appliedJobs: any = [];
  viewedJobs: any = [];
  postedJobs: any = [];
  appointments: any = [];
  settings: any = {
    hide_dob: false,
    hide_email: false,
    hide_phone: false,
    hide_nationality: false,
  };
  lastImage: string;
  defaultImg: string = '';
  stars: number;

  constructor(
    private camera: Camera, private transfer: Transfer,
    private file: File, private filePath: FilePath,
    public actionSheetCtrl: ActionSheetController,
    private dataProvider: DataProvider,
    private feedbackProvider: FeedbackProvider,
    private events: Events,
    private modalCtrl: ModalController,
    private platform: Platform,
  ) {
  }


  ionViewDidLoad() {
    this.profile = this.dataProvider.getProfile();
    this.defaultImg = `${this.dataProvider.getMediaUrl()}${this.profile.gender}.svg`;
    this.getAppointments();
    const setz = this.getSettings();
    const ratings = this.dataProvider.getMyRating(this.profile.user_id);

    if (ratings) {
      this.stars = ratings;
    } else {
      this.stars = 0;
    }

    this.events.subscribe(this.dataProvider.USER_PROFILE_UPDATED, () => {
      this.profile = this.dataProvider.getProfile();
    });

    if (setz) {
      this.settings.hide_dob = setz.hide_dob === 'false' ? false : true;
      this.settings.hide_email = setz.hide_email === 'false' ? false : true;
      this.settings.hide_phone = setz.hide_phone === 'false' ? false : true;
      this.settings.hide_nationality = setz.hide_nationality === 'false' ? false : true;
    }

    if (this.isRecruiter()) {
      this.getPostedJobs();
    } else {
      this.getViewedJobs();
    }
  }



  profilePicture(): string {
    return this.dataProvider.getMediaUrl() + this.profile.picture;
  }

  getSettings(): any {
    const settings = this.dataProvider.getSettings();
    let settingz;
    settings.forEach(setz => {
      if (setz.user_id_fk === this.profile.user_id) {
        settingz = setz;
      }
    });
    return settingz;
  }

  getAppliedJobs() {
    const allAppliedJobs = this.dataProvider.getAppliedJobs();
    let jobs = [];
    allAppliedJobs.forEach(aJob => {
      if (this.isRecruiter()) {
        if (aJob.recruiter_id_fk === this.profile.user_id) {
          jobs.push(aJob);
        }
      } else {
        if (aJob.candidate_id_fk === this.profile.user_id) {
          jobs.push(aJob);
        }
      }
    });
    this.appliedJobs = jobs;
  }

  getAppointments() {
    const appointments = this.dataProvider.getAppointments();
    let myAppointments = [];
    appointments.forEach(appointment => {
      if (this.isRecruiter()) {
        if (appointment.recruiter_id_fk === this.profile.user_id) {
          myAppointments.push(appointment);
        }
      } else {
        if (appointment.candidate_id_fk === this.profile.user_id) {
          myAppointments.push(appointment);
        }
      }
    });
    this.appointments = myAppointments;
  }

  getViewedJobs() {
    const allViewedJobs = this.dataProvider.getViewedJobs();
    let jobs = [];
    allViewedJobs.forEach(vJob => {
      if (this.isRecruiter()) {
        if (vJob.recruiter_id_fk === this.profile.user_id) {
          jobs.push(vJob);
        }
      } else {
        if (vJob.candidate_id_fk === this.profile.user_id) {
          jobs.push(vJob);
        }
      }
    });
    this.viewedJobs = jobs;
  }

  getPostedJobs() {
    const allJobs = this.dataProvider.getJobs();
    let jobs = [];
    allJobs.forEach(job => {
      if (job.recruiter_id_fk === this.profile.user_id) {
        jobs.push(job);
      }
    });
    this.postedJobs = jobs;
  }

  isRecruiter() {
    return this.profile.type.toLowerCase() === 'recruiter' ? true : false;
  }


  settingsPage() {
    let modal = this.modalCtrl.create(SettingsPage);
    modal.onDidDismiss(data => {
      if (data && data.changed) {
        this.settings = data;
        this.updateSettings();
      } else {
        console.log('no changes', data);
      }
    });
    modal.present();
  }

  updateSettings() {
    const data = {
      user_id_fk: this.profile.user_id,
      email: this.profile.email,
      ...this.settings,
      date_updated: this.dataProvider.getDate(),
    };
    let response;
    this.dataProvider.postDataToDB(data, 'updateSettings').then(res => {
      response = res;
      this.events.publish(this.dataProvider.USER_SETTINGS_UPDATE, response.data);
      this.feedbackProvider.presentToast('Settings updated successfully');
    }).catch(err => {
      this.feedbackProvider.presentAlert('Oopsie', 'Something went wrong, please try again');
    });
  }

  public presentActionSheet() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select Image Source',
      buttons: [
        {
          text: 'Load from Library',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: 'Use Camera',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.CAMERA);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  public takePicture(sourceType) {
    var options = {
      quality: 75,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true
    };

    this.camera.getPicture(options).then((imagePath) => {
      if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
        this.filePath.resolveNativePath(imagePath)
          .then(filePath => {
            let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
            let currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
            this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
          });
      } else {
        var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
        var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
        this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
      }
    }, (err) => {
      this.showErrorMessage();
    });
  }

  private createFileName() {
    var d = new Date(),
      n = d.getTime(),
      newFileName = n + ".jpg";
    return newFileName;
  }

  private copyFileToLocalDir(namePath, currentName, newFileName) {
    this.file.copyFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(success => {
      this.lastImage = newFileName;
      this.uploadImage();
    }, error => {
    });
  }

  public pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      return cordova.file.dataDirectory + img;
    }
  }

  public uploadImage() {
    var url = "http://localhost:8888/spani/api/uploadProfilePicture";

    var targetPath = this.pathForImage(this.lastImage);

    var filename = this.lastImage;

    var options = {
      fileKey: "file",
      fileName: filename,
      chunkedMode: false,
      mimeType: "multipart/form-data",
      params: { 'fileName': filename }
    };

    const fileTransfer: TransferObject = this.transfer.create();
    this.feedbackProvider.presentLoading('Uploading, please wait...');
    fileTransfer.upload(targetPath, url, options).then(filename => {
      this.feedbackProvider.dismissLoading();
      console.log(filename);
      this.saveFilenameToDB(filename.response);
    }, err => {
      // this.feedbackProvider.dismissLoading();
      // this.showErrorMessage();
    });
  }

  saveFilenameToDB(filename: string) {
    const data = {
      email: this.profile.email,
      picture: filename
    };
    let response;
    this.dataProvider.postDataToDB(data, 'updatePictureUrl').then(res => {
      response = res;
      if (response.error) {
        this.showErrorMessage();
      } else {
        this.feedbackProvider.presentToast('Profile updated successfully');
        this.events.publish(this.dataProvider.USER_PROFILE_UPDATED, response.data);
        this.profile = this.dataProvider.getProfile();
      }
    })
  };

  showErrorMessage() {
    this.feedbackProvider.presentAlert("Ooops!", "Something went wrong changing the profile picture, please try again.");
  }

}
