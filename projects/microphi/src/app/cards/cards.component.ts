import { Component, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Card } from './card/card.component';


function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit {

  data$ = new ReplaySubject();
  item: string;

  cards = [
    'a',
    // '2',
    // '3',
    // '4',
    // '5',
    // '6',
    // '7',
    // '8',
    '9',
    '10',
    'j',
    'q',
    'k',
  ];

  suits = ['♥', '♦', '♣', '♠'];

  deck: Card[] = [];

  alice = { hand: [], balance: 500 };
  bob = { hand: [], balance: 500 };

  table = [];
  stash = [];
  pot = 0;

  constructor() {
    this.suits.forEach((suit) => {

      this.cards.forEach((card) => {

        this.deck.push({
          value: card,
          suit,
          side: 'back',
        });
      });
    });
  }

  ngOnInit(): void {

  }

  addItem(item) {
  }

  cut(deck) {

    const cutpoint = getRandomInt(deck.length);

    return [...deck.slice(cutpoint), ...deck.slice(0, cutpoint)];

  }

  shuffle(deck) {
    const left = deck.slice(0, Math.floor(deck.length / 2));
    console.log('left', left);

    const right = deck.slice(Math.floor(deck.length / 2));
    console.log('right', right);

    const shuffled = [];

    while (left.length > 0 || right.length > 0) {

      const leftDrop = getRandomInt(4);
      // console.log('will drop', leftDrop, 'cards');
      for (let i = 0; i < leftDrop; i++) {
        const dropped = left.pop();
        if (dropped) {
          shuffled.push(dropped);
        }

      }

      const rightDrop = getRandomInt(4);
      // console.log('will drop', rightDrop, 'cards');
      for (let i = 0; i < rightDrop; i++) {
        const dropped = right.pop();
        if (dropped) {
          shuffled.push(dropped);
        }

      }

      // console.log('shuffled so far', shuffled);
    }


    return shuffled;

  }

  serve(stack, players) {

    for (const player of players) {
      // console.log(player, stack.pop());
      player.hand.push(stack.pop());
    }


  }

  drop(event: CdkDragDrop<any[], any>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {


      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.container.data.length
      );
    }
  }

  bet(alice: { balance: number; hand: any[] }) {
    alice.balance -= 10;
    this.pot += 10;
  }
}
