import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
//import { Movie } from '../../../api/models'; 

// these may need to change with the way the movie schema has been set up by alex 
export interface MovieDetails {
    _id: string,
    Name: string,
    Description: string,
    Genre: string,
    Cast: [], //idk if this counts
    Director: string,
    Rating: number,
    Review: [] 
}

@Injectable()
export class GenreService{
   
}