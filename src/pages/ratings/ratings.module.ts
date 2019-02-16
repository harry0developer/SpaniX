import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RatingsPage } from './ratings';

@NgModule({
  declarations: [
    RatingsPage,
  ],
  imports: [
    IonicPageModule.forChild(RatingsPage),
  ],
})
export class RatingsPageModule {}
