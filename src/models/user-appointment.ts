import { Profile } from "./Profile";
import { Appointment } from "./appointment";

export interface UserAppointment {
    user: Profile,
    appointment: Appointment
}