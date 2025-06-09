import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrmRoutingModule } from './crm-routing.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatChipsModule } from '@angular/material/chips';

import { CrmDashboardComponent } from './components/crm-dashboard/crm-dashboard.component';
import { PipelineViewComponent } from './components/pipeline-view/pipeline-view.component';
import { LeadDetailComponent } from './components/lead-detail/lead-detail.component';
import { ReminderFormComponent } from './components/reminder-form/reminder-form.component';
import { CrmReportsComponent } from './components/crm-reports/crm-reports.component';
import { TagManagerComponent } from './components/tag-manager/tag-manager.component';

@NgModule({
  imports: [
    CommonModule,
    CrmRoutingModule,
    NgxChartsModule,
    MatChipsModule,
    // These components are imported as they are standalone
    CrmDashboardComponent,
    PipelineViewComponent,
    LeadDetailComponent,
    ReminderFormComponent,
    CrmReportsComponent,
    TagManagerComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CrmModule { }