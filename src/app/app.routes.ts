import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [

  // Splash sebagai entry point
  {
    path: '',
    loadComponent: () =>
      import('./pages/splash/splash.page').then(m => m.SplashPage)
  },

  // ⬇️ AUTO REDIRECT DARI SPLASH KE HOME
  {
    path: 'start',
    redirectTo: 'tabs/home',
    pathMatch: 'full'
  },

  // Login & Register
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.page').then(m => m.RegisterPage)
  },

  // Forgot Password
  {
    path: 'forgot',
    loadComponent: () =>
      import('./pages/forgot/forgot.page').then(m => m.ForgotPage)
  },

  // VERIFY EMAIL
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./pages/verify-email/verify-email.page').then(m => m.VerifyEmailPage)
  },

  // RESET PASSWORD
  {
    path: 'reset-password/:token',
    loadComponent: () =>
      import('./pages/reset-password/reset-password.page').then(m => m.ResetPasswordPage)
  },

  // Tabs + children
  {
    path: 'tabs',
    // ❌ sementara MATIKAN guard
    // canActivate: [AuthGuard],
    loadComponent: () =>
      import('./tabs/tabs.page').then(m => m.TabsPage),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () =>
          import('./tabs/home/home.page').then(m => m.HomePage)
      },
      {
        path: 'hama',
        loadComponent: () =>
          import('./tabs/hama/hama.page').then(m => m.HamaPage)
      },
      {
        path: 'gps',
        loadComponent: () =>
          import('./tabs/gps/gps.page').then(m => m.GpsPage)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./tabs/profile/profile.page').then(m => m.ProfilePage)
      }
    ]
  },

  // Catatan Hama
  {
    path: 'catatan-hama',
    // canActivate: [AuthGuard],
    loadComponent: () =>
      import('./catatan-hama/catatan-hama.page').then(m => m.CatatanHamaPage)
  },

  {
    path: 'statistik',
    // canActivate: [AuthGuard],
    loadComponent: () =>
      import('./statistik/statistik.page').then(m => m.StatistikPage)
  },

  // Fallback → langsung ke home
  {
    path: '**',
    redirectTo: 'tabs/home',
    pathMatch: 'full'
  }
];
