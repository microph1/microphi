import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { startWith } from 'rxjs/operators';
import { BindToParam, Source } from '../app.component';

@Component({
  selector: 'fx-bass-reflex',
  templateUrl: './bass-reflex.component.html',
  styleUrls: ['./bass-reflex.component.css']
})
export class BassReflexComponent implements OnInit {

  @Input() fs: number = 45.8;
  @Input() qt: number = 34;
  @Input() qes: number = 44;
  @Input() sd: number = 126.7;
  @Input() xmax: number = 6;

  cq: number;
  cf3: number = 0;
  cfb: number;
  clv: number;
  cMinPortDiameter: number;

  ebp: number;
  message: string;

  f3 = (.0564 * this.fs / Math.pow((this.qt / 100 / (2 + this.qt / 100)), 1.607));

  vas: number = 22;
  vb: number = 20 * Math.pow(this.qt / 100, 3.3) * this.vas;
  q: number = 4.9;

  ventDiameter: number = 7;
  numberOfPorts: number = 1;

  minPortDiameter: number = 7;

  lv: number = 5;

  newVb: number = 25;
  fb: number = 44;

  chartOptions = {
    zoomEnabled: true,
    zoomType: 'xy',
    axisX: {
      logarithmic: true,
      title: '',
      suffix: ' Hz',
      minimum: 15,
      stripLines: [{
        value: this.f3,
        labelFontSize: 12,
        labelFontStyle: 'italic',
        label: 'Flat Cutoff = ' + this.f3 + ' Hz',
        labelFontColor: '#333',
        labelAlign: 'near'
      }, {
        value: this.cf3,
        labelFontSize: 12,
        labelFontStyle: 'italic',
        label: 'Custom Cutoff = ' + this.cf3 + ' Hz',
        labelFontColor: '#568966',
        labelAlign: 'near'
      }]
    },
    axisY: {
      //minimum: 10,
      //maximun: 8,
      //fontSize: 8,
      title: 'Flat Magnitude',
      suffix: ' dB',
      titleFontColor: '#4F81BC',
      labelFontColor: '#4F81BC'
    },
    axisY2: {
      //minimum: 10,
      //maximun: 8,
      //fontSize: 8,
      title: 'Custom Magnitude',
      suffix: ' dB',
      titleFontColor: '#C0504E',
      labelFontColor: '#C0504E'
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
      name: 'Flate Response',
      showInLegend: true,
      yValueFormatString: '#,##0.00 db',
      xValueFormatString: '###,##0.00 Hz',
      dataPoints: this.type1DataPoints()
    },
      {
        type: 'line',
        name: 'Custom Response',
        color: '#C0504E',
        showInLegend: true,
        axisYType: 'secondary',
        yValueFormatString: '#,##0.00 db',
        xValueFormatString: '###,##0.00 Hz',
        dataPoints: this.type2DataPoints()
      }]
  };

  private routerParam = 'my-route-param';

  private formA = new UntypedFormGroup({
    name: new UntypedFormControl(),
    email: new UntypedFormControl(),
    age: new UntypedFormControl()
  });

  private formControlB = new UntypedFormControl();

  private formControlC = new UntypedFormControl();

  @Source()
  private sourceA$ = this.formA.valueChanges.pipe(
    startWith(undefined)
  );

  @Source()
  @BindToParam('B')
  private sourceB$ = this.formControlB.valueChanges.pipe(
    startWith('a')
  );

  @Source()
  private sourceC$ = this.formControlC.valueChanges.pipe(
    startWith(this.routerParam)
  );

  ngOnChanges(changes: SimpleChanges): void {
    console.log({changes});
  }

  onInputChange(values) {
    console.log('onInputChange', values);
  }

  ngOnInit() {
    this.updateChart();
  }

  type1DataPoints() {
    const dataPoints = [];

    const start = 15;
    const stop = 500;
    const step = 1; // Math.pow(10, 0.01);

    const vb = this.vb; //eval(document.frm.vb.value);
    const vas = this.vas;// eval(document.frm.vas.value);
    const qt = this.qt / 100;
    const fs = this.fs;
    const fb = Math.pow((vas / vb), 0.31) * fs;	// view-source:http://sbp.softica.dk/2.0/en/js/calculations.js

    // vent diameter
    // const vd = this.ventDiameter;
    // const anzahl = this.numberOfPorts;
    const ql = 7;

    const a = (fb / fs) * (fb / fs);

    const b = (a / qt) + (fb / (ql * fs));
    const c = 1 + a + (fb / (ql * (fs * qt))) + (vas / vb);
    const d = (1 / qt) + (fb / (ql * fs));
    //alert("a " + a + ", b " + b + ". c " + c + ", d " + d);

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
      console.log(freq, db);
    }
    // plot magnitude (dB) ===
    return dataPoints;
  }


  calcFlat() {
    // === get form data and calculate flat response
    const vas = this.vas;
    const qt = this.qt / 100;
    const fs = this.fs;
    const anzahl = this.numberOfPorts;
    const qes = this.qes / 100;
    const vd = this.ventDiameter;
    const sd = this.sd;
    const xmax = this.xmax;
    // const ql = 7;

    //var PArea = vd*vd*3.14159;
    //document.frm.Parea.value = round(PArea, 2);


// === calculate EBP ===
    this.ebp = (fs / qes);

    /*
    **	=== check EBP
    */
    // var message11, n;
    // message11 = document.getElementById("p11");
    // message11.innerHTML = "";
    // n = EBP;
    // try {
    //   if (n <= 50) throw "use only for a sealed";
    //   if (n >= 51 && n <= 100) throw "useable for sealed and vented";
    //   if (n > 100 && n < 129) throw "vented box only";
    //   if (n > 130) throw "usable for Horn</font>";
    // } catch (err) {
    //   message11.innerHTML = "Woofer " + err;
    // }


    this.f3 = (.0564 * this.fs / Math.pow((this.qt / 100 / (2 + this.qt / 100)), 1.607));

    const vb = this.vb = 20 * Math.pow(this.qt / 100, 3.3) * this.vas;


    // var vb = 20 * Math.pow(qt, 3.3) * vas;		// view-source:http://sbp.softica.dk/2.0/en/js/calculations.js
    const fb = this.fb = Math.pow((vas / this.vb), 0.31) * fs;
    // view-source:http://sbp.softica.dk/2.0/en/js/calculations.js

    // calculate SPL
    //var n = 9.64*Math.pow(10,(-10))*Math.pow(fs,3)*vas/qes;
    //var spl = Math.round((112.0 + 10*lgt(n))*100)/100;

    //calculate length port
    //var lv = ((23562.5 * vd * diameterunitsvalue * vd * diameterunitsvalue * 1) / (vb * volumeunitsvalue * fb * fb)) - (0.732 * vd * diameterunitsvalue);
    this.lv = ((23562.5 * vd * vd * anzahl) / (fb * fb * vb)) - (0.732 * vd);
    //var lv = round(((3.14159 / 4) * vd * vd * anzahl), 2);

    // calculate minimal port diameter
    const pnum = anzahl;
    const vdx = ((sd / 10000) * (xmax / 1000)) / pnum;
    let dpm = Math.pow((vdx * fb), 0.5) * 100;
    dpm = Math.round(dpm * 100) / 100;

    // calculate Q of Bos
    this.q = (vb / vas) / (qt * qt);

    /*
    **	=== validate port length
    */
    // var message9, z;
    // message9 = document.getElementById("p09");
    // message9.innerHTML = "";
    // var z = lv;
    // try {
    //   if (z == "") throw "empty";
    //   if(isNaN(z)) throw "not a number";
    // z = Number(z);
    // if (z < 2) throw "too short, enlarge Port diameter or use more ports";
    // if (z > 150) throw "too long, downsize Port diameter";
    // } catch (err) {
    //   message9.innerHTML = "Port is " + err;
    // }

// ===== End validation ======

    //var ripple = 20*Math.log(2.6*qt*Math.pow((vas/vb),0.64)); //0.64  =  0.42

    //document.frm.spl.value = round(spl,1);
    this.minPortDiameter = dpm;
//}

// Calculate Port Area cm2
//function calcPA()
//{
//     var vd = eval(document.frm.vd.value);
//     vd = vd / 2; // diameter to radius
//     var Parea = vd * vd * 3.14159;
//     document.frm.Parea.value = round(Parea, 2);

  }

  calcCustom() {
    // === get form data and calculate custom vb
    const newvb = this.newVb;
    const vas = this.vas;
    const qt = this.qt / 100;
    // const qes = this.qes;
    const fs = this.fs;
    const vd = this.ventDiameter;
    const anz2 = this.numberOfPorts;
    const sd = this.sd;
    const xmax = this.xmax;
    // const ql = 7;

// claculate Q of Custom box
    this.cq = (newvb / vas) / (qt * qt);


    // calculate f3 and fb
    this.cf3 = fs * Math.pow((vas / newvb), 0.385); // org
    const cfb = this.cfb = fs * Math.pow((vas / newvb), 0.305);  // org

    // calculate SPL
    //var n = 10.64 * Math.pow(10,(-10)) * Math.pow(fs,3) * newvb/qes;
    //var cspl = round((112.0 + 10 * lgt(n)), 2);


    // calculate Port length
    // var diameteruntisvalue = 1;
    this.clv = ((23562.5 * vd * vd * anz2) / (cfb * cfb * newvb)) - (0.732 * vd);
    //var clv = round(((3.14159 / 4) * vd * vd * anz2), 2);

    // calculate minimal port diameter
    const pnum = anz2;
    const vdc = ((sd / 10000) * (xmax / 1000)) / pnum;
    this.cMinPortDiameter = Math.pow((vdc * cfb), 0.5) * 100;
  }


  updateChart() {
    this.calcFlat();
    this.calcCustom();

    this.chartOptions.axisX.stripLines[0].value = this.f3;
    this.chartOptions.axisX.stripLines[0].label = 'Flat Cutoff = ' + Math.round(this.f3 * Math.pow(10, 2)) / Math.pow(10, 2) + ' Hz';
    this.chartOptions.axisX.stripLines[1].value = this.cf3;
    this.chartOptions.axisX.stripLines[1].label = 'Custom Cutoff = ' + Math.round(this.cf3 * Math.pow(10, 2)) / Math.pow(10, 2) + ' Hz';
    this.chartOptions.data[0].dataPoints = this.type1DataPoints();
    this.chartOptions.data[1].dataPoints = this.type2DataPoints();


    this.chartOptions = {...this.chartOptions};

  }

  type2DataPoints() {
    const dataPoints = [];

    const start = 15;
    const stop = 500;
    const step = 1; // Math.pow(10, 0.01);

    const newvb = this.newVb;
    const vas = this.vas;
    const qt = this.qt / 100;
    const fs = this.fs;
    const cfb = this.fb;
    // const vd = eval(document.frm.vd.value);
    // const anzahl = eval(document.frm.anz.value);
    const ql = 7;

    const a = (cfb / fs) * (cfb / fs);

    const b = (a / qt) + (cfb / (ql * fs));
    const c = 1 + a + (cfb / (ql * (fs * qt))) + (vas / newvb);
    const d = (1 / qt) + (cfb / (ql * fs));
    //alert("a " + a + ", b " + b + ". c " + c + ", d " + d);

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
    // plot magnitude (dB) ===
    return dataPoints;
  }

}
