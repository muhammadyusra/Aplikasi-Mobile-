import { Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, AfterViewInit } from '@angular/core';
import { IonicModule, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import * as turf from '@turf/turf';
import { GpsService } from '../../services/gps.service';

@Component({
  selector: 'app-gps',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './gps.page.html',
  styleUrls: ['./gps.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GpsPage implements AfterViewInit, OnDestroy {

  // Legend items for PDF (warna hex)
  legendItems: { name: string; color: string }[] = [
    { name: 'Area Polygon', color: '#0074D9' },
    { name: 'Marker GPS', color: '#F39C12' },
    { name: 'Marker Manual', color: '#228B22' }
  ];


  // Map
  private map!: L.Map;
  private baseNormal!: L.TileLayer;
  private baseSatellite!: L.TileLayer;

  // Markers & polygon
  markers: L.Marker[] = [];
  polygonLayer: L.Polygon | null = null;

  // Stats
  area: number = 0; // m2
  perimeter: number = 0; // m

  // UI state
  tracking: boolean = false;
  mapMode: 'normal' | 'satellite' = 'normal';

  private watchId: number | null = null;
  private lastAutoPoint: L.LatLng | null = null;

  private loadImageBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  constructor(
    private gpsService: GpsService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) { }

  // ================= INIT MAP =================
  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 120);
  }

  // ================= IONIC VIEW ENTER (WAJIB) =================
  ionViewDidEnter(): void {
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize(true);
      }
    }, 250);
  }

  // ================= CLEANUP =================
  ngOnDestroy(): void {
    if (this.watchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watchId);
    }

    if (this.map) {
      this.map.remove();
    }
  }


  // ---------------- Map init & auto-locate ----------------
  private initMap() {
    this.baseNormal = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' });
    this.baseSatellite = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { subdomains: ['mt0', 'mt1', 'mt2', 'mt3'], attribution: 'Google Satellite' });

    this.map = L.map('map', {
      center: [-6.200000, 106.816666],
      zoom: 15,
      layers: [this.baseNormal],
      zoomControl: false,
      attributionControl: false
    });

    // auto locate once (center to user on load)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          this.map.setView([lat, lng], 17);
          const m = L.circleMarker([lat, lng], { radius: 6, fillColor: '#2ecc71', color: '#fff', weight: 2, fillOpacity: 1 }).addTo(this.map);
          m.bindPopup('Lokasi Anda').openPopup();
        },
        (err) => {
          console.warn('getCurrentPosition failed', err);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }

