import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { IonicModule, AlertController, ToastController, NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { HamaService } from '../services/hama.service';

@Component({
  selector: 'app-catatan-hama',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './catatan-hama.page.html',
  styleUrls: ['./catatan-hama.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CatatanHamaPage implements OnInit {

  baseUrl = 'https://yusra.perangkatlunak.my.id/backend/';
  catatanHama: any[] = [];
  isShrunk = false;

  isImageModalOpen = false;
  selectedImage: string | null = null;

  constructor(
    private hamaService: HamaService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.getData();
  }

  // Ambil data dari backend PHP
  getData() {
    this.hamaService.getHama().subscribe({
      next: (res) => {
        this.catatanHama = (res.data || []).map((item: any) => {
          let fotoUrl = null;

          if (item.foto) {
            fotoUrl = this.getFullImageUrl(item.foto);
          }

          return { ...item, foto: fotoUrl };
        });
      }
    });
  }

  // Helper URL gambar
  getFullImageUrl(path?: string): string {
    if (!path) return this.baseUrl + 'uploads/default-avatar.png';

    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
      return path;
    }

    return this.baseUrl + path.replace(/^\/+/, '');
  }

  onScroll(event: any) {
    this.isShrunk = event.detail.scrollTop > 30;
  }

  goBack() {
    this.navCtrl.navigateBack('/tabs/home');
  }

  openImage(url: string) {
    this.selectedImage = url;
    this.isImageModalOpen = true;
  }

  closeImage() {
    this.isImageModalOpen = false;
    this.selectedImage = null;
  }

  async confirmDelete(item: any) {
    const id = item.id;
    if (!id) {
      this.showToast('ID tidak ditemukan');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Hapus Catatan',
      message: 'Yakin ingin menghapus?',
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Hapus',
          role: 'destructive',
          handler: () => {
            this.hamaService.deleteHama(id).subscribe({
              next: () => {
                this.catatanHama = this.catatanHama.filter(x => x.id !== id);
                this.showToast('Catatan dihapus');
              },
              error: (err) => {
                console.error('Error delete:', err);
                this.showToast('Gagal menghapus');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  async showToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      color: 'success',
      duration: 1500
    });
    toast.present();
  }
}
