import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/map';
import * as moment from 'moment';
import { Events } from 'ionic-angular';
import { FeedbackProvider } from '../feedback/feedback';
import { Profile } from '../../models/Profile';
import { ViewedJob, SharedJob, AppliedJob, ViewedCandidate } from '../../models/jobs';
import { Appointment } from '../../models/appointment';
import { Rating, Rate } from '../../models/Ratings';
import { Job } from '../../models/job';
import { Location } from '../../models/location';
import { UserAppointment } from '../../models/user-appointment';

let apiUrl = 'http://localhost:8888/spani/api/';
let media = `${apiUrl}uploads/users/`;

// let apiUrl = 'http://batsumilifestyle.co.za/spani/api/';
// let media = `${apiUrl}uploads/users/`;

@Injectable()
export class DataProvider {

  KM: number = 1.60934;
  recruiters: any = [];
  candidates: any = [];
  jobs: any = [];
  appliedJobs: any = [];
  appointments: any = [];
  removedAppointments: any = [];
  viewedJobs: any = [];
  viewedCandidates: any = [];
  sharedJobs: any = [];
  ratings: any = [];
  location: any;
  categories = [];
  profile: Profile;
  settings: any;
  nationalities: any;
  titles: any;

  JOBS_UPDATED = 'jobs:updated';
  SHARED_JOBS_UPDATED = 'sharedJobs:updated';
  SHARED_VIA_FACEBOOK = 'action:facebook';
  SHARED_VIA_TWITTER = 'action:twitter';
  SHARED_VIA_EMAIL = 'action:email';
  SHARED_VIA_WHATSAPP = 'action:whatsapp';
  VIEWED_JOBS_UPDATED = 'viewedJobs:updated';
  VIEWED_CANDIDATES_UPDATED = 'viewedCandidates:updated';

  APPLIED_JOBS_UPDATED = 'appliedJobs:updated';
  APPOINTMENTS_UPDATED = 'appointments:updated';

  APPOINTMENT_STATUS_APPOINTED = 'appointed';
  APPOINTMENT_STATUS_REMOVED = 'removed';

  USER_PROFILE_UPDATED = 'profile:updated';
  USER_SETTINGS_UPDATE = 'settings:updated';
  USER_LOGGED_IN = 'user:loggedIn';
  USER_RATED = 'user:rated';

  LOCATION_SET = 'location:set';
  NETWORK_CONNECTED = 'network:connected';
  NETWORK_DISCONNECTED = 'network:disconnected';

  USER_TYPE_RECRUITER = 'recruiter';
  USER_TYPE_CANDIDATE = 'candidate';

  constructor(
    public http: Http,
    private events: Events,
    private feedbackProvider: FeedbackProvider,
  ) {
    // this.recruiters = null;
    // this.candidates = null;
    // this.jobs = null;
    // this.appliedJobs = null;
    // this.appointments = null;
    // this.removedAppointments = null;
    // this.viewedJobs = null;
    // this.sharedJobs = null;
    // this.profile = null;
    // this.settings = null;
    // this.ratings = null;
    // this.viewedCandidates = null;

    this.events.subscribe(this.APPOINTMENTS_UPDATED, appointments => {
      this.appointments = appointments.filter(app => app.status === this.APPOINTMENT_STATUS_APPOINTED);
      this.removedAppointments = appointments.filter(app => app.status === this.APPOINTMENT_STATUS_REMOVED);
    });

    this.events.subscribe(this.JOBS_UPDATED, jobs => {
      this.jobs = jobs;
    });

    this.events.subscribe(this.APPLIED_JOBS_UPDATED, jobs => {
      this.appliedJobs = jobs;
    });

    this.events.subscribe(this.VIEWED_CANDIDATES_UPDATED, candidated => {
      this.viewedCandidates = candidated;
    });

    this.events.subscribe(this.VIEWED_JOBS_UPDATED, jobs => {
      this.viewedJobs = jobs;
    });

    this.events.subscribe(this.SHARED_JOBS_UPDATED, jobs => {
      this.sharedJobs = jobs;
    });

    this.events.subscribe(this.USER_PROFILE_UPDATED, user => {
      localStorage.setItem('user', JSON.stringify(user));
      this.profile = user;
    });

    this.events.subscribe(this.USER_SETTINGS_UPDATE, settings => {
      this.settings = settings;
    });

    this.events.subscribe(this.USER_LOGGED_IN, profile => {
      this.profile = profile;
    });

    this.events.subscribe(this.USER_RATED, () => {
      this.ratings = this._getRatings();
    });
  }

