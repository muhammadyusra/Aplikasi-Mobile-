import { Component, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'edit-profile-modal',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  template: `
  <ion-header>
    <ion-toolbar>
      <ion-title>Edit Profil</ion-title>
      <ion-buttons slot="end">
        <ion-button (click)="close()">Batal</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <div class="avatar-wrapper" (click)="changeAvatar()">
    <img [src]="avatar || 'assets/default-avatar.png'" class="avatar">
      <p class="avatar-text">Klik untuk ganti foto</p>
    </div>

    <ion-item>
      <ion-label position="floating">Username</ion-label>
      <ion-input [(ngModel)]="username"></ion-input>
    </ion-item>

    <ion-button expand="full" color="success" (click)="save()">Simpan</ion-button>
  </ion-content>
  `,
  styleUrls: ['./edit-profile.modal.scss']
})
export class EditProfileModal {
  @Input() username!: string;
  @Input() avatar!: string;

  constructor(private modalCtrl: ModalController) {}

  /** Ganti avatar via galeri */
  async changeAvatar() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });
      if (image?.dataUrl) this.avatar = image.dataUrl;
    } catch (error) {
      console.log('Gagal memilih foto:', error);
    }
  }

  /** Simpan dan kirim data ke ProfilePage */
  save() {
    this.modalCtrl.dismiss({ username: this.username, avatar: this.avatar });
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
