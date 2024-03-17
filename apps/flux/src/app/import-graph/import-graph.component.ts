import { AfterViewInit, Component, ElementRef, Injectable, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { linearDerivation, round } from '../app.module';
import { Observable, of } from 'rxjs';
import { Effect, makeStore, Reduce, Store } from '@microphi/store';

declare const MMCQ;

interface State<T> {
  history: T[];
  position: number;
  value: T;
}

interface Actions<T> {
  undo: () => Observable<undefined>;
  redo: () => Observable<undefined>;
  setValue: (value: T) => Observable<T>;
}

@Injectable({
  providedIn: 'root'
})
export class ComponentStore<T> extends Store<State<T>, Actions<T>> implements makeStore<State<T>, Actions<T>> {

  value$ = this.select(({value}) => value);

  constructor() {
    super({
      history: [],
      value: undefined,
      position: 0
    });
  }

  @Reduce()
  onRedo(state: State<T>): State<T> {
    const position = state.position < state.history.length - 1 ? state.position + 1 : state.position;
    return {
      ...state,
      value: state.history[position],
      position
    };
  }

  @Reduce()
  onUndo(state: State<T>): State<T> {
    const position = state.position > 0 ? state.position - 1 : state.position;
    return {
      ...state,
      value: state.history[position],
      position
    };
  }

  @Effect()
  redo(): Observable<undefined> {
    return of(undefined);
  }

  @Effect()
  undo(): Observable<undefined> {
    return of(undefined);
  }

  @Effect()
  setValue(v: T) {
    return of(v);
  }

  @Reduce()
  onSetValue(state: State<T>, payload: T) {
    state.history.push(payload);
    return {
      ...state,
      value: payload,
      position: state.history.length - 1
    };
  }
}

@Component({
  selector: 'fx-import-graph',
  templateUrl: './import-graph.component.html',
  styleUrls: ['./import-graph.component.scss']
})
export class ImportGraphComponent implements AfterViewInit {

  @ViewChild('_canvasElement') canvas: ElementRef<HTMLCanvasElement>;

  ctx: CanvasRenderingContext2D;

  palette: any[];

  private scaleImage: boolean = false;

  private lowerLeftPoint: [number, number] = [58, 477];
  private upperRightPoint: [number, number] = [1794, 17];

  minX = new FormControl(20);
  maxX = new FormControl(20000);
  minY = new FormControl(50);
  maxY = new FormControl(110);


  chartOptions = {
    zoomEnabled: true,
    zoomType: 'xy',
    exportEnabled: true,
    title: {
      text: 'Frequency Response of Low Pass Filters'
    },
    axisX: {
      logarithmic: true,
      title: 'Frequency Hz',
      minimum: this.minX.value,
      maximum: this.maxX.value,
      suffix: 'Hz',
      stripLines: [{
        value: 1000
      }]
    },
    axisY: {
      title: 'dbSPL',
      titleFontColor: '#4F81BC',
      labelFontColor: '#4F81BC',
      minimum: this.minY.value,
      maximum: this.maxY.value,
    },
    legend: {
      cursor: 'pointer'
      // itemclick: toogleDataSeries
    },
    data: [{
      type: 'line',
      name: 'dbSPL',
      showInLegend: true,
      yValueFormatString: '#,##0.00 db',
      xValueFormatString: ' #,##0.00#hz',
      dataPoints: []
    }]
  };

  rPick: number;
  gPick: number;
  bPick: number;
  leftColor: [number, number, number] = [255, 10, 10];

  colorPrecision: FormControl<number> = new FormControl<number>(0);


  private canvasjs: object;
  private imageData: ImageData;
  operator: 'lowerLeft' | 'upperRight' | 'pickColor'| '';

  constructor(
    private redoStore: ComponentStore<ImageData>,
    private elm: ElementRef
  ) {

    //
    this.redoStore.value$.subscribe((value) => {
      // this.minY.patchValue(value, {emitEvent: false});
      // redraw canvas

      if (value) {
        // this.ctx.putImageData(value, 0, 0);
      }
    });
  }

  undo() {
    this.redoStore.dispatch('undo');
  }

  redo() {
    this.redoStore.dispatch('redo');
  }

  ngOnInit() {
    this.colorPrecision.valueChanges.subscribe(() => {
      this.scan();
    })
  }

  ngAfterViewInit() {
    this.canvas.nativeElement.height = this.elm.nativeElement.offsetHeight;
    this.canvas.nativeElement.width = this.elm.nativeElement.offsetWidth;

    this.ctx = this.canvas.nativeElement.getContext('2d');

    // console.log('canvas', this.canvas.nativeElement.width, this.canvas.nativeElement.height);

  }

  scan() {
    const {width, height} = this.canvas.nativeElement;
    const imageData = this.ctx.getImageData(0, 0, width, height);

    console.log({width, height});
    // debugger;
    // for (let row=0; row<height; row++) {
    //   for (let col = 0; col < width; col++) {
    //     // get pixel
    //     const pixel = (col + (row + imgData.width)) * 4;
    //     // console.log(imgData.data[pixel]);
    //
    //   }
    // }


    // Create custom CanvasImage object
    const pixels = imageData.data;
    const pixelCount = pixels.length;
    const quality = 10;
    const colorCount = 20;

    const start = width * (this.upperRightPoint[1] - 1) + this.upperRightPoint[0];
    const end = width * (this.lowerLeftPoint[1] - 1) + this.lowerLeftPoint[0];


    // Store the RGB values in an array format suitable for quantize function
    const pixelArray = [];
    for (let i = start, offset, r, g, b, a; i < end; i = i + quality) {
      offset = i * 4;
      r = pixels[offset + 0];
      g = pixels[offset + 1];
      b = pixels[offset + 2];
      a = pixels[offset + 3];
      // If pixel is mostly opaque and not white
      if (a >= 125) {
        if (!(r > 250 && g > 250 && b > 250)) {
          pixelArray.push([r, g, b]);
        }
      }
    }

    // Send array to quantize function which clusters values
    // using median cut algorithm
    const cmap = MMCQ.quantize(pixelArray, colorCount);
    console.log({cmap});
    const palette = cmap.palette();

    console.log({palette});

    this.palette = palette;

    const points = [];

    for (let i = 0; i < pixelCount; i = i + quality) {
      const offset = i * 4;
      const r = pixels[offset + 0];
      const g = pixels[offset + 1];
      const b = pixels[offset + 2];

      const [r2, g2, b2] = this.leftColor; // pure red


      const distance = Math.sqrt(Math.pow(r2 - r, 2) + Math.pow(g2 - g, 2) + Math.pow(b2 - b, 2));


        // this value is empirical
        // estimated using a pure red as `leftColor`
      const colorRadius = 199 + (this.colorPrecision.value);

      if (distance <= colorRadius) {


        const y = Math.floor(i / this.canvas.nativeElement.width);
        const x = i % this.canvas.nativeElement.width;
        points.push({
          x, y
        });
      }

    }

    const sorted = points.sort((a, b) => {
      return a.x - b.x;
    });

    // console.log(sorted);


    // let previous;
    // sorted.forEach(({x, y}) => {
    //
    //   if (previous === undefined) {
    //     // this is the first point
    //     // this.ctx.moveTo(x, y);
    //     previous = [x, y];
    //     // this.ctx.beginPath();
    //     // this.ctx.moveTo(x, y)
    //   } else {
    //     this.ctx.beginPath();
    //     this.ctx.moveTo(previous[0], previous[1]);
    //     this.ctx.lineTo(x, y);
    //     this.ctx.stroke();
    //     previous = [x, y];
    //   }
    //   // this.ctx.strokeRect(x, y, 1, 1);
    // });

    const xLength = Math.abs(this.lowerLeftPoint[0] - this.upperRightPoint[0]);
    const xMinLin = round(Math.log10(this.minX.value));
    const xMaxLin = round(Math.log10(this.maxX.value));
    const xSizeLin = Math.abs(xMaxLin - xMinLin);

    console.log({xLength, xMinLin, xMaxLin, xSizeLin});
    console.log('----------- make it a time serie -------------');
    console.log('sorted has ', sorted.length, 'points');

    const minStep = sorted.reduce<number>((minStep, {x, y}, i) => {

      const step = sorted[i + 1]?.x - x;

      if (minStep > step && step > 2) {
        minStep = step;
      }

      return minStep;
    }, 10);

    console.log({minStep});

    const smoothed = [];

    const block = 5;
    const sigma = 1;

    for (let i = 0; i < sorted.length - block; i = i + block) {

      smoothed.push(sorted[i]);

      const {x: x0, y: y0} = sorted[i];
      const {x: x1, y: y1} = sorted[i + block];
      const delta = x1 - x0;

      if (delta >= sigma) {
        const xM = Math.floor((x1 + x0) / 2);
        const yM = linearDerivation(x0, x1, y0, y1, xM);
        smoothed.push({x: xM, y: yM});
      }

      smoothed.push({x1, y1});

    }

    // plot.forEach(({x, y}, index) => {
    //
    //
    //
    // });
    console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
    console.log('smoothed has ', smoothed.length, 'points');


    const plot = smoothed

      .map(({x, y}) => {

        const xL2 = linearDerivation(this.lowerLeftPoint[0], this.upperRightPoint[0], xMinLin, xMaxLin, x);

        // linear scale
        const yValue = linearDerivation(this.upperRightPoint[1], this.lowerLeftPoint[1], this.maxY.value, this.minY.value, y);

        // console.log(xValue, yValue);


        return {
          x: Math.pow(10, xL2),
          y: yValue
        };
      })
      .filter(({x}) => {
        // trim line;
        return x <= this.maxX.value;
      });

    if (plot[0].x > this.minX.value) {
      console.log('plot should start at point 0');
      const x0 = plot[0].x;
      const y0 = plot[0].y;

      const x1 = plot[1].x;
      const y1 = plot[1].y;

      const y = linearDerivation(x0, x1, y0, y1, this.minX.value);
      console.log('initial point', {x: this.minX.value, y});
      plot.unshift({x: this.minX.value, y});
    }


    console.log({plot});

    // console.log(plot[0]);
    // console.log(plot[plot.length - 1]);

    this.chartOptions.data[0].dataPoints = plot;
    this.chartOptions.axisX.minimum = this.minX.value;
    this.chartOptions.axisX.maximum = this.maxX.value;
    this.chartOptions.axisY.minimum = this.minY.value;
    this.chartOptions.axisY.maximum = this.maxY.value;
    this.chartOptions = {...this.chartOptions};

    // @ts-ignore
    this.canvasjs.render();
  }

  click($event: MouseEvent) {
    const {offsetX, offsetY} = $event;

    console.log({offsetX, offsetY});

    switch (this.operator) {

      case 'lowerLeft':
        this.lowerLeftPoint = [offsetX, offsetY];
        this.markPoint(this.lowerLeftPoint[0], this.lowerLeftPoint[1]);
        break;
      case 'upperRight':
        this.upperRightPoint = [offsetX, offsetY];
        this.markPoint(this.upperRightPoint[0], this.upperRightPoint[1]);
        break;

      case 'pickColor':
        this.leftColor = [this.rPick, this.gPick, this.bPick];
        break;

    }

    this.operator = '';
  }

  getChartInstance($event: object) {
    console.log($event);
    this.canvasjs = $event;
  }


  private markPoint(x: number, y: number) {
    const data = this.imageData;
    this.redoStore.dispatch('setValue', data);
    this.ctx.beginPath();
    this.ctx.fillStyle = '#640f0f';
    this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
    this.ctx.stroke();
  }


  onMove($event: MouseEvent) {
    if (this.operator === 'pickColor') {
      // show zoom canvas here
      const {offsetX, offsetY} = $event;
      // console.log({offsetX, offsetY});
      const {width, data} = this.imageData;
      const offset = ((offsetY * width) + offsetX) * 4;

      this.rPick = data[offset + 0];
      this.gPick = data[offset + 1];
      this.bPick = data[offset + 2];

    }
  }

  loadImage(event) {

    const f = event.target.files[0];

    const src = window.URL.createObjectURL(f);

    const canvasWidth = this.canvas.nativeElement.width;
    const canvasHeight = this.canvas.nativeElement.height;
    // const canvasAspectRation = this.canvas.nativeElement.width / this.canvas.nativeElement.height;

    //Loading of the home test image - img1
    const img1 = new Image();
    img1.src = src;
    //drawing of the test image - img1
    img1.addEventListener('load', () => {
      const {width, height} = img1;
      console.log('image', {width, height});


      if (!this.scaleImage) {
        // resize canvas
        this.canvas.nativeElement.height = height;
        this.canvas.nativeElement.width = width;
        this.ctx.drawImage(img1, 0, 0, width, height);

        this.imageData = this.ctx.getImageData(0, 0, width, height);
      }

      if (this.scaleImage) {
        // with scaling image into given canvas
        // assume the image is wider than taller
        const imageWidth = canvasWidth;
        /**
         * W/H = x
         *
         * w = h * x
         *
         * h = w / x
         */
          // preserve aspect ratio
        const imageHeight = imageWidth / (width / height);

        const dy = Math.abs(canvasHeight - imageHeight);

        //draw background image
        this.ctx.drawImage(img1, 0, dy, this.canvas.nativeElement.width, imageHeight);


      }

      // this.ctx.fillStyle = '#640f0f';

      this.markPoint(this.lowerLeftPoint[0], this.lowerLeftPoint[1]);
      this.markPoint(this.upperRightPoint[0], this.upperRightPoint[1]);

      this.scan();


    });

  }
}
