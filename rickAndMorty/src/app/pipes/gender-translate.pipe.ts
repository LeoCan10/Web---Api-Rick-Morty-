import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'genderTranslate',
  standalone: true
})
export class GenderTranslatePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    const translations: { [key: string]: string } = {
      'male': 'masculino',
      'female': 'femenino',
      'genderless': 'sin género',
      'unknown': 'desconocido'
    };

    return translations[value.toLowerCase()] || value;
  }
}
