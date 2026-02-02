import { Component } from '@angular/core';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { HamaService } from '../../services/hama.service';

@Component({
  selector: 'app-hama',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule],
  templateUrl: './hama.page.html',
  styleUrls: ['./hama.page.scss'],
})
export class HamaPage {
  private baseUrl = 'https://yusra.perangkatlunak.my.id/backend/';


  form: any = {
    tanggal_pengamatan: '',
    lokasi_blok: '',
    jenis_tanaman: '',
    umur_tanaman: null,
    jenis_hama: '',
    tingkat_serangan: null,
    gejala_serangan: '',
    keterangan: ''
  };

  // pilihan dari aplikasi
  jenisTanamanList: string[] = [
    'Padi', 'Jagung', 'Cabai', 'Tomat', 'Bawang Merah', 'Kedelai'
  ];

  jenisHamaList: string[] = [
    'Wereng', 'Ulat Grayak', 'Penggerek Batang', 'Tikus', 'Thrips', 'Kutu Daun'
  ];

  selectedFile: File | null = null;
  previewImage: string | null = null;
  lastImageUrl: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private hamaService: HamaService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    toast.present();
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.presentToast('File bukan gambar!', 'danger');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.presentToast('Ukuran gambar maksimal 5MB', 'danger');
      return;
    }

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.previewImage = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

async submit() {
  const loading = await this.loadingCtrl.create({
    message: 'Menyimpan...',
    spinner: 'crescent'
  });
  await loading.present();

  const formData = new FormData();
  Object.keys(this.form).forEach(key => {
    formData.append(key, this.form[key] ?? '');
  });

  if (this.selectedFile) {
    formData.append('foto', this.selectedFile, this.selectedFile.name);
  }

  this.http.post<any>(
    this.baseUrl + 'api/pengamatan',
    formData
  ).subscribe({
    next: async (res) => {
      loading.dismiss();

      if (!res.success) {
        this.presentToast('Gagal menyimpan data', 'danger');
        return;
      }

      let fotoPath = res.data?.foto ?? null;
      if (fotoPath) {
        fotoPath = fotoPath.replace('index.php/', '');
        this.lastImageUrl = this.baseUrl + fotoPath;
      }

      this.presentToast('Data berhasil disimpan!');
      this.resetForm();
      this.router.navigate(['/catatan-hama']);
    },
    error: async (err) => {
      loading.dismiss();
      console.error('Error saat POST: ', err);
      this.presentToast('Gagal menyimpan data', 'danger');
    }
  });
}



  resetForm() {
    this.form = {
      tanggal_pengamatan: '',
      lokasi_blok: '',
      jenis_tanaman: '',
      umur_tanaman: null,
      jenis_hama: '',
      tingkat_serangan: null,
      gejala_serangan: '',
      keterangan: ''
    };
    this.selectedFile = null;
    this.previewImage = null;
  }
}
