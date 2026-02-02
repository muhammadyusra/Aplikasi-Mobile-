import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard {

  constructor(private router: Router) {}

  canActivate(): boolean {
    // 🔧 MATIKAN SEMUA REDIRECT
    return true;
  }
}

