export interface Rating {
    date_rated: string,
    rated_id_fk: number
    rater_id_fk: number
    rating: number
}

export interface Rate {
    iRated: Array<Rating>,
    ratedMe: Array<Rating>,
    rating: number
}