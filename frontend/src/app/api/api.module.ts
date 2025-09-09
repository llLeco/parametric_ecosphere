import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ApiPage } from './api.page';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: ApiPage
      }
    ])
  ]
})
export class ApiModule {}
