import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HamaService {

  private BASE = 'https://yusra.perangkatlunak.my.id/backend/api/pengamatan';

  constructor(private http: HttpClient) {}

  // GET semua data
  getHama(): Observable<any> {
    return this.http.get<any>(this.BASE);
  }

  // POST tambah data
  addHama(data: any): Observable<any> {
    return this.http.post<any>(this.BASE, data);
  }

  // DELETE data
  deleteHama(id: number): Observable<any> {
    return this.http.delete<any>(`${this.BASE}?id=${id}`);
  }

}
