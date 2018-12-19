import { Injectable } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';

@Injectable()
export class LocationProvider {
  location: any;
  constructor(private geolocation: Geolocation, private openNativeSettings: OpenNativeSettings) {}

  getLocation() {
    const options = {
      timeout: 8000,
      enableHighAccuracy: true
    };
    let location: any;
    return new Promise( (resolve, reject) => {
      this.geolocation.getCurrentPosition(options).then((resp) => {
        this.location = {lat:resp.coords.latitude, lng: resp.coords.longitude};
        resolve(this.location);
      }).catch((error) => {
        this.location = JSON.parse(localStorage.getItem('location') || '{}');
        if(this.location && this.location.lat && this.location.lng) {
          resolve(this.location);
        } else {
          console.log('Error getting location', error);
          reject(error);
        }
      });
    });
  }

  openNetworkSettings(){
    this.openNativeSettings.open('network').then(res => {
      console.log("Settings opened", res);
    }).catch(err => {
      console.log("Settings not opened");
    });
  }
}
