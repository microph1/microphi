import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ISpeaker, Speaker } from './speaker/speaker.component';

const SPEAKERS_KEY = 'speakers';

function generateUUID() { // Public Domain/MIT
  let d = new Date().getTime();//Timestamp
  let d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = Math.random() * 16;//random number between 0 and 16
    if(d > 0){//Use timestamp until depleted
      r = (d + r)%16 | 0;
      d = Math.floor(d/16);
    } else {//Use microseconds since page-load if supported
      r = (d2 + r)%16 | 0;
      d2 = Math.floor(d2/16);
    }
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

@Injectable({
  providedIn: 'root'
})
export class SpeakersService {

  constructor(private http: HttpClient) { }

  getAll(): Observable<ISpeaker[]> {
    const speakers = this.getSpeakers();
    return of(speakers)
  }

  createOrUpdate(speaker: ISpeaker) {
    const speakers = this.getSpeakers();

    if (!speaker.uuid) {
      speaker.uuid = generateUUID();
      speakers.push(speaker);
    } else {
      const idx = speakers.findIndex(({uuid}) => {
        return uuid === speaker.uuid;
      });

      speakers[idx] = speaker;
    }

    this.setSpeakers(speakers);

  }

  private getSpeakers(): ISpeaker[] {
    return JSON.parse(localStorage.getItem(SPEAKERS_KEY)) || [];
  }

  private setSpeakers(speakers) {
    localStorage.setItem(SPEAKERS_KEY, JSON.stringify(speakers));
  }

  delete(id: string) {
    const speakers = this.getSpeakers();
    const idx = speakers.findIndex((s) => {
      return s.uuid === id;
    });

    speakers.splice(idx, 1);

    this.setSpeakers(speakers);
  }

  getOne(id: any): Observable<ISpeaker> {
    const s = this.getSpeakers().find(({uuid}) => uuid === id);
    return of(s);

  }
}
