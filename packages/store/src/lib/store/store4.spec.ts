import { Brand } from 'utility-types';
import { Observable } from 'rxjs';

type StateManager<T, Act> = {

}

type action<T> = Brand<T, 'action'>;

interface State {
  paused: boolean;
  currentTime: number;
  total: number;
}

describe('yet another implemetation', () => {

  class PlayingState {

    onPlay(state: State) {
      return { ...state, paused: false };
    }
  }








});