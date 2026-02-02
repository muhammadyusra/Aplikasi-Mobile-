import { Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy } from '@angular/core';
import {
  IonicModule,
  ToastController,
  ActionSheetController,
  Platform
} from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Subscription } from 'rxjs';

import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  imports: [IonicModule, CommonModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProfilePage implements OnDestroy {

  defaultAvatar = 'https://yusra.perangkatlunak.my.id/backend/uploads/default.png';
  avatarUrl = this.defaultAvatar;


  baseUrl = 'https://yusra.perangkatlunak.my.id/backend/';

  profile = {
    name: '',
    email: '',
    phone: ''
  };

  userId!: number;
  avatarSub?: Subscription;

  constructor(
    private toastCtrl: ToastController,
    private actionSheetCtrl: ActionSheetController,
    private router: Router,
    private platform: Platform,
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  async ionViewWillEnter() {
    const user = await this.authService.getUser();
    if (!user) {
      this.router.navigateByUrl('/login', { replaceUrl: true });
      return;
    }

    this.userId = user.id;
    this.profile.name = user.name;
    this.profile.email = user.email;
    this.profile.phone = user.phone;

    // ==== SET AVATAR DARI STORAGE ====
    if (user.avatar) {
      this.avatarUrl = this.buildAvatarUrl(user.avatar);
    } else {
      this.avatarUrl = this.defaultAvatar;
    }

    // subscribe perubahan avatar
    this.avatarSub?.unsubscribe();
    this.avatarSub = this.profileService.profileImage$
      .subscribe(url => {
        if (url) this.avatarUrl = url;
      });

    // fetch ulang dari backend
    this.profileService.getProfile(this.userId).subscribe();
  }

  ngOnDestroy() {
    this.avatarSub?.unsubscribe();
  }

  // ==== BANGUN URL AMAN (ANTI DOBEL) ====
  buildAvatarUrl(path: string): string {
    if (!path) return this.defaultAvatar;

    if (path.startsWith('http')) {
      return path + '?t=' + Date.now();
    }

    const clean = path.replace(/^\/+/, '');
    return this.baseUrl + clean + '?t=' + Date.now();
  }

  setDefaultAvatar() {
    this.avatarUrl = this.defaultAvatar;
  }

  async openPhotoOptions() {
    const sheet = await this.actionSheetCtrl.create({
      header: 'Ubah Foto',
      buttons: [
        {
          text: 'Pilih Foto',
          icon: 'image-outline',
          handler: () => this.takePhoto(
            this.platform.is('hybrid')
              ? CameraSource.Camera
              : CameraSource.Photos
          )
        },
        { text: 'Batal', role: 'cancel' }
      ]
    });

    await sheet.present();
  }

  async takePhoto(source: CameraSource) {
    const image = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source,
      quality: 70
    });

    if (!image?.webPath) return;

    const blob = await fetch(image.webPath).then(r => r.blob());
    const file = new File([blob], 'avatar.jpg', { type: blob.type });

    this.profileService.uploadAvatar(this.userId, file).subscribe(() => {
      this.showToast('Foto profil diperbarui', 'success');
    });
  }

  async logout() {
    await this.authService.removeUser();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  async showToast(message: string, color: any) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 1800,
      position: 'top',
      color
    });
    await toast.present();
  }
}
