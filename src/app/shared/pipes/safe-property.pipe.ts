import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'safeProperty',
  standalone: true
})
export class SafePropertyPipe implements PipeTransform {
  transform(value: unknown, defaultValue: string = ''): string {
    if (value === null || value === undefined) {
      return defaultValue;
    }
    
    if (typeof value === 'string') {
      return value;
    }
    
    if (typeof value === 'number' || typeof value === 'boolean') {
      return value.toString();
    }
    
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return defaultValue;
      }
    }
    
    return String(value) || defaultValue;
  }
}