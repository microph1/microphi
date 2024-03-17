import { Component, Input, OnInit } from '@angular/core';
import { SpeakersService } from '../speakers.service';
import { ActivatedRoute } from '@angular/router';
import { filter, map, switchMap } from 'rxjs';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'fx-dimension-field',
  template: `

  `
})
export class FxDimensionField {

  @Input() dimension: Dimension;
  fc = new FormControl();


}

export interface Dimension {
  value: number;
  unit?: string;
  label?: string;
}

export interface ISpeaker {
  uuid: string;

  name: string;
  size: Dimension;
  znom: Dimension;

  fo: Dimension;
  vas: Dimension;
  spl: Dimension;
  power: Dimension;

  inHole: Dimension;
  outHole: Dimension;
  thick: Dimension;

  revc: Dimension;
  levc: Dimension;
  sd: Dimension;
  bl: Dimension;
  no: Dimension;
  xmax: Dimension;
  voiceCoilDiameter: Dimension;

  mmd: Dimension;
  mms: Dimension;
  cms: Dimension;
  qms: Dimension;
  qes: Dimension;
  qts: Dimension;
}

export class Speaker implements ISpeaker {
  uuid: string;
  name: string;
  size: Dimension = {value: 0, unit: 'inches'};
  znom: Dimension = {value: undefined, unit: 'ohm'};
  fo: Dimension = {value: undefined, unit: 'hz'};

  inHole: Dimension = {value: undefined, unit: 'cm'};
  outHole: Dimension = {value: undefined, unit: 'cm'};
  thick: Dimension = {value: undefined, unit: 'cm'};
  revc: Dimension = {value: undefined, unit: 'ohm'};
  spl: Dimension = {value: undefined, unit: 'db'};
  power: Dimension = {value: undefined, unit: 'W'};
  xmax: Dimension = {value: undefined, unit: 'mm'};
  vas: Dimension = {value: undefined, unit: 'L'};
  mmd: Dimension = {value: undefined, unit: 'g'};
  mms: Dimension = {value: undefined, unit: 'g'};
  sd: Dimension = {value: undefined, unit: 'cm^2'};

  bl: Dimension = {value: undefined, unit: 'T*M'};
  levc: Dimension = {value: undefined, unit: 'mH'};
  no: Dimension = {value: undefined, unit: '%'};
  voiceCoilDiameter: Dimension = {value: undefined, unit: 'mm'};

  cms: Dimension = {value: undefined};
  qms: Dimension = {value: undefined};
  qes: Dimension = {value: undefined};
  qts: Dimension = {value: undefined};

  constructor(speaker: ISpeaker) {
    Object.assign(this, speaker);
  }

  getProperties(): (Dimension & { key: string })[] {
    return Object.entries(this)
      .filter(([k]) => k !== 'uuid' && k !== 'name')
      // .filter(([, v]) => {
      //   return 'value' in v;
      // })
      .map(([key, v]) => {
        return {
          key,
          // set label as key. if it is already defined it will be overwritten by `...v`
          label: key,
          ...v
        };
      });
  }
}


@Component({
  selector: 'fx-speaker',
  templateUrl: 'speaker.component.html',
  styleUrls: ['speaker.component.scss']
})
export class SpeakerComponent implements OnInit {

  speaker: Speaker;

  closedBox: ClosedBoxDerived;
  bassReflex: BassReflexDerived;

  id$ = this.activatedRoute.params.pipe(
    map(({id}) => id)
  );

  properties: (Dimension & { key: string; })[];
  closedBoxData: { x: number; y: number; }[];
  bassReflexData: { x: number; y: number; }[];
  myData = Hs(frequencyResponse({
    f0: 42,
    fb: 40,
    qt: 0.27,
    vas: 43.3,
    vb: 27,
  }), {start: 20, stop: 500, step: 0.1});


