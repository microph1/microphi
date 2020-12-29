import { Component, Input, OnInit } from '@angular/core';

export interface Card {
  value: string;
  suit: string;
  side: 'back' | 'front';
}

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  @Input() card: Card;

  constructor() { }

  ngOnInit(): void {
  }

}
