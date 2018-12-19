import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PostJobPage } from './post-job';

@NgModule({
  declarations: [
    PostJobPage,
  ],
  imports: [
    IonicPageModule.forChild(PostJobPage),
  ],
})
export class PostJobPageModule {}