  getProfile() {
    return this.profile || JSON.parse(localStorage.getItem('user') || '{}');
  }

  getMediaUrl() {
    return media;
  }

  postDataToDB(data: any, endpoint: string) {
    return new Promise((resolve, reject) => {
      this.http.post(apiUrl + endpoint, JSON.stringify(data))
        .map(resp => resp.json()).subscribe(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });
    });
  }

  mapJobs(myJobs) {
    const mappedJobs = [];
    if (myJobs.length && this.jobs.length) {
      myJobs.forEach(myJob => {
        this.jobs.forEach(job => {
          if (myJob.job_id_fk && myJob.job_id_fk === job.job_id) {
            mappedJobs.push(Object.assign(job, myJob));
          }
        });
      });
    }
    return mappedJobs;
  }

  getDataFromDB(tableName) {
    const data = { tableName: tableName };
    return new Promise(resolve => {
      this.http.post(apiUrl + 'getDataFromDB', JSON.stringify(data))
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        });
    });
  }

  setAppliedJobs(jobs) {
    this.appliedJobs = jobs;
  }

  setJobs(jobs) {
    this.jobs = jobs;
  }

  getDate() {
    var date = moment.now();
    return moment(date).format("MM/DD/YYYY HH:mm");
  }

  getDateTime(date) {
    return moment(date).fromNow();
  }

  isDateValid(date): boolean {
    return moment(date).isValid();
  }

  getJobs() {
    return this.jobs;
  }

  getLocation(): Location {
    return this.location;
  }

  getAppointments() {
    return this.appointments || [];
  }

  getRemovedAppointments() {
    return this.removedAppointments || [];
  }

  getRecruiters() {
    return this.recruiters || [];
  }

  getCandidates() {
    return this.candidates || [];
  }

  getAppliedJobs() {
    return this.appliedJobs || [];
  }

  getViewedJobs() {
    return this.viewedJobs || [];
  }

  getViewedCandidates() {
    return this.viewedCandidates || [];
  }

  getSharedJobs() {
    return this.sharedJobs || [];
  }

  getSettings() {
    return this.settings || [];
  }

  private _getUsersIRated(userId): Array<Rating> {
    let rated = [];
    if (this.ratings.length) {
      this.ratings.forEach(ratingObj => {
        if (ratingObj.rater_id_fk === userId) {
          rated.push(ratingObj);
        }
      });
    }
    return rated;
  }

  private _getUsersRatedMe(userId): Array<Rating> {
    let rated = [];
    if (this.ratings.length) {
      this.ratings.forEach(ratingObj => {
        if (ratingObj.rated_id_fk === userId) {
          rated.push(ratingObj);
        }
      });
    }
    return rated;
  }

  private _getMyRating(userId: number): number {
    let myRating = 0;
    let countRaters = 0;
    if (this.ratings.length) {
      this.ratings.forEach(ratingObj => {
        if (ratingObj.rated_id_fk === userId) {
          countRaters++;
          myRating += parseFloat(ratingObj.rating);
        }
      });
    }
    return myRating / countRaters;
  }

  getMyRatingsData(userId: number): Rate {
    const rateObject: Rate = {
      iRated: this._getUsersIRated(userId),
      ratedMe: this._getUsersRatedMe(userId),
      rating: this._getMyRating(userId)
    };
    return rateObject;
  }

  getCategories() {
    return new Promise(resolve => {
      this.http.get('../../assets/categories.json')
        .map(res => res.json())
        .subscribe(data => {
          this.categories = data;
          resolve(this.categories);
        });
    });
  }

  getMyViewedJobs(userId: number, userType: string): Array<ViewedJob> {
    const myViewedJobs = [];
    if (this.viewedJobs.length) {
      this.viewedJobs.forEach(job => {
        if (userType.toLocaleLowerCase() === this.USER_TYPE_RECRUITER && job.recruiter_id_fk === userId) {
          myViewedJobs.push(job);
        } else if (userType.toLocaleLowerCase() === this.USER_TYPE_CANDIDATE && job.candidate_id_fk === userId) {
          myViewedJobs.push(job);
        }
      });
    }
    return this.mapJobs(myViewedJobs);
  }

  getMySharedJobs(userId: number, userType: string): Array<SharedJob> {
    const mySharedJobs = [];
    if (this.sharedJobs.length) {
      this.sharedJobs.forEach(job => {
        if (userType.toLocaleLowerCase() === this.USER_TYPE_RECRUITER && job.recruiter_id_fk === userId) {
          mySharedJobs.push(job);
        } else if (userType.toLocaleLowerCase() === this.USER_TYPE_CANDIDATE && job.candidate_id_fk === userId) {
          mySharedJobs.push(job);
        }
      });
    }
    return this.mapJobs(mySharedJobs);
  }

  getMyPostedJobs(userId: number): Array<Job> {
    const jobs = [];
    if (this.jobs.length) {
      this.jobs.forEach(job => {
        if (job.recruiter_id_fk === userId) {
          jobs.push(job);
        }
      });
    }
    return jobs;
  }

  getDistinct(array) {
    const distinctJobs = [];
    let alreadyIn: boolean = false;
    array.forEach(job => {
      distinctJobs.forEach(dJob => {
        if (job.job_id_fk === dJob.job_id_fk) {
          alreadyIn = true;
        }
      });
      if (!alreadyIn) {
        distinctJobs.push(job);
      }
    });
    return distinctJobs;
  }

  getMyAppliedJobs(userId: number, userType: string): Array<AppliedJob> {
    const appliedJobs = [];
    if (this.appliedJobs.length) {
      this.appliedJobs.forEach(appliedJob => {
        if (userType.toLocaleLowerCase() === this.USER_TYPE_RECRUITER && appliedJob.recruiter_id_fk === userId) {
          appliedJobs.push(appliedJob);
        } else if (userType.toLocaleLowerCase() === this.USER_TYPE_CANDIDATE && appliedJob.candidate_id_fk === userId) {
          appliedJobs.push(appliedJob);
        }
      });
    }
    return this.mapJobs(appliedJobs)
  }

  getMyAppointments(userId: number, userType: string): Array<Profile> {
    const myAppointments = [];
    if (this.appointments.length) {
      this.appointments.forEach(appointment => {
        if (userType.toLocaleLowerCase() === this.USER_TYPE_RECRUITER && appointment.recruiter_id_fk === userId) {
          myAppointments.push(appointment);
        } else if (userType.toLocaleLowerCase() === this.USER_TYPE_CANDIDATE && appointment.candidate_id_fk === userId) {
          myAppointments.push(appointment);
        }
      });
    }
    return this.mapAppointments(myAppointments, userId, userType);
  }

  private mapAppointments(appointments: Array<Appointment>, userId: number, type: string): Array<Profile> {
    const appz = [];
    appointments.forEach(app => {
      if (this.USER_TYPE_CANDIDATE === type && app.candidate_id_fk === userId) {
        this.recruiters.forEach(user => {
          if (user.user_id === app.recruiter_id_fk) {
            const userWithAppointment = {
              user,
              appointment: app
            }
            appz.push(userWithAppointment);
          }
        });
      } else if (this.USER_TYPE_RECRUITER === type && app.recruiter_id_fk === userId) {
        this.candidates.forEach(user => {
          if (user.user_id === app.candidate_id_fk) {
            const userWithAppointment: UserAppointment = {
              user,
              appointment: app
            }
            appz.push(userWithAppointment);
          }
        });
      }
    });

    console.log(appz);

    return appz;
  }


  getMyViewedCandidates(userId: number): Array<ViewedCandidate> {
    const viewedCandidates = [];
    if (this.viewedCandidates.length) {
      this.viewedCandidates.forEach(candidate => {
        if (candidate.recruiter_id_fk === userId) {
          viewedCandidates.push(candidate);
        }
      });
    }
    return viewedCandidates;
  }

  filterCandidates(searchTerm) {
    if (this.candidates) {
      let name = '';
      return this.candidates.filter(candidate => {
        name = candidate.firstname + ' ' + candidate.lastname;
        return name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
      });
    } else {
      console.log("No candidates ");
    }
  }

  filterJobs(searchTerm) {
    if (this.jobs) {
      return this.jobs.filter(job => {
        return job.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
      });
    }
  }

  getCountries() {
    return new Promise(resolve => {
      this.http.get('../../assets/countries.json')
        .map(res => res.json())
        .subscribe(data => {
          this.nationalities = data;
          resolve(this.nationalities);
        });
    });
  }

  saveUserProfile(profile) {
    localStorage.setItem('user', JSON.stringify(profile));
  }

  getUserProfile(): Profile {
    return JSON.parse(localStorage.getItem('user')) || null;
  }

  saveUserIntro(intro: boolean) {
    localStorage.setItem('intro', JSON.stringify(intro));
  }

  getUserIntro(): boolean {
    return JSON.parse(localStorage.getItem('intro'));
  }

  saveUserLocation(location) {
    localStorage.setItem('location', JSON.stringify(location));
  }

  getUserLocation(): Location {
    return JSON.parse(localStorage.getItem('location'));
  }

  initializeData() {
    this._getJobs();
    this._getUsers();
    this._getAppointments();
    this._getAppliedJobs();
    this._getViewedJobs();
    this._getSharedJobs();
    this._getSettings();
    this._getRatings();
  }

  validateRespose(response, tableName): any {
    let data = [];
    if (response && response.data) {
      data = response.data;
    } else {
      this.feedbackProvider.presentAlert(`Could not fetch ${tableName}`, "Something went wrong fetching data, please try again");
    }
    return data;
  }

  private _getJobs() {
    this.getDataFromDB('Jobs').then(res => {
      this.jobs = this.validateRespose(res, 'jobs');
    }).catch(error => {
      this.feedbackProvider.presentAlert("Oopsie", "Something went wrong fetching data, please try again");
    })
  }

  private _getSharedJobs() {
    this.getDataFromDB('SharedJobs').then(res => {
      this.sharedJobs = this.validateRespose(res, 'Shared Jobs');
    }).catch(error => {
      this.feedbackProvider.presentAlert("Oopsie", "Something went wrong fetching data, please try again");
    })
  }

  private _getViewedJobs() {
    this.getDataFromDB('ViewedJobs').then(res => {
      this.viewedJobs = this.validateRespose(res, 'Viewed Jobs');
    }).catch(error => {
      this.feedbackProvider.presentAlert("Oopsie", "Something went wrong fetching data, please try again");
    })
  }

  private _getRatings() {
    this.getDataFromDB('Ratings').then(res => {
      this.ratings = this.validateRespose(res, 'Ratings');
    }).catch(error => {
      this.feedbackProvider.presentAlert("Oopsie", "Something went wrong fetching data, please try again");
    })
  }

  private _getUsers() {
    let candidates;
    let recruiters;
    this.getDataFromDB('Users').then(res => {
      recruiters = res;
      candidates = res;
      this.candidates = candidates.data.filter(user => user.type.toLowerCase() === this.USER_TYPE_CANDIDATE);
      this.recruiters = recruiters.data.filter(user => user.type.toLowerCase() === this.USER_TYPE_RECRUITER);
    }).catch(error => {
      this.feedbackProvider.presentAlert("Oopsie", "Something went wrong fetching data, please try again");
    })
  }

  private _getAppointments() {
    let appointments;
    this.getDataFromDB('Appointments').then(res => {
      appointments = res;
      this.appointments = appointments.data.filter(app => app.status === this.APPOINTMENT_STATUS_APPOINTED);
      this.removedAppointments = appointments.data.filter(app => app.status === this.APPOINTMENT_STATUS_REMOVED);
    }).catch(error => {
      this.feedbackProvider.presentAlert("Oopsie", "Something went wrong fetching data, please try again");
    })
  }

  private _getAppliedJobs() {
    this.getDataFromDB('AppliedJobs').then(res => {
      this.appliedJobs = this.validateRespose(res, 'Applied Jobs');
    }).catch(error => {
      this.feedbackProvider.presentAlert("Oopsie", "Something went wrong fetching data, please try again");
    })
  }

  private _getSettings() {
    this.getDataFromDB('Settings').then(res => {
      this.settings = this.validateRespose(res, 'Settings');
    }).catch(error => {
      this.feedbackProvider.presentAlert("Oopsie", "Something went wrong fetching data, please try again");
    })
  }

  applyHaversine(jobs, lat, lng) {
    if (jobs && lat && lng) {
      let usersLocation = {
        lat: lat,
        lng: lng
      };
      jobs.map((location) => {
        let placeLocation = {
          lat: location.lat,
          lng: location.lng
        };
        location.distance = this.getDistanceBetweenPoints(
          usersLocation,
          placeLocation,
          'miles'
        ).toFixed(0);
      });
      return this.sortByDistance(jobs);
    } else {
      return jobs;
    }
  }


  getOTPCode() {
    return Math.floor(Math.random() * 90000) + 10000;
  }

  getDistanceBetweenPoints(start, end, units) {
    let earthRadius = {
      miles: 3958.8,
      km: 6371
    };

    let R = earthRadius[units || 'miles'];
    let lat1 = start.lat;
    let lon1 = start.lng;
    let lat2 = end.lat;
    let lon2 = end.lng;

    let dLat = this.toRad((lat2 - lat1));
    let dLon = this.toRad((lon2 - lon1));
    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c;

    return d * this.KM; //convert miles to km
  }

  toRad(x) {
    return x * Math.PI / 180;
  }

  sortByDistance(data) {
    if (data) {
      return data.sort(function (a, b) {
        return a.distance - b.distance;
      });
    } else {
      return [];
    }
  }

}
