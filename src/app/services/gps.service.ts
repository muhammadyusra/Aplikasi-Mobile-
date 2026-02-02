import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AreaPayload {
    user_id: string | number;
    nama_lahan?: string;
    wkt: string;
    luas: number;
}

@Injectable({
    providedIn: 'root'
})
export class GpsService {
    private BASE = 'https://yusra.perangkatlunak.my.id/backend/api/gps-lahan';

    constructor(private http: HttpClient) { }

    // GET areas by user
    getAreas(userId: string | number): Observable<any> {
        return this.http.get(`${this.BASE}?action=list&user_id=${userId}`);
    }

    // POST save area
    saveArea(payload: AreaPayload): Observable<any> {
        return this.http.post(`${this.BASE}?action=add`, payload);
    }

    // DELETE area
    deleteArea(id: number | string, userId: string | number): Observable<any> {
        return this.http.delete(`${this.BASE}?action=delete&id=${id}&user_id=${userId}`);
    }

    // Update nama lahan
    updateAreaName(id: number | string, name: string): Observable<any> {
        return this.http.put(`${this.BASE}?action=update&id=${id}`, { nama_lahan: name });
    }
}

