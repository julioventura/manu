import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BackupService {

  constructor() { }

  backupAllData(): Observable<number> {
    // Simulate a backup process that takes 5 seconds
    const totalSteps = 100;
    const duration = 5000; // 5 seconds

    return timer(0, duration / totalSteps).pipe(
      take(totalSteps + 1),
      map(step => Math.round((step / totalSteps) * 100))
    );
  }
}
