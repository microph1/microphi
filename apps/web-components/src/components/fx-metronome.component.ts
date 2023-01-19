import { Component } from '@flux/core';

@Component({
  selector: 'fx-bpm',
  template: `
    <div>

      <h2>BPM: {{bpm}}</h2>
      <button (click)="play()">play</button>
    </div>
  `
})
export class FxMetronomeComponent {
  bpm: number = 60;

  private _audioCtx: AudioContext = new AudioContext();
  private currentBeat: number;

  play() {
    console.log('start at', this.bpm);


    this.beat();
  }


  private beat() {
    const now = this._audioCtx.currentTime;
    const osc = this._audioCtx.createOscillator();
    osc.type = 'triangle';
    if (this.currentBeat === 0) {
      osc.frequency.value = 864;
    } else {
      osc.frequency.value = 432;
    }

    const gainNode = this._audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(this._audioCtx.destination);

    osc.start(now);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.06);
    osc.stop(now + 0.1);

    this.currentBeat = (this.currentBeat + 1) % this.bpm;
  }


}
