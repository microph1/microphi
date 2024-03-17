import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

interface StripLine {
  value: number;
  label: string;
  // labelFontSize: number;
  // labelFontStyle: number;
  // labelFontColor: number;
  // labelAlign: number;
}
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'ngx-bode',
  templateUrl: './ngx-bode.component.html',
  styleUrls: ['./ngx-bode.component.scss']
})
export class NgxBodeComponent implements OnChanges {
  @Input() fMin: number = 20;
  @Input() fMax: number = 20000;

  @Input() dbMin: number = -50;
  @Input() dbMax: number = 10;

  @Input() data: { x: number; y: number; }[];

  @Input() stripLines: StripLine[]

  options = {
    zoomEnabled: true,
    zoomType: 'xy',
    axisX: {
      logarithmic: true,
      title: '',
      suffix: ' Hz',
      minimum: this.fMin,
      maximum: this.fMax,
      stripLines: [],
    },
    axisY: {
      minimum: this.dbMin,
      maximum: this.dbMax,
      suffix: ' dB',
      titleFontColor: '#4F81BC',
      labelFontColor: '#4F81BC'
    },
    toolTip: {
      shared: true
    },
    legend: {
      cursor: 'pointer',
      fontSize: 12
      //itemclick: toogleDataSeries  //=== not working ===
    },
    data: [{
      type: 'line',
      // name: 'Flat Response',
      // showInLegend: true,
      yValueFormatString: '#,##0.00 db',
      xValueFormatString: '###,##0.00 Hz',
      dataPoints: []
    }]
  };

  ngOnChanges(changes: SimpleChanges): void {
    console.log({changes});

    this.options.axisX.minimum = this.fMin;
    this.options.axisX.maximum = this.fMax;

    this.options.axisY.minimum = this.dbMin;
    this.options.axisY.maximum = this.dbMax;

    this.options.data[0].dataPoints = this.data;

    this.options.axisX.stripLines = this.stripLines;

    // trigger CD
    this.options = {...this.options};

  }

}
