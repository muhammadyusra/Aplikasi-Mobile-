import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HamaService {

  apiUrl = 'https://yusra.perangkatlunak.my.id/api/hama/';

  constructor(private http: HttpClient) {}


  // ======================
  // HOME SUMMARY
  // ======================
  getHomeSummary(deviceId: string) {
    return this.http.get(
      this.apiUrl + 'home.php?device_id=' + deviceId
    );
  }
  
  // ======================
  // STATISTIK
  // ======================
  getStatistik(deviceId: string) {
    return this.http.get(
      this.apiUrl + 'statistik.php?device_id=' + deviceId
    );
  }

  // ======================
  // UPLOAD FOTO HAMA
  // ======================
  uploadFoto(blob: Blob) {
    const formData = new FormData();

    formData.append(
      'file',
      blob,
      `hama_${Date.now()}.jpg`
    );

    return this.http.post(
      this.apiUrl + 'upload.php',
      formData
    );
  }

  // ======================
  // SIMPAN DATA HAMA
  // ======================
  simpan(data: any) {
    const formData = new FormData();

    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    return this.http.post(
      this.apiUrl + 'create.php',
      formData
    );
  }

  // ======================
  // AMBIL SEMUA DATA (TAB 3)
  // ======================
  getAll(deviceId: string) {
    return this.http.get(
      this.apiUrl + 'read.php?device_id=' + deviceId
    );
  }
  
  // ======================
  // HAPUS DATA
  // ======================
  hapus(id: number, deviceId: string) {
    return this.http.post(this.apiUrl + 'delete.php', {
      id: id,
      device_id: deviceId
    });
  }

}
