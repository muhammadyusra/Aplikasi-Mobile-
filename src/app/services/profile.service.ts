import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private profileImageSource = new BehaviorSubject<string | null>(null);
  profileImage$ = this.profileImageSource.asObservable();

  // ✅ PAKAI DOMAIN ASLI
  private API = 'https://yusra.perangkatlunak.my.id/backend/api';
  private ASSET = 'https://yusra.perangkatlunak.my.id/backend/';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /* =========================
     GET PROFILE
     ========================= */
  getProfile(userId: number) {
    return this.http
      .get<any>(`${this.API}/profile?user_id=${userId}`)
      .pipe(
        map(res => {
          if (res?.success && res.user?.avatar) {

            // simpan path ke storage
            this.authService.updateAvatar(res.user.avatar);

            // kirim URL ke UI
            this.profileImageSource.next(
              this.buildAvatarUrl(res.user.avatar)
            );
          }
          return res;
        })
      );
  }

  /* =========================
     GET CURRENT AVATAR (PUBLIC)
     ========================= */
  getCurrentAvatar(): string | null {
    return this.profileImageSource.getValue();
  }

  /* =========================
     UPLOAD AVATAR
     ========================= */
  uploadAvatar(userId: number, file: File) {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.http
      .post<any>(
        `${this.API}/profile/avatar?user_id=${userId}`,
        formData
      )
      .pipe(
        map(res => {
          if (res?.success && res.avatar) {

            this.authService.updateAvatar(res.avatar);

            this.profileImageSource.next(
              this.buildAvatarUrl(res.avatar)
            );

            window.dispatchEvent(new Event('avatarUpdated'));
          }
          return res;
        })
      );
  }

  /* =========================
     URL BUILDER
     ========================= */
  private buildAvatarUrl(path: string): string {
    if (!path) return 'assets/default-avatar.png';

    if (path.startsWith('data:image')) return path;

    if (path.startsWith('http')) {
      return path + '?t=' + Date.now();
    }

    // path relatif dari backend
    return this.ASSET + path.replace(/^\/+/, '') + '?t=' + Date.now();
  }
}
