import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'inicial' | 'futurista';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private currentTheme: Theme = 'inicial';
  public activeTheme$: BehaviorSubject<Theme> = new BehaviorSubject<Theme>(this.currentTheme);

  private readonly themes: { name: Theme, label: string }[] = [
    { name: 'inicial', label: 'Padrão' },
    { name: 'futurista', label: 'Futurista' }
  ];

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.loadTheme();
  }

  private loadTheme() {
    const savedTheme = localStorage.getItem('selected-theme') as Theme;
    if (savedTheme && this.themes.some(t => t.name === savedTheme)) {
      this.setTheme(savedTheme);
    } else {
      this.applyTheme(this.currentTheme); // Aplica o tema padrão se nada for salvo
    }
  }

  private applyTheme(theme: Theme): void {
    const oldTheme = this.currentTheme;
    this.renderer.removeClass(document.body, `theme-${oldTheme}`);
    this.renderer.addClass(document.body, `theme-${theme}`);
    this.currentTheme = theme;
    this.activeTheme$.next(theme);
    localStorage.setItem('selected-theme', theme);
  }

  setTheme(theme: Theme): void {
    this.applyTheme(theme);
  }

  getThemes(): { name: Theme, label: string }[] {
    return this.themes;
  }

  getCurrentTheme(): Theme {
    return this.currentTheme;
  }
}
