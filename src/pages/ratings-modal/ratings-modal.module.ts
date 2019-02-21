import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RatingsModalPage } from './ratings-modal';

@NgModule({
  declarations: [
    RatingsModalPage,
  ],
  imports: [
    IonicPageModule.forChild(RatingsModalPage),
  ],
})
export class RatingsModalPageModule {}