  constructor(
    private speakerService: SpeakersService,
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit() {
    // Todo handle unsubscription
    this.id$.pipe(
      filter((id) => !!id),
      switchMap((id) => this.speakerService.getOne(id))
    ).subscribe((speaker) => {
      console.log({speaker});

      this.speaker = new Speaker(speaker);
      this.properties = this.speaker.getProperties();
      this.closedBox = calculateClosedBox(this.speaker);
      this.closedBoxData = this.calculatedClosedBoxPlot(this.speaker, this.closedBox);

      this.bassReflex = calculateBassReflexBoxData(this.speaker);
      this.bassReflexData = this.calculateBassReflexResponse(this.speaker, this.bassReflex);

    });
  }

  save() {
    console.log(this.properties);

    this.properties.forEach(({key, ...values}) => {
      this.speaker[key] = values;
    });

    this.speakerService.createOrUpdate(this.speaker);
    this.closedBox = calculateClosedBox(this.speaker);
    this.bassReflex = calculateBassReflexBoxData(this.speaker);


  }

  isString(p: string | number): p is string {
    return typeof p === 'string';
  }

  private calculatedClosedBoxPlot(speaker: ISpeaker, closedBox: ClosedBoxDerived, {
    start,
    stop,
    step,
  }: {
    start: number;
    stop: number;
    step: number
  } = {
    start: 10,
    stop: 500,
    step: 1,
  }) {

    const dataPoints = [];

    console.log({closedBox});

    const ffb = 0.001;
    const fql = 100000;

    const vbclosed = closedBox.vb;
    const vas = speaker.vas.value;
    const qts = speaker.qts.value;
    const fs = speaker.fo.value;

    const a = (ffb / fs) * (ffb / fs);
    const b = a / qts + ffb / (fql * fs);
    const c = 1 + a + ffb / (fql * (fs * qts)) + vas / vbclosed;
    const d = 1 / qts + ffb / (fql * fs);

    for (let t = start; t < stop; t *= step) {
      const fs2 = fs;
      const w = t * step / fs2;
      const u = w * w;
      const x = u * u;
      let e = x / Math.sqrt((x - c * u + a) * (x - c * u + a) + (b * w - d * u * w) * (b * w - d * u * w));
      e = 20 * Math.log(e) / Math.LN10;
      const db = e;
      const freq = t * step;

      dataPoints.push({x: freq, y: db});
      t = t + 0.5;
    }
    return dataPoints;
  }

  private calculateBassReflexResponse(speaker: Speaker, bassReflex: BassReflexDerived, {
    start,
    stop,
    step,
  }: {
    start: number;
    stop: number;
    step: number
  } = {
    start: 10,
    stop: 500,
    step: 1,
  }) {
    const data = []

    const vb = bassReflex.vb;
    const vas = speaker.vas.value;
    const qts = speaker.qts.value;
    const fs = speaker.fo.value;
    const fb = bassReflex.fb;
    const vd = bassReflex.minPortDiameter;
    const numberOfPort = bassReflex.numberOfPorts;
    const ql = 7;

    const a = (fb / fs) * (fb / fs);
    const b = (a / qts) + (fb / (ql * fs));
    const c = 1 + a + (fb / (ql * (fs * qts))) + (vas / vb)
    const d = (1 / qts) + (fb / (ql * fs));

    for (let t = start; t < stop; t *= step) {
      const freq = t * step;
      const w = freq / fs;
      const u = w * w;
      const x = u * u;
      const e = x / Math.sqrt((x - c * u + a) ** 2 + (b * w - d * u * w) ** 2);
      const db = 20 * Math.log10(e);

      data.push({x: freq, y: db});
      t = t + 0.5;
    }

    return data;
  }

}

const Qa = 27; // WTF!


export interface ClosedBoxData {
  qtc: number;
  numberOfUnits: number;
  coupling: 'serial' | 'parallel';
  totalInputPower: number;
  rxSeriesRes: number;
}

export interface ClosedBoxDerived {
  vb: number;
  fb: number;
  f3: number;
  n0: number;
  spl: number;
  spl2: number;
}

export function calculateClosedBox({vas, qes, fo, revc, qms}: ISpeaker, {
  qtc,
  numberOfUnits,
  totalInputPower,
  rxSeriesRes,
  coupling,
}: ClosedBoxData = {
  qtc: 0.577, // Bessel
  numberOfUnits: 1,
  coupling: 'parallel',
  totalInputPower: 20,
  rxSeriesRes: 0.2
}): ClosedBoxDerived {

  const qtc_ = (Qa * qtc) / (Qa - qtc);

  const qes_: number = qes.value * ((revc.value + rxSeriesRes)/revc.value);

  const qts_: number = (qes_ * qms.value) / (qes_ + qms.value);
  const vas_: number = vas.value;

  const vb = (vas_ / (Math.pow((qtc_ / qts_), 2) - 1));

  const fo_ = fo.value;
  const fb = qtc_ / qts_ * fo_;
  const n0 = 9.64 * Math.pow(10, (-10)) * Math.pow(fo_, 3) * (vas_ / qes_);

  const n0Log = Math.log10(n0);

  const spl = Math.round((112.0 + (10 * n0Log)) * 100) / 100;
  const spl2 = Math.round((112.0 + 10 * n0Log + 10 * Math.log10(8 / revc.value)) * 100) / 100;

  const a1 = 1 / Math.pow(qtc_, 2) - 2;
  const f3 = fb * Math.sqrt(a1 / 2 + Math.sqrt(a1 * a1 / 4 + 1));

  return {
    vb,
    fb,
    f3,
    n0,
    spl,
    spl2
  };
}

export function calculateBassReflexBoxData({vas, qts, qes, fo, sd, xmax }: ISpeaker, {
  numberOfPorts,
  portDiameter,
}: {
  numberOfPorts: number; // anz
  portDiameter: number; // vd
} = {
  numberOfPorts: 1,
  portDiameter: 1,
}): BassReflexDerived {

  const ebp = fo.value / qes.value;

  const f3 = (.0564 * fo.value / Math.pow((qts.value / (2 + qts.value)), 1.607));

  const vb = 20 * Math.pow(qts.value, 3.3) * vas.value;

  const fb = Math.pow((vas.value / vb), 0.31) * fo.value;


  // calculate minimum port diameter
  const vdx = ((sd.value / 10000) * (xmax.value / 1000)) / numberOfPorts;
  const minPortDiameter = Math.pow((vdx * fb), 0.5) * 100;



  const portLength = ((23562.5 * minPortDiameter * minPortDiameter * numberOfPorts) / (fb * fb * vb)) - (0.732 * minPortDiameter);

  return {
    ebp,
    f3,
    vb,
    fb,
    portLength,
    minPortDiameter,
    numberOfPorts,
  }
}

export interface BassReflexDerived {
  ebp: number;
  f3: number;
  vb: number;
  fb: number;
  portLength: number;
  minPortDiameter: number;
  numberOfPorts: number;
}

interface Boundaries {
  start: number;
  stop: number;
  step: number;
}

export function Hs(Hs: (f: number) => number, {start, stop, step}: Boundaries = {
  start: 20,
  stop: 20000,
  step: 10,
}): {x: number; y: number}[] {

  const data = [];

  for (let t = start, ciphers = (start + '').length; t <= stop; t += step*Math.pow(10, ciphers - 1), ciphers = (t+'').length) {

    const db = 20 * Math.log10(Hs(t));

    data.push({x: t, y: db});
  }

  return data;
}

function frequencyResponse({f0, fb, qb, qt, vas, vb}: {
  f0: number;
  fb: number;
  qb?: number;
  qt: number;
  vas: number;
  vb: number;
}) {

  return (f) => {
    const _qb = qb ?? 7;

    const x = f / f0;

    const _a = fb / f0;
    const a = _a ** 2;
    const b = (a / qt) + (fb / (_qb * f0));
    const c = 1 + a + (fb / (_qb * qt * f0)) + vas/vb;
    const d = (1 / qt) + (fb / (_qb * f0));

    const w = x;
    const u = x**2;

    return x**4 / Math.sqrt((x**4 - c * u + a) ** 2 + (b * w - d * u * w) ** 2);
  }
}
