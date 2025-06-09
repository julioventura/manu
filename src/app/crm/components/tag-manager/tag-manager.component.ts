import { Component, OnInit, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../shared/material.module';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-tag-manager',
  templateUrl: './tag-manager.component.html',
  styleUrls: ['./tag-manager.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule, 
    FormsModule, 
    MaterialModule, 
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class TagManagerComponent implements OnInit {
  @Input() availableTags: string[] = [
    'VIP', 'Ortodontia', 'Implante', 'Alto Valor', 
    'Convênio', 'Retorno', 'Particular'
  ];
  
  @Input() selectedTags: string[] = [];
  @Output() tagsChanged = new EventEmitter<string[]>();
  
  newTag: string = '';
  
  constructor() { }
  
  ngOnInit(): void {
  }
  
  addTag(): void {
    if (this.newTag && !this.availableTags.includes(this.newTag)) {
      this.availableTags.push(this.newTag);
    }
    
    if (this.newTag && !this.selectedTags.includes(this.newTag)) {
      this.selectedTags.push(this.newTag);
      this.tagsChanged.emit(this.selectedTags);
    }
    
    this.newTag = '';
  }
  
  toggleTag(tag: string): void {
    const index = this.selectedTags.indexOf(tag);
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(tag);
    }
    this.tagsChanged.emit(this.selectedTags);
  }
}