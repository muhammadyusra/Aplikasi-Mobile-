import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

// Import komponen Ionic Standalone satu per satu
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonIcon
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-tabs',
  standalone: true,
  templateUrl: './tabs.page.html',
  imports: [
    RouterModule,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonLabel,
    IonIcon
  ],
})
export class TabsPage {}
