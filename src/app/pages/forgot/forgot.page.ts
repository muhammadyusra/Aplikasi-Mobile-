import { Component } from '@angular/core';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.page.html',
  styleUrls: ['./forgot.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ForgotPage {

  email: string = '';
  API_URL = 'https://yusra.perangkatlunak.my.id/backend/api/forgot-password';
  
  constructor(
    private http: HttpClient,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private router: Router
  ) {}

  // 🔙 Kembali ke halaman login
  goBack() {
    this.router.navigate(['/login']);
  }
  
  async sendResetLink() {
    // Validasi frontend
    if (!this.email || !this.email.includes('@')) {
      return this.showToast("Masukkan email yang valid!");
    }

    const loading = await this.loadingCtrl.create({
      message: "Mengirim link...",
      spinner: "crescent"
    });
    await loading.present();

    // Request ke backend
    this.http.post(this.API_URL, { email: this.email })
      .subscribe({
        next: async (res: any) => {
          await loading.dismiss();
          // Sukses
          this.showToast(res.message || "Link reset telah dikirim!");
        },
        error: async (err) => {
          await loading.dismiss();
          // Error handling
          if (err.status === 404) {
            this.showToast("Email tidak ditemukan!");
          } else if (err.status === 400) {
            this.showToast(err.error?.message || "Email wajib diisi!");
          } else {
            this.showToast("Terjadi kesalahan server!");
          }
        }
      });
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: "top",
      color: "primary"
    });
    toast.present();
  }
}
