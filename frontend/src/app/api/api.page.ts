import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ApiService, ApiEndpoint } from '../services/api.service';

@Component({
  selector: 'app-api',
  templateUrl: './api.page.html',
  styleUrls: ['./api.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class ApiPage implements OnInit {
  endpoints: { [key: string]: ApiEndpoint[] } = {};
  selectedModule: string = '';
  selectedEndpoint: ApiEndpoint | null = null;
  response: any = null;
  loading: boolean = false;
  error: string = '';
  walletStatus: { isConnected: boolean; walletId: string | null } = { isConnected: false, walletId: null };
  walletIdInput: string = '';

  // Expose Object to template
  Object = Object;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.endpoints = this.apiService.getAllEndpoints();
    this.selectedModule = Object.keys(this.endpoints)[0];
    this.updateWalletStatus();
  }

  selectModule(module: string | number) {
    this.selectedModule = String(module);
    this.selectedEndpoint = null;
    this.response = null;
    this.error = '';
  }

  selectEndpoint(endpoint: ApiEndpoint) {
    this.selectedEndpoint = endpoint;
    this.response = null;
    this.error = '';
  }

  async callEndpoint() {
    if (!this.selectedEndpoint) return;

    this.loading = true;
    this.error = '';
    this.response = null;

    try {
      this.response = await this.apiService.callEndpoint(this.selectedEndpoint).toPromise();
    } catch (error: any) {
      this.error = error.message || 'An error occurred while calling the endpoint';
    } finally {
      this.loading = false;
    }
  }

  getMethodColor(method: string): string {
    switch (method) {
      case 'GET': return 'success';
      case 'POST': return 'primary';
      case 'PUT': return 'warning';
      case 'DELETE': return 'danger';
      case 'PATCH': return 'secondary';
      default: return 'medium';
    }
  }

  formatJson(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log('Copied to clipboard');
    });
  }

  getTotalEndpoints(): number {
    return Object.values(this.endpoints).reduce((total, moduleEndpoints) => total + moduleEndpoints.length, 0);
  }

  updateWalletStatus() {
    this.walletStatus = this.apiService.getWalletStatus();
  }

  setWalletId() {
    if (this.walletIdInput.trim()) {
      this.apiService.setWalletId(this.walletIdInput.trim());
      this.updateWalletStatus();
      this.walletIdInput = '';
    }
  }

  clearWalletId() {
    localStorage.removeItem('wallet_id');
    localStorage.removeItem('current_wallet');
    sessionStorage.removeItem('wallet_id');
    this.updateWalletStatus();
  }
}
