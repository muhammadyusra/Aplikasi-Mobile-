import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// Swiper
import { register } from 'swiper/element/bundle';
register();

// Ionic PWA Elements
import { defineCustomElements } from '@ionic/pwa-elements/loader';
defineCustomElements(window);

// ==== Ionicons Fix ====
import { addIcons } from 'ionicons';
import {
  personOutline,
  mailOutline,
  callOutline,
  logOutOutline,
  pencilOutline,

  calendarOutline,
  statsChartOutline,
  documentTextOutline,
  bugOutline,
  mapOutline,
} from 'ionicons/icons';

addIcons({
  // profile menu
  'person-outline': personOutline,
  'mail-outline': mailOutline,
  'call-outline': callOutline,
  'log-out-outline': logOutOutline,
  'pencil-outline': pencilOutline,

  // needed in pages
  'calendar-outline': calendarOutline,
  'stats-chart-outline': statsChartOutline,
  'document-text-outline': documentTextOutline,
  'bug-outline': bugOutline,
  'map-outline': mapOutline,
});

// ===== Bootstrap Angular & Ionic =====
bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    importProvidersFrom(HttpClientModule),
  ],
});
