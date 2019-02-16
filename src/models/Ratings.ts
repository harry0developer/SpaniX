export interface Rating {
    date_rated: string,
    rated_id_fk: string
    rater_id_fk: string
    rating: number
    rating_id: string
}

export interface Rate {
    iRated: Array<Rating>,
    ratedMe: Array<Rating>,
    rating: number
}