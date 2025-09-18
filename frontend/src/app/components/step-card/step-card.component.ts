import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { StepResult } from '../../services/flow-runner.service';
import { toCurl } from '../../shared/utils/curl';

@Component({
  selector: 'app-step-card',
  standalone: true,
  imports: [CommonModule, IonicModule, NgIf],
  templateUrl: './step-card.component.html',
  styleUrls: ['./step-card.component.scss']
})
export class StepCardComponent {
  @Input() title = '';
  @Input() method = 'POST';
  @Input() path = '/';
  @Input() role: 'admin' | 'oracle' | 'reinsurer' | 'contributor' | 'beneficiary' = 'admin';
  @Input() payloadTemplate = '';
  @Input() running = false;
  @Input() result?: StepResult;
  @Output() execute = new EventEmitter<any>();

  onExecute() {
    try {
      const body = this.payloadTemplate?.trim() ? JSON.parse(this.payloadTemplate) : undefined;
      this.execute.emit(body);
    } catch (e) {
      alert('JSON inválido no payload');
    }
  }

  copy(text: string) { navigator.clipboard.writeText(text); }

  stringify(v: any) { try { return JSON.stringify(v, null, 2); } catch { return String(v); } }

  get curl(): string {
    if (!this.result) return '';
    return toCurl(this.result.request);
  }
}


