import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false
})
export class Tab1Page {

  totalPengamatan = 0;
  totalJenisHama = 0;
  deviceId = '';

  apiUrl = 'https://yusra.perangkatlunak.my.id/api/hama/home.php';

  constructor(private http: HttpClient) {}

  ionViewWillEnter() {
    this.deviceId = localStorage.getItem('device_id') || '';
    if (this.deviceId) {
      this.loadHomeData();
    }
  }

  loadHomeData() {
    this.http.get<any>(`${this.apiUrl}?device_id=${this.deviceId}`)
      .subscribe(res => {
        if (res.status) {
          this.totalPengamatan = res.total_pengamatan;
          this.totalJenisHama  = res.total_hama;
        }
      });
  }
}
