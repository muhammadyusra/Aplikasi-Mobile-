import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { v4 as uuidv4 } from 'uuid';
import { HamaService } from '../services/hama';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {

  previewFoto?: string;
  fotoBlob?: Blob;

  formHama: any = {
    device_id: '',
    tanggal: '',
    tanaman: '',
    umur: '',
    hama: '',
    tingkat: '',
    gejala: '',
    keterangan: '',
    foto: ''
  };

  constructor(
    private hamaService: HamaService,
    private router: Router
  ) {}

  // ======================
  // INIT DEVICE ID
  // ======================
  ngOnInit() {
    let deviceId = localStorage.getItem('device_id');

    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem('device_id', deviceId);
    }

    this.formHama.device_id = deviceId;
  }

  // ======================
  // AMBIL FOTO DARI KAMERA
  // ======================
  async ambilFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 70,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      if (!image.dataUrl) return;

      this.previewFoto = image.dataUrl;

      const response = await fetch(image.dataUrl);
      this.fotoBlob = await response.blob();

    } catch (error) {
      console.error('Gagal ambil foto:', error);
      alert('Gagal mengambil foto');
    }
  }

  // ======================
  // SIMPAN DATA + FOTO
  // ======================
  simpan() {
    if (!this.fotoBlob) {
      alert('Foto wajib diisi');
      return;
    }

    // 1️⃣ Upload foto dulu
    this.hamaService.uploadFoto(this.fotoBlob).subscribe({
      next: (res: any) => {
        if (!res.status) {
          alert('Upload foto gagal');
          return;
        }

        // 2️⃣ Simpan nama file ke database
        this.formHama.foto = res.filename;

        this.hamaService.simpan(this.formHama).subscribe({
          next: () => {
            alert('Data berhasil disimpan');

            // reset form (device_id tetap)
            this.formHama = {
              device_id: this.formHama.device_id,
              tanggal: '',
              tanaman: '',
              umur: '',
              hama: '',
              tingkat: '',
              gejala: '',
              keterangan: '',
              foto: ''
            };

            this.previewFoto = undefined;
            this.fotoBlob = undefined;

            this.router.navigate(['/tabs/tab3']);
          },
          error: () => {
            alert('Gagal menyimpan data');
          }
        });
      },
      error: () => {
        alert('Upload foto gagal');
      }
    });
  }
}
