import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SimpleFirebaseAuthService } from './simple-firebase-auth.service';
@NgModule({
  imports: [
    CommonModule,
  ],
  providers: [
    SimpleFirebaseAuthService
  ],
  declarations: []
})
export class SimpleFirebaseAuthModule { }
