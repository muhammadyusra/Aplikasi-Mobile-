import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private USER_KEY = 'userData';
  private BASE_URL = 'https://yusra.perangkatlunak.my.id/backend/index.php';

  constructor(private http: HttpClient) {}

  /* ================= LOGIN ================= */
  async login(email: string, password: string) {
    const res: any = await firstValueFrom(
      this.http.post(`${this.BASE_URL}/api/auth/login`, { email, password })
    );

    if (res?.success && res.user) {
      await this.saveUser(res.user);
    }

    return res;
  }

  /* ================= STORAGE ================= */
  async saveUser(user: any) {
    const value = JSON.stringify(user);

    if (Capacitor.isNativePlatform()) {
      await Preferences.set({ key: this.USER_KEY, value });
    } else {
      localStorage.setItem(this.USER_KEY, value);
    }
  }

  async getUser() {
    let value: string | null;

    if (Capacitor.isNativePlatform()) {
      value = (await Preferences.get({ key: this.USER_KEY })).value;
    } else {
      value = localStorage.getItem(this.USER_KEY);
    }

    return value ? JSON.parse(value) : null;
  }

  /* ================= UPDATE AVATAR (PATH ONLY) ================= */
  async updateAvatar(avatarPath: string) {
    const user = await this.getUser();
    if (!user) return;

    user.avatar = avatarPath;
    await this.saveUser(user);
  }

  async removeUser() {
    if (Capacitor.isNativePlatform()) {
      await Preferences.remove({ key: this.USER_KEY });
    } else {
      localStorage.removeItem(this.USER_KEY);
    }
  }
}
