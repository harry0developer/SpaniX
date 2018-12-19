import { Injectable } from '@angular/core';
import { LoadingController, ToastController, AlertController, Events, ActionSheetController } from 'ionic-angular';

@Injectable()
export class FeedbackProvider {
  loadSpinner: any;
  constructor(
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private events: Events,
  ) {
  }

  presentLoading(message: string = 'Please wait...') {
    this.loadSpinner = this.loadingCtrl.create({
      content: message
    });
    this.loadSpinner.present();
  }

  presentToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }

  presentAlert(title:string, msg:string) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: msg,
      cssClass: "btn",
      buttons: ['Dismiss']
    });
    alert.present();
  }

  presentErrorAlert(title:string, msg: string='Something went wrong, please try again') {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: msg,
      cssClass: "btn",
      buttons: ['Dismiss']
    });
    alert.present();
  }

  dismissLoading() {
    this.loadSpinner.dismiss();
  }


  shareJobActionSheet(){
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Share this job',
      buttons: [
        {
          text: 'Facebook',
          icon:'logo-facebook',
          handler: () => {
            this.events.publish('action:facebook');
          }
        },
        {
          text: 'Twitter',
          icon: 'logo-twitter',
          handler: () => {
            this.events.publish('action:twitter');
          }
        },
        {
          text: 'Instagram',
          icon: 'logo-instagram',
          handler: () => {
            this.events.publish('action:instagram');
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });
    actionSheet.present();
  }

}
