import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CdkDropList } from '@angular/cdk/drag-drop';
import { Card } from '../card/card.component';


interface Player {
  name: string;
  hand: Card[];
  balance: number;
}

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  @Input() player: Player;
  @Input() connectedLists: CdkDropList[];

  @Output() bet = new EventEmitter<number>();

  constructor() { }

  ngOnInit(): void {
  }

  public onBet() {
    this.bet.next(10);
  }

}