// ---------------- Tracking / manual ----------------
toggleTracking() {
  this.tracking = !this.tracking;

if (this.tracking) {
  // reset cache supaya titik pertama pasti masuk
  this.lastAutoPoint = null;

  if (!('geolocation' in navigator)) {
    this.showToast('Perangkat tidak mendukung GPS', 'danger');
    this.tracking = false;
    return;
  }

  // cek izin lokasi (jika browser support)
  if (navigator.permissions) {
    navigator.permissions.query({ name: 'geolocation' as PermissionName }).then(p => {
      if (p.state === 'denied') {
        this.showToast('Izin lokasi ditolak. Aktifkan di pengaturan browser.', 'danger');
        this.tracking = false;
        return;
      }
    });
  }


    // start watch
    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // peta mengikuti posisi user
        this.map.setView([lat, lng], this.map.getZoom(), { animate: true });

        this.addPoint(lat, lng, true);
      },
      (err) => {
        console.warn('watchPos err', err);
        this.showToast('Gagal mengakses lokasi', 'danger');
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    ) as unknown as number;

    this.showToast('Tracking dimulai');

  } else {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.showToast('Tracking dihentikan');
  }
}


  addManualPoint() {
    this.showToast('Klik peta untuk menambah titik manual', 'primary');
    const handler = (e: L.LeafletMouseEvent) => {
      this.addPoint(e.latlng.lat, e.latlng.lng, false);
      this.map.off('click', handler);
    };
    this.map.on('click', handler);
  }

  private addPoint(lat: number, lng: number, isAuto = false) {

    // filter noise GPS untuk auto
    if (isAuto) {
      const current = L.latLng(lat, lng);
      if (this.lastAutoPoint) {
        const d = this.map.distance(this.lastAutoPoint, current);
        if (d < 5) return; // kurang dari 5 meter → abaikan
      }
      this.lastAutoPoint = current;
    }

    const icon = L.icon({
      iconUrl: isAuto
        ? '/assets/icons/pin-gps.png'
        : '/assets/icons/pin-manual.png',
      iconSize: [28, 28],
      iconAnchor: [14, 32]
    });

    const marker = L.marker([lat, lng], { icon }).addTo(this.map);
    marker.bindPopup(`${this.markers.length + 1}`).openPopup();
    this.markers.push(marker);
    this.updatePolygon();
  }

  // ================= RESET =================
  resetDrawing() {
    this.markers.forEach(m => { try { this.map.removeLayer(m); } catch { } });
    this.markers = [];
    if (this.polygonLayer) { try { this.map.removeLayer(this.polygonLayer); } catch { } }
    this.polygonLayer = null;
    this.area = 0;
    this.perimeter = 0;
    this.lastAutoPoint = null; // reset cache tracking
    this.showToast('Area direset');
  }

  private updatePolygon() {
    if (this.polygonLayer) { try { this.map.removeLayer(this.polygonLayer); } catch { } }
    if (this.markers.length < 3) { this.area = 0; this.perimeter = 0; return; }

    const latlngs = this.markers.map(m => m.getLatLng());
    this.polygonLayer = L.polygon(latlngs, { color: '#0074D9', weight: 2, fillOpacity: 0.18 }).addTo(this.map);

    // compute area using turf (expects [lng,lat])
    const coords = latlngs.map(p => [p.lng, p.lat]);
    const polygon = turf.polygon([[...coords, coords[0]]]);
    this.area = turf.area(polygon);
    // perimeter in meters
    let per = 0;
    for (let i = 0; i < coords.length; i++) {
      const a = coords[i];
      const b = coords[(i + 1) % coords.length];
      try {
        per += this.map.distance(L.latLng(a[1], a[0]), L.latLng(b[1], b[0]));
      } catch {
        // ignore
      }
    }
    this.perimeter = per;

    // fit bounds slightly
    const bounds = this.polygonLayer.getBounds();
    if (bounds && bounds.isValid && bounds.isValid()) {
      this.map.invalidateSize();
      this.map.fitBounds(bounds.pad(0.06));
    }
  }

  // ---------------- Saved layers (server) ----------------
  // Ambil auth object dari localStorage
  private getAuth() {
    const auth = localStorage.getItem("auth");
    if (!auth) return null;

    try {
      return JSON.parse(auth);
    } catch {
      return null;
    }
  }

  // Ambil user id dari auth
  private getUserId(): string | null {
    const auth = this.getAuth();

    if (!auth || !auth.user || !auth.user.id) return null;

    return String(auth.user.id);
  }

  // Ambil token dari auth
  private getToken(): string | null {
    const auth = this.getAuth();

    if (!auth || !auth.token) return null;

    return auth.token;
  }


  private renderSavedLayer(item: any) {
    try {
      if (!item.wkt) return;
      // parse WKT POLYGON -> latlng array
      const latlngs: [number, number][] = this.wktToLatLngs(item.wkt);
      if (!latlngs || latlngs.length < 3) return;
      const poly = L.polygon(latlngs, { color: '#f39c12', weight: 2, fillOpacity: 0.12 }).addTo(this.map);
    } catch (err) {
      console.warn('renderSavedLayer err', err);
    }
  }


  // Edit name (calls service.updateAreaName -> backend must support PUT /api/gps-lahan/:id)
  async editAreaName(item: any) {
    const alert = await this.alertCtrl.create({
      header: 'Edit Nama Area',
      inputs: [{ name: 'name', type: 'text', value: item.nama_lahan || '' }],
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Simpan', handler: (v) => {
            if (!v.name) return;
            this.gpsService.updateAreaName(item.id, v.name).subscribe({
              next: () => { this.showToast('Nama diperbarui', 'success'); item.nama_lahan = v.name; },
              error: (err) => { console.error(err); this.showToast('Gagal update nama', 'danger'); }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  // convert coords [[lng,lat],...] to WKT POLYGON
  coordsToWKT(coords: number[][]): string {
    let points = coords.map(c => [c[1], c[0]]) as [number, number][];
    if (points.length > 0 &&
      (points[0][0] !== points[points.length - 1][0] ||
        points[0][1] !== points[points.length - 1][1])) {
      points.push(points[0]);
    }
    const coordString = points.map(p => `${p[0]} ${p[1]}`).join(', ');
    return `POLYGON((${coordString}))`;
  }

  // parse WKT POLYGON -> latlngs array [[lat,lng],...]
  private wktToLatLngs(wkt: string): [number, number][] {
    try {
      const inside = wkt.replace(/POLYGON\s*\(\(/i, '').replace(/\)\)/, '').trim();
      const pairs = inside.split(',').map(s => s.trim());
      return pairs.map(p => {
        const [lngStr, latStr] = p.split(/\s+/);
        const lat = parseFloat(latStr);
        const lng = parseFloat(lngStr);
        return [lat, lng] as [number, number];
      });
    } catch (err) {
      console.warn('wkt parse fail', err);
      return [];
    }
  }

  // ---------------- Map base layer toggle ----------------
  toggleMapLayer() {
    if (!this.map) return;
    if (this.mapMode === 'normal') {
      this.map.removeLayer(this.baseNormal);
      this.baseSatellite.addTo(this.map);
      this.mapMode = 'satellite';
      this.showToast('Mode Satelit');
    } else {
      this.map.removeLayer(this.baseSatellite);
      this.baseNormal.addTo(this.map);
      this.mapMode = 'normal';
      this.showToast('Mode Normal');
    }
  }

  // ---------------- Helper: flatten latlng arrays without using flat() ----------------
  private flattenLatLngs(latlngs: any): L.LatLng[] {
    if (!latlngs) return [];
    // If first element is an array (nested), flatten one level
    if (Array.isArray(latlngs) && Array.isArray(latlngs[0])) {
      const out: L.LatLng[] = [];
      for (let i = 0; i < latlngs.length; i++) {
        const row = latlngs[i];
        if (Array.isArray(row)) {
          for (let j = 0; j < row.length; j++) {
            out.push(row[j]);
          }
        } else {
          out.push(row);
        }
      }
      return out;
    }
    // already flat
    return latlngs as L.LatLng[];
  }

  // ---------------- CREATE LEGEND ELEMENT (dynamic) ----------------
  private createLegendElement(areaText: string, jumlahTitik: number, scaleText: string): HTMLElement {
    const el = document.createElement('div');
    // inline styles (so html2canvas captures without external CSS)
    el.setAttribute('id', 'pdf-legend-temp');
    el.style.position = 'absolute';
    el.style.top = '18px';
    el.style.right = '18px';
    el.style.zIndex = '99999';
    el.style.background = 'rgba(255,255,255,0.98)';
    el.style.borderRadius = '8px';
    el.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
    el.style.padding = '12px 14px';
    el.style.fontFamily = 'Helvetica, Arial, sans-serif';
    el.style.fontSize = '10.5px';
    el.style.color = '#222';
    el.style.width = '170px';
    el.style.lineHeight = '1.3';
    el.style.border = '1px solid rgba(0,0,0,0.06)';

    // Title
    const title = document.createElement('div');
    title.style.fontWeight = '700';
    title.style.fontSize = '12px';
    title.style.marginBottom = '8px';
    title.innerText = 'Legenda';
    el.appendChild(title);

    // Items
    this.legendItems.forEach(it => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.marginBottom = '6px';

      const box = document.createElement('span');
      box.style.display = 'inline-block';
      box.style.width = '12px';
      box.style.height = '12px';
      box.style.borderRadius = '3px';
      box.style.marginRight = '8px';
      box.style.border = '1px solid rgba(0,0,0,0.08)';
      box.style.background = it.color;

      const name = document.createElement('div');
      name.innerText = it.name;
      name.style.flex = '1';

      row.appendChild(box);
      row.appendChild(name);
      el.appendChild(row);
    });

    // Divider
    const hr = document.createElement('div');
    hr.style.height = '1px';
    hr.style.background = 'rgba(0,0,0,0.06)';
    hr.style.margin = '6px 0';
    el.appendChild(hr);

    // Area & count & north & scale
    const infoList = [
      { label: 'Luas', value: areaText },
      { label: 'Jumlah Titik', value: String(jumlahTitik) },
      { label: 'North', value: '↑ (atas halaman = utara)' },
      { label: 'Scale', value: scaleText }
    ];
    infoList.forEach(i => {
      const r = document.createElement('div');
      r.style.display = 'flex';
      r.style.justifyContent = 'space-between';
      r.style.marginBottom = '4px';
      const k = document.createElement('div'); k.innerText = i.label; k.style.fontWeight = '600';
      const v = document.createElement('div'); v.innerText = i.value; v.style.color = '#333';
      r.appendChild(k); r.appendChild(v);
      el.appendChild(r);
    });

    return el;
  }

  // =======================================================
  // SCALE BAR (cm → meter | 1:500 / 1:1000)
  // =======================================================
  private drawScaleBar(pdf: any, x: number, y: number, scaleRatio: number) {
    const barCm = 5;
    const barMm = barCm * 10;
    const meterPerCm = scaleRatio === 500 ? 5 : 10;
    const totalMeter = barCm * meterPerCm;

    pdf.setDrawColor(0);
    pdf.setLineWidth(0.6);

    pdf.line(x, y, x + barMm, y);
    pdf.line(x, y - 2, x, y + 2);
    pdf.line(x + barMm, y - 2, x + barMm, y + 2);

    for (let i = 1; i < barCm; i++) {
      pdf.line(x + i * 10, y - 1.5, x + i * 10, y + 1.5);
    }

    pdf.setFontSize(9);
    pdf.text('0', x, y + 6);
    pdf.text(`${barCm} cm`, x + barMm, y + 6, { align: 'right' });

    pdf.text(
      `Skala 1:${scaleRatio} (${barCm} cm = ${totalMeter} m)`,
      x + barMm / 2,
      y + 12,
      { align: 'center' }
    );
  }

  // =======================================================
  // NORTH ARROW (MINIMAL + ARC-GIS STYLE)
  // =======================================================
  private async drawNorthArrow(
    pdf: any,
    x: number,
    y: number,
    size: number = 10 // ⬅️ kecil & minimalis
  ) {
    const imgBase64 = await this.loadImageBase64(
      'assets/north-arrow-arcgis.png'
    );

    // Huruf "U" (Utara)
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text('U', x, y - size - 2, { align: 'center' });

    // Gambar north arrow
    pdf.addImage(
      imgBase64,
      'PNG',
      x - size / 2,
      y - size,
      size,
      size * 1.3
    );
  }


  // =======================================================
  // LATLNG → UTM (AKURAT UNTUK LUAS)
  // =======================================================
  private latLngToUTM(lat: number, lng: number) {
    const a = 6378137;
    const f = 1 / 298.257223563;
    const k0 = 0.9996;
    const e = Math.sqrt(f * (2 - f));

    const zone = Math.floor((lng + 180) / 6) + 1;
    const lon0 = ((zone - 1) * 6 - 180 + 3) * Math.PI / 180;

    const latRad = lat * Math.PI / 180;
    const lonRad = lng * Math.PI / 180;

    const N = a / Math.sqrt(1 - e * e * Math.sin(latRad) ** 2);
    const A = Math.cos(latRad) * (lonRad - lon0);

    const M =
      a *
      ((1 - e * e / 4) * latRad -
        (3 * e * e / 8) * Math.sin(2 * latRad));

    return {
      easting: k0 * N * A + 500000,
      northing: k0 * (M + N * Math.tan(latRad) * A * A / 2),
      zone
    };
  }



  // =======================================================
  // HITUNG LUAS & KELILING
  // =======================================================
  private calculateAreaAndPerimeter(latlngs: any[]) {
    const pts = latlngs.map(p => this.latLngToUTM(p.lat, p.lng));
    let area = 0;
    let perimeter = 0;

    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length;
      area += pts[i].easting * pts[j].northing -
        pts[j].easting * pts[i].northing;

      const dx = pts[j].easting - pts[i].easting;
      const dy = pts[j].northing - pts[i].northing;
      perimeter += Math.sqrt(dx * dx + dy * dy);
    }

    area = Math.abs(area) / 2;

    return {
      luasM2: area,
      luasHa: area / 10000,
      keliling: perimeter
    };
  }


// ================= DATA LAHAN =================
private drawLandInfo(pdf: any, x: number, y: number, info: any) {

  const w = 82;
  const h = 36;
  const r = 3;
  const pad = 6;

  pdf.setDrawColor(120);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(x, y, w, h, r, r);

  // Judul
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text('DATA LAHAN', x + w / 2, y + 7, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);

  const lineY = y + 14;
  const gap = 5;

  // Posisi kolom (INI KUNCI KERAPIAN)
  const labelX = x + pad;
  const colonX = x + pad + 32;   // posisi ":" tetap
  const valueX = x + pad + 36;   // posisi nilai

  const rows = [
    ['Jumlah Titik', info.titik],
    ['Keliling', `${info.keliling.toFixed(2)} m`],
    ['Luas', `${info.luasM2.toFixed(2)} m²`],
    ['Luas (Ha)', `${info.luasHa.toFixed(4)} ha`],
  ];

  rows.forEach((row, i) => {
    const yRow = lineY + gap * i;

    pdf.text(row[0], labelX, yRow);          // label
    pdf.text(':', colonX, yRow);              // titik dua
    pdf.text(String(row[1]), valueX, yRow);   // nilai
  });
}


  // ================= LEGENDA =================
  private drawLegendPremium(pdf: any, x: number, y: number) {

    const w = 82;
    const h = 36;
    const r = 3;
    const pad = 6;

    pdf.setDrawColor(120);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(x, y, w, h, r, r);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text('LEGENDA', x + w / 2, y + 7, { align: 'center' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);

    // Polygon
    pdf.setDrawColor(0, 116, 217);
    pdf.setLineWidth(0.7);
    pdf.line(x + pad, y + 14, x + pad + 12, y + 14);
    pdf.text('Batas Lahan', x + pad + 16, y + 15);

    // Titik
    pdf.setFillColor(34, 139, 34);
    pdf.circle(x + pad + 6, y + 22, 1.6, 'F');
    pdf.text('Titik Koordinat', x + pad + 16, y + 23);
  }



  // =======================================================
  // EXPORT PDF FINAL (CENTER MAP + CLEAN LAYOUT ARCGIS)
  // =======================================================
  async exportPDF() {
    if (!this.polygonLayer || this.markers.length < 3) {
      this.showToast('Belum ada polygon', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Membuat PDF...' });
    await loading.present();

    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;

      // ================= HEADER =================
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('LAPORAN PENGUKURAN LAHAN', pageWidth / 2, 14, { align: 'center' });

      pdf.setFontSize(10);
      pdf.text(
        `Tanggal: ${new Date().toLocaleString()}`,
        pageWidth / 2,
        20,
        { align: 'center' }
      );

      // ================= DATA =================
      const latlngs = this.markers.map(m => m.getLatLng());
      const stats = this.calculateAreaAndPerimeter(latlngs);

      let minLat = Infinity, maxLat = -Infinity;
      let minLng = Infinity, maxLng = -Infinity;

      latlngs.forEach(p => {
        minLat = Math.min(minLat, p.lat);
        maxLat = Math.max(maxLat, p.lat);
        minLng = Math.min(minLng, p.lng);
        maxLng = Math.max(maxLng, p.lng);
      });

      // ================= MAP LAYOUT =================
      const startY = 36;          // ruang lebih lega dari header
      const mapHeight = 128;      // peta lebih tinggi (ruang bawah cukup)
      const maxMapWidth = pageWidth - margin * 2 - 12; // breathing space kiri–kanan

      const scale = Math.min(
        maxMapWidth / (maxLng - minLng),
        mapHeight / (maxLat - minLat)
      );

      const mapWidth = (maxLng - minLng) * scale;
      const startX = (pageWidth - mapWidth) / 2; // CENTER MAP (ArcGIS-style)

      const toPdfPoint = (lat: number, lng: number) => ({
        x: startX + (lng - minLng) * scale,
        y: startY + mapHeight - (lat - minLat) * scale
      });


      // ================= POLYGON =================
      pdf.setDrawColor(0, 116, 217);
      pdf.setLineWidth(0.7);

      latlngs.forEach((p, i) => {
        const pt = toPdfPoint(p.lat, p.lng);
        i === 0 ? pdf.moveTo(pt.x, pt.y) : pdf.lineTo(pt.x, pt.y);
      });

      const first = toPdfPoint(latlngs[0].lat, latlngs[0].lng);
      pdf.lineTo(first.x, first.y);
      pdf.stroke();

      // ================= POINTS =================
      pdf.setFillColor(34, 139, 34);
      latlngs.forEach(p => {
        const pt = toPdfPoint(p.lat, p.lng);
        pdf.circle(pt.x, pt.y, 1.6, 'F');
      });

      // ================= MAP FRAME / NEATLINE (ARC-GIS STYLE) =================
      const frameInset = 1.5; // mm → halus, profesional

      pdf.setDrawColor(80);   // abu-abu gelap (bukan hitam pekat)
      pdf.setLineWidth(0.3);  // ⬅️ TIPIS (standar GIS)

      pdf.rect(
        startX - frameInset,
        startY - frameInset,
        mapWidth + frameInset * 2,
        mapHeight + frameInset * 2
      );


      // ================= SCALE =================
      const widthMeter = this.map.distance(
        L.latLng(minLat, minLng),
        L.latLng(minLat, maxLng)
      );
      const scaleRatio = widthMeter < 80 ? 500 : 1000;

      // ================= FOOTER ELEMENTS =================
      const footerY = startY + mapHeight + 26;

      const scaleBarWidth = 50; // 5 cm = 50 mm
      const scaleX = (pageWidth - scaleBarWidth) / 2;

      this.drawScaleBar(pdf, scaleX, footerY, scaleRatio);


      // LEGENDA KIRI
      this.drawLegendPremium(pdf, margin, footerY + 18);

      // DATA LAHAN KANAN
      this.drawLandInfo(pdf, margin + 92, footerY + 18, {
        titik: latlngs.length,
        luasM2: stats.luasM2,
        luasHa: stats.luasHa,
        keliling: stats.keliling
      });


      // ================= NORTH ARROW =================
      await this.drawNorthArrow(
        pdf,
        margin + 57, // ⬅️ posisi di kanan scale bar
        footerY + 6, // ⬅️ sejajar dengan scale
        10           // ⬅️ ukuran kecil
      );


      pdf.save(`Laporan_Lahan_${Date.now()}.pdf`);

    } catch (e) {
      console.error(e);
      this.showToast('Gagal export PDF', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  // =======================================================
  // TOAST
  // =======================================================
  private async showToast(msg: string, color: any = 'primary') {
    const t = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color,
      position: 'top'
    });
    await t.present();
  }

}