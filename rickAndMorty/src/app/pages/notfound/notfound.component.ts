import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'error-404',
  imports: [RouterLink],
  styleUrls: ['notfound.component.css'],
  templateUrl: 'notfound.component.html',
})
export class NotFoundComponent { }
