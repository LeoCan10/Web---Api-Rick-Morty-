import { Directive, ElementRef, HostListener, Renderer2, OnInit, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appPasswordStrength]'
})
export class PasswordStrengthDirective implements OnInit, AfterViewInit {

  private element: HTMLElement | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    // guardo referencia segura
    this.element = this.el?.nativeElement ?? null;
  }

  ngAfterViewInit(): void {
    // chequeo que el nodo exista antes de usarlo
    if (!this.element) {
      console.warn('PasswordStrengthDirective: no se encontró el elemento');
      return;
    }
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    if (!this.element) {
      return;
    }

    const input = event.target as HTMLInputElement;
    if (!input || typeof input.value !== 'string') {
      return;
    }

    const password = input.value;
    const strength = this.calculateStrength(password);

    // ejemplo: cambio el borde según la fuerza
    if (strength === 'weak') {
      this.renderer.setStyle(this.element, 'border', '2px solid red');
    } else if (strength === 'medium') {
      this.renderer.setStyle(this.element, 'border', '2px solid orange');
    } else {
      this.renderer.setStyle(this.element, 'border', '2px solid green');
    }
  }

  private calculateStrength(password: string): 'weak' | 'medium' | 'strong' {
    let score = 0;
    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[$@#&!]/.test(password)) score++;

    if (score <= 1) return 'weak';
    if (score === 2) return 'medium';
    return 'strong';
  }
}
