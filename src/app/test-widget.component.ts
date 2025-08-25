// Crie um novo arquivo: test-widget.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="position: fixed; bottom: 20px; right: 20px; 
                background-color: #007bff; color: white; 
                padding: 15px; border-radius: 10px; z-index: 9999;">
      Isso é um widget de teste!
    </div>
  `
})
export class TestWidgetComponent {}