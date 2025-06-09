import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../shared/material.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EditModule { }