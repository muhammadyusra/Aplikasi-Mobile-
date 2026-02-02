import { Component } from '@angular/core';
import { HamaService } from '../services/hama';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {

  dataHama: any[] = [];

  // BASE URL FOTO (WAJIB & BENAR)
  apiFoto = 'https://yusra.perangkatlunak.my.id/api/hama/uploads/hama/';

  deviceId: string | null = null;

  constructor(private hamaService: HamaService) {}

  ionViewWillEnter() {
    this.deviceId = localStorage.getItem('device_id') || '';
    this.loadData();
  }

  loadData() {
    if (!this.deviceId) return;

    this.hamaService.getAll(this.deviceId).subscribe({
      next: (res: any) => {
        this.dataHama = res?.data || [];
      },
      error: () => {
        this.dataHama = [];
      }
    });
  }

  hapus(id: number) {
    if (!confirm('Yakin ingin menghapus data ini?')) return;

    if (!this.deviceId) return;

    this.hamaService.hapus(id, this.deviceId).subscribe({
      next: () => {
        this.loadData();
      }
    });
  }

}
