import { Component, Input } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [NgFor],
  template: `
    <div class="skeleton-container">
      <div *ngFor="let item of skeletonArray" class="skeleton-item">
        <div class="skeleton-line skeleton-title"></div>
        <div class="skeleton-line skeleton-text"></div>
        <div class="skeleton-line skeleton-text short"></div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-container {
      padding: 16px;
    }
    
    .skeleton-item {
      margin-bottom: 20px;
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: #fff;
    }
    
    .skeleton-line {
      height: 16px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 4px;
      margin-bottom: 8px;
    }
    
    .skeleton-title {
      height: 20px;
      width: 60%;
    }
    
    .skeleton-text {
      width: 100%;
    }
    
    .skeleton-text.short {
      width: 40%;
      margin-bottom: 0;
    }
    
    @keyframes loading {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `]
})
export class SkeletonLoaderComponent {
  @Input() itemCount: number = 5;
  
  get skeletonArray(): number[] {
    return Array(this.itemCount).fill(0).map((_, i) => i);
  }
}
