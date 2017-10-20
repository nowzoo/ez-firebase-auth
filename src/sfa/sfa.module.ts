import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SfaService } from './sfa.service';

export  *  from './sfa';
export { SfaService } from './sfa.service';

@NgModule({
  imports: [
    CommonModule,
  ],
  providers: [
    SfaService
  ],
  declarations: []
})
export class SfaModule { }
