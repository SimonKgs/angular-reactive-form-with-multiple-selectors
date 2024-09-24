import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'

import { Country, Region, SmallCountry } from '../interfaces/country.interfaces';
import { combineLatest, count, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  private baseUrl: string = 'https://restcountries.com/v3.1';

  private _regions: Region[] = [ Region.Africa, Region.America, Region.Asia, Region.Europa, Region.Oceania]

  constructor(
    private http: HttpClient
  ) { }

  get regions(): Region[] {
    return [ ...this._regions ];
  }


  getCountriesByRegion( region: Region): Observable<SmallCountry[]> {

    // /region/europe?fields=cca3,name,borders
    if (!region) return of([])

    const url: string = `${ this.baseUrl }/region/${ region }?fields=cca3,name,borders`;
    
    return this.http.get<Country[]>(url)
    .pipe(
      map( countries => countries.map( country => ({
        name: country.name.common,
        cca3: country.cca3,
        borders: country.borders ?? []
      }))),

    )
  }


  getCountryByAlphaCode( alphaCode: string): Observable<SmallCountry> {

    const url: string = `${ this.baseUrl }/alpha/${ alphaCode }?fields=cca3,name,borders`;
    
    return this.http.get<Country>(url)
      .pipe(
        map( country => ({ 
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? []
        }))
      )
  }


  getCountryBordersByCodes( borders: string[]): Observable<SmallCountry[]> {

    if (!borders || borders.length === 0) return of([]);

    const countriesRequest: Observable<SmallCountry>[] = [];


    borders.forEach( code => {
      const request = this.getCountryByAlphaCode( code );
      countriesRequest.push( request );
    });

    return combineLatest( countriesRequest );

  } 
}
