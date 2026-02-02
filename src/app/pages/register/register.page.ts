import { Component } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  imports: [IonicModule, FormsModule, CommonModule, RouterModule, HttpClientModule]
})
export class RegisterPage {

  name = '';
  phone = '';
  email = '';
  password = '';

  api = 'https://yusra.perangkatlunak.my.id/backend/api/auth/register';


  constructor(
    private http: HttpClient,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  register() {
    if (!this.name || !this.phone || !this.email || !this.password) {
      this.showAlert("Semua field wajib diisi!");
      return;
    }

    const body = {
      name: this.name,
      phone: this.phone,
      email: this.email,
      password: this.password
    };

    this.http.post(this.api, body).subscribe({
      next: (res: any) => {
        if (!res.success) {
          this.showAlert(res.message || "Registrasi gagal!");
          return;
        }

        localStorage.setItem("username", this.name);

        this.showAlert("Registrasi berhasil! Silakan cek email untuk verifikasi.");

        this.router.navigate(['/login']);
      },

      error: (err) => {
        this.showAlert(err.error?.message || "Gagal terhubung ke server!");
      }
    });
  }

  async showAlert(msg: string) {
    const alert = await this.alertCtrl.create({
      header: 'Informasi',
      message: msg,
      buttons: ['OK']
    });
    await alert.present();
  }
}
