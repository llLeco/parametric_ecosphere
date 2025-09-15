import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { FlowRunnerRoutingModule } from './flow-runner-routing.module';
// FlowRunnerPage is standalone; no declaration
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [CommonModule, IonicModule, FormsModule, FlowRunnerRoutingModule, ComponentsModule],
  declarations: []
})
export class FlowRunnerPageModule {}


