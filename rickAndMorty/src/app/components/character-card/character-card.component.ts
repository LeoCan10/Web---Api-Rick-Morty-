import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-character-card',
  standalone: true,
  templateUrl: './character-card.component.html',
  styleUrls: ['../../pages/characters/characters.component.css'],
  imports: [RouterLink]
})
export class CharacterCardComponent {
  @Input() character: any;
}
