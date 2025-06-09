import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../shared/material.module';
import { SharedModule } from '../shared/shared.module';
import { GroupSharingComponent } from '../shared/components/group/group-sharing.component';

// ViewComponent is declared in AppModule, so we don't include it here
// Import only what we need for additional features

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MaterialModule,
    SharedModule,
    // Include standalone components used in ViewComponent's template
    GroupSharingComponent
  ],
  // Don't export ViewComponent as it's in AppModule
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ViewModule { }