import { Component } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    IonicModule,
    FormsModule,
    CommonModule,
    RouterModule,
    HttpClientModule
  ],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {

  email = '';
  password = '';
  showPassword = false;

  api = 'https://yusra.perangkatlunak.my.id/backend/api/auth/login';

  constructor(
    private router: Router,
    private http: HttpClient,
    private alertCtrl: AlertController,
    private authService: AuthService
  ) {}

  login() {
    if (!this.email || !this.password) {
      this.showAlert('Email dan password tidak boleh kosong!');
      return;
    }

    this.http.post(this.api, {
      email: this.email,
      password: this.password
    }).subscribe({

      next: async (res: any) => {
        if (!res.success) {
          this.showAlert(res.message || 'Login gagal');
          return;
        }

        const user = res.user;
        const token = res.token; // ← dari backend

        // ✅ simpan user & token
        await this.authService.saveUser(user);
        localStorage.setItem('auth_token', token);

        // ✅ redirect ke tabs (biar guard + child route yang atur)
        this.router.navigate(['/tabs'], { replaceUrl: true });
      },

      error: (err) => {
        if (err.status === 403) {
          this.showAlert(err.error?.message || 'Email belum diverifikasi');
        } 
        else if (err.status === 400) {
          this.showAlert(err.error?.message || 'Email atau password salah');
        } 
        else {
          this.showAlert('Gagal terhubung ke server');
        }
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  async showAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Login',
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
