import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatistikService {

  private apiBase = 'https://yusra.perangkatlunak.my.id/backend/api/statistik';

  constructor(private http: HttpClient) {}

  // GET AREA LIST
  // PHP: ?action=area
  getAreas(): Observable<any> {
    return this.http.get<any>(`${this.apiBase}?action=area`);
  }

  // GET STATISTIK PER AREA
  // PHP: ?action=detail&area=...
  getStatistik(area: string): Observable<any> {
    const encoded = encodeURIComponent(area);
    return this.http.get<any>(
      `${this.apiBase}?action=detail&area=${encoded}`
    );
  }

}
