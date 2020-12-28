import { Component, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';


function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

@Component({
  selector: 'app-gundb',
  templateUrl: './gundb.component.html',
  styleUrls: ['./gundb.component.scss']
})
export class CardsComponent implements OnInit {

  data$ = new ReplaySubject();
  item: string;

  cards = [
    'a',
    // '1',
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

  deck = [];

  alice = [];
  bob = [];

  table = [];

  constructor() {
    this.suits.forEach((suit) => {

      this.cards.forEach((card) => {

        this.deck.push([card, suit]);
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
      player.push(stack.pop());
    }


  }
}
