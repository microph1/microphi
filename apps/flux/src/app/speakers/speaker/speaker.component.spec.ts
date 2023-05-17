import { calculateClosedBox, Hs, ISpeaker } from './speaker.component';

describe('#calculateClosedBox', () => {

  const speaker = {
    vas: {value: 16},
    qts: {value: 0.33},
    qes: {value: 0.40},
    fo: {value: 48},
    revc: {value: 5.3},
    qms: {value: 1.73}
  } as ISpeaker;


  it('should pass', () => {
    expect(true).toBeTruthy();
  });

  describe('bessel alignment', () => {
    it('should calculate a closed box', () => {
      const box = calculateClosedBox(speaker, {
        numberOfUnits: 1,
        coupling: 'parallel',
        qtc: 0.577,
        rxSeriesRes: 0.2,
        totalInputPower: 20,
      });

      expect(box.vb).toBeCloseTo(7.61);
      expect(box.fb).toBeCloseTo(84.54);
      expect(box.n0).toBeCloseTo(0.0041);
      expect(box.spl).toBeCloseTo(88.14);
      expect(box.spl2).toBeCloseTo(89.93);

    });
  });

  describe('butterworth alignment', () => {
    it('should calculate a closed box', () => {
      const box = calculateClosedBox(speaker, {
        numberOfUnits: 1,
        coupling: 'parallel',
        qtc: 0.707,
        rxSeriesRes: 0.2,
        totalInputPower: 20,
      });

      expect(box.vb).toBeCloseTo(4.32);
      expect(box.fb).toBeCloseTo(104.1);
      expect(box.n0).toBeCloseTo(0.0041);
      expect(box.spl).toBeCloseTo(88.14);
      expect(box.spl2).toBeCloseTo(89.93);

    });
  });


  describe('Hs', () => {

    it('should calculate the response of a flat freq response (linear resolution)', () => {
      const start = 10;
      const stop = 30;
      const step = 2;
      const data = Hs(() => 1, {
        start,
        stop,
        step,
      });

      // first point is calulated
      expect(data[0].x).toEqual(start);
      expect(data[0].y).toEqual(0);

      console.log(data[data.length - 1]);
      // last point is close enough
      expect(stop - data[data.length - 1].x).toBeLessThanOrEqual(step);
      expect(data[data.length - 1].y).toEqual(0);

      // +1 because the count would be the ordinal number
      const numberOfPoints = Math.floor((stop - start) / step) + 1;

      console.log({numberOfPoints});
      console.log('data.length', data.length);

      expect(data.length).toEqual(numberOfPoints);
    });
  });

  fit('should example transfer function', () => {

    const data = Hs((f) => {

      const f0 = 42;
      const fb = 52;
      const qb = 7;
      const qt = 0.27;

      const x = f / f0;

      const _a = fb / f0;
      const a = _a ** 2;
      const c = 1 + a + (fb / qb * qt * f0);
      const D1 = x ** 4 - (c*(x**2)) + a;
      // console.log({D1});


      const b = (a / qt) + (_a / qb);
      const d = (1 / qt) + fb / (qb * f0);
      const D2 = ((b * x) + (d * x ** 3));


      const D = Math.sqrt((D1 ** 2) + (D2 ** 2));
      // console.log({D});

      //N(f, 42) / D(f, 63, 42, 0.27, 43.3, 27)
      return ((x ** 4) / D);
    }, {start: 20, stop: 20000, step: 1});
    //
    console.log({data});

  });
});
