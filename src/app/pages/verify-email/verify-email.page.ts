import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AlertController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-verify-email',
  template: `
    <ion-content class="ion-padding">
      <h2>Memverifikasi Email...</h2>
    </ion-content>
  `,
  imports: [IonicModule, CommonModule]
})
export class VerifyEmailPage implements OnInit {

  API = 'https://yusra.perangkatlunak.my.id/backend/api/verify-email?token=XXXX';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.showAlert('Token tidak valid');
      return;
    }

    this.http.get(`${this.API}?token=${token}`).subscribe({
      next: async () => {
        const alert = await this.alertCtrl.create({
          header: 'Berhasil',
          message: 'Email berhasil diverifikasi. Silakan login.',
          buttons: ['OK']
        });
        await alert.present();
        this.router.navigate(['/login']);
      },
      error: async () => {
        this.showAlert('Token tidak valid atau sudah digunakan');
      }
    });
  }

  async showAlert(msg: string) {
    const alert = await this.alertCtrl.create({
      header: 'Verifikasi Gagal',
      message: msg,
      buttons: ['OK']
    });
    await alert.present();
  }
}
