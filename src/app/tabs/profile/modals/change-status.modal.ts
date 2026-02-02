import { Component, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'change-status-modal',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  template: `
  <ion-header>
    <ion-toolbar>
      <ion-title>Ubah Status</ion-title>
      <ion-buttons slot="end">
        <ion-button (click)="close()">Batal</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <ion-item>
      <ion-label position="floating">Status</ion-label>
      <ion-input [(ngModel)]="status"></ion-input>
    </ion-item>
    <ion-button expand="full" color="success" (click)="save()">Simpan</ion-button>
  </ion-content>
  `
})
export class ChangeStatusModal {
  @Input() status!: string;

  constructor(private modalCtrl: ModalController) {}

  save() {
    this.modalCtrl.dismiss({ status: this.status });
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
