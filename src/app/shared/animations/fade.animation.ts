import { trigger, transition, style, animate } from '@angular/animations';

export const fadeAnimation = trigger('fadeAnimation', [
  transition(':enter', [
    style({ opacity: 0 }),
    // Reduzindo o tempo de 0.6s para 0.2s (1/3 do tempo original)
    animate('0.2s ease-in-out', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    // Também reduzindo o tempo de saída para manter consistência
    animate('0.2s ease-in-out', style({ opacity: 0 }))
  ])
]);