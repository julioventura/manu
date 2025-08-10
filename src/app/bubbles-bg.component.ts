import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-bubbles-bg',
  template: '',
})
export class BubblesBgComponent implements OnInit {
  private bubbleCount = 18;
  private colors = [
    'rgba(255,255,255,0.12)',
    'rgba(173,216,230,0.09)',
    'rgba(135,206,250,0.11)',
    'rgba(176,224,230,0.10)',
    'rgba(240,248,255,0.075)'
  ];

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    for (let i = 0; i < this.bubbleCount; i++) {
      const bubble = this.renderer.createElement('div');
      this.renderer.addClass(bubble, 'bubble-bg-anim');
      const size = Math.random() * 80 + 40;
      this.renderer.setStyle(bubble, 'width', `${size}px`);
      this.renderer.setStyle(bubble, 'height', `${size}px`);
      this.renderer.setStyle(bubble, 'left', `${Math.random() * 100}%`);
      this.renderer.setStyle(bubble, 'top', `${Math.random() * 100}%`);
      this.renderer.setStyle(bubble, 'background', this.colors[Math.floor(Math.random() * this.colors.length)]);
      this.renderer.setStyle(bubble, 'position', 'absolute');
      this.renderer.setStyle(bubble, 'border-radius', '50%');
      this.renderer.setStyle(bubble, 'pointer-events', 'none');
      this.renderer.setStyle(bubble, 'z-index', '1');
      this.renderer.setStyle(bubble, 'filter', 'blur(0.5px)');
      // Animation com tamanho, direção e velocidade aleatórias
      const duration = Math.random() * 18 + 12;
      const delay = Math.random() * 10;
      // Gera valores aleatórios para escala, direção e rotação
      const scaleTo = 0.7 + Math.random() * 1.2;
      const xTo = (Math.random() - 0.5) * 400;
      const yTo = -100 - Math.random() * 300;
      const rotTo = (Math.random() - 0.5) * 40;
      const keyframes = `@keyframes bubbleMove${i} {
        0% { transform: translateY(0) translateX(0) scale(1) rotate(0deg); }
        100% { transform: translateY(${yTo}px) translateX(${xTo}px) scale(${scaleTo}) rotate(${rotTo}deg); }
      }`;
      // Adiciona keyframes únicos ao head
      const styleSheet = document.createElement('style');
      styleSheet.innerHTML = keyframes;
      document.head.appendChild(styleSheet);
      this.renderer.setStyle(bubble, 'animation', `bubbleMove${i} ${duration}s ease-in-out ${delay}s infinite alternate`);
      this.renderer.appendChild(this.el.nativeElement, bubble);
    }
  }
}
