import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FlowRunnerPage } from './flow-runner.page';

const routes: Routes = [
  { path: '', component: FlowRunnerPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FlowRunnerRoutingModule {}


