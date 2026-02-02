import { Component, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'avatar-preview-modal',
  standalone: true,
  imports: [IonicModule, CommonModule],
  template: `
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="end">
        <ion-button (click)="close()">Tutup</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding avatar-preview">
    <img [src]="avatar" alt="Avatar" />
  </ion-content>
  `,
  styles: [`
    .avatar-preview img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  `]
})
export class AvatarPreviewModal {
  @Input() avatar!: string;
  constructor(private modalCtrl: ModalController) {}
  close() { this.modalCtrl.dismiss(); }
}
