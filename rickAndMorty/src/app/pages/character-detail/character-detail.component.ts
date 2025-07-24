import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-character-detail',
  imports: [],
  templateUrl: './character-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterDetailComponent { }
