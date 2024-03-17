import { Component, Hydrated } from '@flux/core';
import { animationFrameScheduler, BehaviorSubject, filter, map, scan, Subject, switchMap, takeWhile, tap, timer } from 'rxjs';
import template from './fx-metronome.component.html';
import { MDCSliderChangeEventDetail } from '@material/slider';


@Component({
  selector: 'fx-bpm',
  template,
})
export class FxMetronomeComponent {
  bpm: number = 77;
  min: number = 40;
  max: number = 300;

  @Hydrated('yes sir!')
  volume: number = 15;

  private osc;
  private _audioCtx: AudioContext = new AudioContext();
  private currentBeat: number = 0;

  private source$ = new Subject<number>();
  private playing$ = new BehaviorSubject<boolean>(false);

  private beat$ = this.source$.pipe(
    switchMap((bpm) => {
      const freq = 60 * 1000 / bpm;
      console.log('starting beating at', bpm);
      console.log('freq', freq);
      return timer(0, freq, animationFrameScheduler).pipe(
        tap(() => {
          this.beat();
        }),
        takeWhile(() => {
          return this.playing$.getValue();
        })
      );
    })
  );

  private tapTempo = new Subject<number>();

  private tapped$ = this.tapTempo.pipe(
    scan((acc, value, index) => {

      const delta = value - acc[1];

      if (delta >= (60 * 1000 / this.min)) {
        return [0, value];
      }

      return [acc[1], value];
    }, [0, 0]),

    map(([previous, current]) => {
      return current - previous;
    }),
    // tap(console.log),
    map((v) => {
      return Math.round(60 * 1000 / v);
    }),
    filter((bpm) => {
      return bpm >= this.min && bpm <= this.max;
    }),
    tap((bpm) => {
      this.bpm = bpm;
    }),
  );

  play() {
    this.source$.next(this.bpm);
    this.playing$.next(true);
    this.currentBeat = 0;
  }

  stop() {
    this.playing$.next(false);
  }

  faster() {
    if (this.bpm < this.max) {
      this.bpm++;
    }
    this.stop();
  }

  slower() {
    if (this.bpm > this.min) {
      this.bpm--;
    }
    this.stop();
  }

  scrolling($event: WheelEvent) {

    if ($event.deltaY > 0) {
      this.faster();
    } else {
      this.slower();
    }
  }

  click($event: MouseEvent) {
    // console.log($event.pageX, $event.pageY);
    // console.log('offset', $event.offsetX, $event.offsetY);
    // console.log('position', $event.pos)

    this.tapTempo.next(Date.now());

  }

  volumeChange($event) {
    this.volume = ($event.detail as MDCSliderChangeEventDetail).value;
    console.log('volume set to', this.volume);
  }

  tempoChange($event) {
    if (this.bpm < this.max) {
      this.bpm = $event.detail.value;
    }
    this.stop();
  }

  private beat() {
    const now = this._audioCtx.currentTime;

    this.osc = this._audioCtx.createOscillator();
    this.osc.type = 'triangle';
    const gainNode = this._audioCtx.createGain();
    this.osc.connect(gainNode);
    gainNode.connect(this._audioCtx.destination);
    gainNode.gain.value = this.volume / 100;
    gainNode.gain.linearRampToValueAtTime(0, now + 0.06);
    // this.osc.frequency.value = 432;

    if (this.currentBeat === 0) {
      this.osc.frequency.value = 659.25;
    } else {
      this.osc.frequency.value = 440;
    }

    this.osc.start(now);
    this.osc.stop(now + 0.3);

    this.currentBeat = (this.currentBeat + 1) % 4;

  }

}
