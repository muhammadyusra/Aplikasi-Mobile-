import { Component } from '@angular/core';
import { HamaService } from '../services/hama';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  standalone: false,
})
export class Tab4Page {

  deviceId!: string;

  // SIMPAN INSTANCE CHART
  chartHamaInstance: Chart | null = null;
  chartBulananInstance: Chart | null = null;
  chartHarianInstance: Chart | null = null;

  constructor(private hamaService: HamaService) {}

  ionViewDidEnter() {
    this.deviceId = localStorage.getItem('device_id') || '';
    this.loadStatistik();
  }

  loadStatistik() {
    this.hamaService.getStatistik(this.deviceId).subscribe((res: any) => {
      if (!res.status) return;

      this.renderChartHama(res.hama);
      this.renderChartBulanan(res.bulanan);
      this.renderChartHarian(res.harian);
    });
  }

  // =======================
  // PIE CHART HAMA
  // =======================
  renderChartHama(data: any[]) {
    if (this.chartHamaInstance) {
      this.chartHamaInstance.destroy();
    }

    this.chartHamaInstance = new Chart('chartHama', {
      type: 'pie',
      data: {
        labels: data.map(d => d.hama),
        datasets: [{
          data: data.map(d => d.total),
        }]
      }
    });
  }

  // =======================
  // BAR CHART BULANAN
  // =======================
  renderChartBulanan(data: any[]) {
    if (this.chartBulananInstance) {
      this.chartBulananInstance.destroy();
    }

    this.chartBulananInstance = new Chart('chartBulanan', {
      type: 'bar',
      data: {
        labels: data.map(d => d.bulan),
        datasets: [{
          label: 'Jumlah Pengamatan',
          data: data.map(d => d.total),
        }]
      }
    });
  }

  // =======================
  // LINE CHART HARIAN
  // =======================
  renderChartHarian(data: any[]) {
    if (this.chartHarianInstance) {
      this.chartHarianInstance.destroy();
    }

    this.chartHarianInstance = new Chart('chartHarian', {
      type: 'line',
      data: {
        labels: data.map(d => d.tanggal),
        datasets: [{
          label: 'Pengamatan Harian',
          data: data.map(d => d.total),
          fill: false,
          tension: 0.4
        }]
      }
    });
  }
}
