import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SettingsRoutingModule } from './settings-routing.module';
// SettingsPage is standalone; no declaration

@NgModule({
  imports: [CommonModule, IonicModule, FormsModule, SettingsRoutingModule],
  declarations: []
})
export class SettingsPageModule {}


