import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ContextStore } from '../../store/context.store';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss']
})
export class SettingsPage {
  constructor(public ctx: ContextStore) {}

  get Object() { return Object; }
}


