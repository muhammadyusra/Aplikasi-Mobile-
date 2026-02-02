import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { HamaService } from '../services/hama.service';

@Component({
  selector: 'app-statistik',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './statistik.page.html',
  styleUrls: ['./statistik.page.scss'],
})
export class StatistikPage implements OnInit, AfterViewInit {

  @ViewChild('pieCanvas') pieCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineCanvas') lineCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('exportArea') exportArea!: ElementRef;

  pieChart!: Chart;
  lineChart!: Chart;

  totalHama = 0;
  jumlahJenis = 0;
  bulanIni = 0;
  persentaseKenaikan = 0;
  persenKenaikanThisMonth = 0;
  currentMonthName = '';
  currentYear = 0;

  hamaList: any[] = [];

  constructor(private hamaService: HamaService, private navCtrl: NavController) {}

  ngOnInit() {
    this.setTanggalHeader();
    this.loadData();
  }

  ngAfterViewInit() {
    setTimeout(() => this.renderChartsSafely(), 300);
  }

  goBack() {
    this.navCtrl.back();
  }

  // ================= LOAD DATA =================
  loadData() {
    this.hamaService.getHama().subscribe({
      next: (res) => {
        const data = res.data || [];
        this.hamaList = data;
        this.hitungStatistik(data);
        this.renderChartsSafely();
      },
      error: () => {
        this.hamaList = [];
      }
    });
  }

  renderChartsSafely() {
    if (this.pieCanvas) this.renderPieChart();
    if (this.lineCanvas) this.renderLineChart();
  }

  // ================= HEADER =================
  setTanggalHeader() {
    const now = new Date();
    this.currentYear = now.getFullYear();
    const bulan = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
    this.currentMonthName = bulan[now.getMonth()];
  }

  // ================= HITUNG STATISTIK =================
  hitungStatistik(data: any[]) {
    this.totalHama = data.length;
    this.jumlahJenis = new Set(data.map(d => d.jenis_hama)).size;

    const now = new Date();
    const bulan = now.getMonth();
    const tahun = now.getFullYear();

    this.bulanIni = data.filter(item => {
      const tgl = new Date(item.tanggal_pengamatan);
      return tgl.getMonth() === bulan && tgl.getFullYear() === tahun;
    }).length;

    const bulanLalu = bulan - 1 < 0 ? 11 : bulan - 1;
    const tahunBL = bulan - 1 < 0 ? tahun - 1 : tahun;

    const laporanBL = data.filter(item => {
      const tgl = new Date(item.tanggal_pengamatan);
      return tgl.getMonth() === bulanLalu && tgl.getFullYear() === tahunBL;
    }).length;

    if (laporanBL === 0 && this.bulanIni > 0) this.persentaseKenaikan = 100;
    else if (laporanBL === 0) this.persentaseKenaikan = 0;
    else this.persentaseKenaikan = Math.round(((this.bulanIni - laporanBL) / laporanBL) * 100);

    this.persenKenaikanThisMonth = this.persentaseKenaikan;
  }

  // ================= PIE CHART =================
  renderPieChart() {
    const group: any = {};
    this.hamaList.forEach(item => {
      const key = item.jenis_hama;
      group[key] = (group[key] || 0) + 1;
    });

    const labels = Object.keys(group);
    const values = Object.values(group);

    if (this.pieChart) this.pieChart.destroy();

    this.pieChart = new Chart(this.pieCanvas.nativeElement, {
      type: 'pie',
      data: { labels, datasets: [{ data: values as number[] }] },
      options: { responsive: true }
    });
  }

  // ================= LINE CHART =================
  renderLineChart() {
    const bulanan = Array(12).fill(0);

    this.hamaList.forEach(item => {
      const tgl = new Date(item.tanggal_pengamatan);
      bulanan[tgl.getMonth()]++;
    });

    if (this.lineChart) this.lineChart.destroy();

    this.lineChart = new Chart(this.lineCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"],
        datasets: [{ label: "Total laporan hama", data: bulanan, tension: 0.4 }]
      },
      options: { responsive: true }
    });
  }

  refreshDataAndCharts() {
    this.loadData();
  }
}
