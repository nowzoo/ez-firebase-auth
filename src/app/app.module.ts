import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { EzfaModule } from '../ezfa';
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    EzfaModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
