import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { DataProvider } from '../../providers/data/data';
import { bounceIn } from '../../util/animations';
import { UserDetailsPage } from '../user-details/user-details';

@IonicPage()
@Component({
  selector: 'page-appointments',
  templateUrl: 'appointments.html',
  animations: [bounceIn]
})
export class AppointmentsPage {
  profile: any;
  appointments: any = [];
  removedAppointments: any = [];
  mappedAppointments: any = [];
  recruiters: any = [];
  candidates: any = [];
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private dataProvider: DataProvider,
    private events: Events,
  ) {
    this.profile = this.dataProvider.getProfile();
  }

  ionViewDidLoad() {
    this.appointments = this.dataProvider.getAppointments();
    this.removedAppointments = this.dataProvider.getRemovedAppointments();
    this.recruiters = this.dataProvider.getRecruiters();
    this.candidates = this.dataProvider.getCandidates();
    this.setAppointments();

    this.events.subscribe(this.dataProvider.APPOINTMENTS_UPDATED, () => {
      this.mappedAppointments = [];
      this.appointments = this.dataProvider.getAppointments();
      this.removedAppointments = this.dataProvider.getRemovedAppointments();
      this.setAppointments();
    });
  }

  setAppointments() {
    if (this.isRecruiter()) {
      this.mapRecruiterAppointments();
    } else {
      this.mapCandidateAppointments();
    }
  }

  mapRecruiterAppointments() {
    this.appointments.forEach(app => {
      if (app.recruiter_id_fk === this.profile.user_id) {
        this.setRecruiterAppointments(app);
      }
    });
  }

  setRecruiterAppointments(app) {
    this.candidates.forEach(candidate => {
      if (app.candidate_id_fk === candidate.user_id) {
        this.mappedAppointments.push(candidate);
      }
    });
  }

  mapCandidateAppointments() {
    this.appointments.forEach(app => {
      if (app.candidate_id_fk === this.profile.user_id) {
        this.setCandidateAppointments(app);
      }
    });
  }

  setCandidateAppointments(app) {
    this.recruiters.forEach(recruiter => {
      if (app.recruiter_id_fk === recruiter.user_id) {
        this.mappedAppointments.push(recruiter);
      }
    });
  }

  isRecruiter(): boolean {
    return this.profile.type.toLowerCase() === 'recruiter' ? true : false;
  }

  viewUserDetails(candidate) {
    this.navCtrl.push(UserDetailsPage, { user: candidate, page: 'Appointments' });
  }

  getDateAppointed(user): string {
    let appointment_date = '';
    this.appointments.forEach(app => {
      if (app.candidate_id_fk === user.user_id && app.recruiter_id_fk === this.profile.user_id) {
        appointment_date = this.dataProvider.getDateTime(app.date_created);
      } else if (app.recruiter_id_fk === user.user_id && app.candidate_id_fk === this.profile.user_id) {
        appointment_date = this.dataProvider.getDateTime(app.date_created);
      }
    });
    return appointment_date;
  }

  profilePicture(profile): string {
    return this.dataProvider.getMediaUrl() + profile.picture;
  }

  getDefaultProfilePic(profile) {
    return `${this.dataProvider.getMediaUrl()}${profile.gender}.svg`;
  }


}
