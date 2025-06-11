import { NgModule } from '@angular/core';

// Imports Material necessários
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';

// ADICIONAR outros módulos comuns que podem ser necessários:
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

const MATERIAL_MODULES = [
  // Básicos
  MatButtonModule,
  MatCardModule,
  MatIconModule,
  MatListModule,
  MatDividerModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatToolbarModule,
  
  // Formulários
  MatInputModule,
  MatFormFieldModule,
  MatSelectModule,
  MatCheckboxModule,
  MatRadioModule,
  MatDatepickerModule,
  MatNativeDateModule,
  
  // Navegação e Layout
  MatSidenavModule,
  MatMenuModule,
  MatTabsModule,
  MatExpansionModule,
  
  // Dados
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  
  // Feedback
  MatDialogModule,
  MatSnackBarModule,
  MatTooltipModule,
  MatSlideToggleModule
];

@NgModule({
  imports: MATERIAL_MODULES,
  exports: MATERIAL_MODULES,
})
export class MaterialModule { }