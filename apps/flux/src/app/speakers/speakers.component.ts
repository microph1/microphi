import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SpeakersService } from './speakers.service';
import { ISpeaker } from './speaker/speaker.component';


@Component({
  selector: 'fx-speakers',
  templateUrl: './speakers.component.html',
  styleUrls: ['./speakers.component.scss']
})
export class SpeakersComponent {

  search: FormControl<string> = new FormControl<string>('');
  speakers$ = this.speakerService.getAll();

  constructor(private speakerService: SpeakersService) {}

  remove(speaker: ISpeaker) {
    console.log('deleting', speaker);

    this.speakerService.delete(speaker.uuid);
    this.speakers$ = this.speakerService.getAll();
  }
}
