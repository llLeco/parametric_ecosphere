import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ContextStore, WalletRole } from '../../store/context.store';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss']
})
export class SettingsPage {
  roles: WalletRole[] = ['admin','oracle','beneficiary','contributor','reinsurer'];

  constructor(public readonly ctx: ContextStore) {}

  updateBaseUrl(v: string) { this.ctx.set('baseUrl', v); }
  updateWallet(role: WalletRole, v: string) { this.ctx.set('wallets', { ...this.ctx.snapshot.wallets, [role]: v }); }
  clearTimeline() { this.ctx.clearTimeline(); }
}


