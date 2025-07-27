import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-character-card',
  standalone: true,
  templateUrl: './character-card.component.html',
  styleUrls: ['../../pages/characters/characters.component.css']
})
export class CharacterCardComponent {
  @Input() character: any;
}
