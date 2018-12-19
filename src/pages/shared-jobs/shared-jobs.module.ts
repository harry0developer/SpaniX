import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SharedJobsPage } from './shared-jobs';

@NgModule({
  declarations: [
    SharedJobsPage,
  ],
  imports: [
    IonicPageModule.forChild(SharedJobsPage),
  ],
})
export class SharedJobsPageModule {}
