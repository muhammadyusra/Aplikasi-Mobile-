import { Component } from '@angular/core';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class ResetPasswordPage {

  email = '';
  token = '';
  password = '';
  confirm = '';

  API_URL = 'https://yusra.perangkatlunak.my.id/backend/api/reset-password';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private toast: ToastController,
    private loadingCtrl: LoadingController,
    private router: Router
  ) {}

ionViewWillEnter() {
  this.token = this.route.snapshot.paramMap.get('token') || '';
  this.email = this.route.snapshot.queryParams['email'] || '';
}


  async showToast(msg: string) {
    const t = await this.toast.create({ 
      message: msg, 
      duration: 2500, 
      position: 'top',
      color: 'primary'
    });
    t.present();
  }

  async resetPassword() {

    // 🔐 validasi link
    if (!this.email || !this.token) {
      return this.showToast('Link reset tidak valid atau sudah kadaluarsa!');
    }

    // 🔐 validasi input
    if (!this.password || !this.confirm) {
      return this.showToast('Semua field wajib diisi!');
    }
    if (this.password !== this.confirm) {
      return this.showToast('Password tidak sama!');
    }

    const loading = await this.loadingCtrl.create({ 
      message: 'Menyimpan password...',
      spinner: 'crescent'
    });
    await loading.present();

    this.http.post(this.API_URL, {
      email: this.email,
      token: this.token,
      new_password: this.password
    }).subscribe({
      next: async (res: any) => {
        await loading.dismiss();

        this.showToast(res.message || 'Password berhasil direset!');

        if (res.success) {
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 800);
        }
      },
      error: async (err) => {
        await loading.dismiss();

        console.log('RESET ERROR:', err);

        if (err.status === 400 || err.status === 404) {
          this.showToast(err.error?.message || 'Data tidak valid!');
        } else if (err.status === 500) {
          this.showToast(err.error?.message || 'Terjadi kesalahan server!');
        } else {
          this.showToast('Gagal terhubung ke server!');
        }
      }
    });
  }
}
