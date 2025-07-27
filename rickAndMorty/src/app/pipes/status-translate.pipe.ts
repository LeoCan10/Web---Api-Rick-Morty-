import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusTranslate',
  standalone: true
})
export class StatusTranslatePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    const translations: { [key: string]: string } = {
      'alive': 'vivo',
      'dead': 'muerto',
      'unknown': 'desconocido'
    };

    return translations[value.toLowerCase()] || value;
  }
}
