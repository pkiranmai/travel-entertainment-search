
import { NgModule, NgZone } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { AppComponent} from './app.component';
import { MyFormComponent} from './my-form/my-form.component';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';

import { NgBootstrapFormValidationModule } from 'ng-bootstrap-form-validation';
import { AllService } from './all.service';
import {MatDialog, MatDialogRef, MatDialogModule } from '@angular/material';


@NgModule({
  declarations: [
    AppComponent,
    MyFormComponent
  ],
  imports: [
    BrowserModule, 
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    NgBootstrapFormValidationModule.forRoot(),
    HttpClientModule,
    MatDialogModule
  ],
  providers: [AllService],
  bootstrap: [AppComponent],
  entryComponents: [AppComponent],
})
export class AppModule { }
