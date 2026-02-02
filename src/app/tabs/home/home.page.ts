import { Component, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Subscription } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, HttpClientModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnDestroy {

  weather: any = null;
  temp = 0;
  weatherDescription = '';

  isClear = false;
  isCloudy = false;
  isRain = false;
  isStorm = false;

  farmingAdvice = 'Memuat saran pertanian...';

  username = 'Pengguna';
  defaultAvatar = 'https://yusra.perangkatlunak.my.id/backend/uploads/default.png';
  userAvatarUrl = this.defaultAvatar;

  avatarSub?: Subscription;

  icons = {
    hama: 'bug-outline',
    gps: 'map-outline',
    stat: 'stats-chart-outline',
    note: 'document-text-outline'
  };

  private API_KEY = '8ce453cebcf9ff2f227ad8c1a80279b1';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private profileService: ProfileService
  ) {
    // Global listener jika avatar diperbarui di ProfileService
    window.addEventListener('avatarUpdated', () => this.loadAvatar());
  }

async ionViewWillEnter(): Promise<void> {
  const user = await this.authService.getUser();

  // 🔧 DEBUG MODE: JANGAN REDIRECT KE LOGIN
  if (!user) {
    console.warn('DEBUG: user kosong, tapi tidak redirect ke login');
    this.username = 'Pengguna';
  } else {
    this.username = user.name || 'Pengguna';
  }


    this.username = user.name || 'Pengguna';

    // ===== AVATAR =====
    this.loadAvatar();

    // Subscribe perubahan avatar berikutnya
    this.avatarSub?.unsubscribe();
    this.avatarSub = this.profileService.profileImage$.subscribe(url => {
      this.userAvatarUrl = url
        ? url.startsWith('http') ? url : this.getFullAvatarUrl(url)
        : this.defaultAvatar;
    });

    // ===== WEATHER =====
    this.getWeather();
  }

  ngOnDestroy() {
    this.avatarSub?.unsubscribe();
  }

  // ============================================================
  // LOAD AVATAR
  // ============================================================
  async loadAvatar() {
    const user = await this.authService.getUser();
    if (!user) return;

    // Prioritas: avatar terakhir di ProfileService
    let avatar = this.profileService.getCurrentAvatar();

    // Kalau tidak ada, ambil dari user.avatar di storage
    if (!avatar && user.avatar) avatar = this.getFullAvatarUrl(user.avatar);

    // Jika tetap kosong, pakai default
    this.userAvatarUrl = avatar || this.defaultAvatar;
  }

  getFullAvatarUrl(avatarPath?: string): string {
    if (!avatarPath) return this.defaultAvatar;

    if (avatarPath.startsWith('http') || avatarPath.startsWith('data:')) return avatarPath;

    const path = avatarPath.startsWith('/') ? avatarPath.slice(1) : avatarPath;
    return `https://yusra.perangkatlunak.my.id/backend/${path}?t=${Date.now()}`;
  }

  setHomeAvatarDefault() {
    this.userAvatarUrl = this.defaultAvatar;
  }

  // ============================================================
  // WEATHER
  // ============================================================
  getWeather() {
    if (!navigator.geolocation) {
      this.farmingAdvice = 'GPS tidak tersedia.';
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&units=metric&lang=id&appid=${this.API_KEY}`;
        this.http.get(url).subscribe({
          next: (data: any) => {
            this.weather = data;
            this.temp = data.main?.temp || 0;
            this.weatherDescription = data.weather?.[0]?.description || '';

            this.setWeatherStatus(data.weather?.[0]?.main || '');
            this.setFarmingAdvice(data.weather?.[0]?.main || '');
          },
          error: () => {
            this.farmingAdvice = 'Tidak dapat memuat cuaca.';
          }
        });
      },
      () => {
        this.farmingAdvice = 'GPS tidak aktif.';
      }
    );
  }

  setWeatherStatus(main: string) {
    const m = (main || '').toLowerCase();
    this.isClear = this.isCloudy = this.isRain = this.isStorm = false;

    if (m.includes('rain') || m.includes('drizzle')) this.isRain = true;
    else if (m.includes('cloud')) this.isCloudy = true;
    else if (m.includes('clear')) this.isClear = true;
    else if (m.includes('storm') || m.includes('thunder')) this.isStorm = true;
    else this.isCloudy = true;
  }

  setFarmingAdvice(condition: string) {
    switch ((condition || '').toLowerCase()) {
      case 'rain':
      case 'drizzle':
        this.farmingAdvice = '🌧 Hindari penyemprotan pestisida.';
        break;
      case 'clouds':
        this.farmingAdvice = '⛅ Cuaca berawan, cocok untuk aktivitas lahan.';
        break;
      case 'clear':
        this.farmingAdvice = '☀️ Cuaca cerah, waktu terbaik penyemprotan.';
        break;
      case 'storm':
        this.farmingAdvice = '⚡ Cuaca ekstrem! Hindari keluar.';
        break;
      default:
        this.farmingAdvice = '🌱 Cuaca normal.';
    }
  }

  toggleIcon(menu: 'hama' | 'gps' | 'stat' | 'note', hover: boolean) {
    if (!this.icons[menu]) return;
    if (hover) this.icons[menu] = this.icons[menu].replace('-outline', '');
    else if (!this.icons[menu].endsWith('-outline')) this.icons[menu] += '-outline';
  }

  goTo(page: string) {
    this.router.navigate([page]);
  }
}
