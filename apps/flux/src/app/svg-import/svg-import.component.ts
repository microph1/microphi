import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { axisBottom, axisLeft, curveLinear, format, line, map, range, ScaleLinear, scaleLinear, scaleLog, ScaleLogarithmic, select, Selection, zoom, zoomIdentity } from 'd3';
import { plot } from '../data';

@Component({
  selector: 'fx-svg-import',
  templateUrl: './svg-import.component.html',
  styleUrls: ['./svg-import.component.css']
})
export class SvgImportComponent implements OnInit {
  private d3: Selection<SVGElement, unknown, null, undefined>;

  private border = 40;

  private svg: Selection<ElementTagNameMap['svg'], unknown, null, undefined>;
  private xScale: ScaleLogarithmic<number, number, never>;
  private xAxis;
  private yAxis;
  private yScale: ScaleLinear<number, number, never>;

  constructor(private elm: ElementRef<SVGElement>) {
    console.log({elm});
  }

  ngOnInit(): void {
    this.d3 = select(this.elm.nativeElement);
    console.log({d3: this.d3});

    const {width, height} = this.elm.nativeElement.getBoundingClientRect();

    const X = map(plot, ({x}) => x);
    const Y = map(plot, ({y}) => y);
    const I = range(X.length);

    // const D = map(plot, (d, i) => !isNaN(X[i]) && !isNaN(Y[i]));
    const xDomain = [20, 20000];
    const yDomain = [40, 110];

    const xScale = this.xScale = scaleLog(xDomain, [0 + this.border, width - this.border]);
    const yScale = this.yScale = scaleLinear(yDomain, [height - this.border, this.border]);

    const xAxis = this.xAxis = axisBottom(xScale).ticks(width / 80).tickSizeOuter(0);
    const yAxis = this.yAxis = axisLeft(yScale).ticks(height / 40);

    const defined = (d, i) => !isNaN(X[i]) && !isNaN(Y[i]);
    const D = map(plot, defined);

    const l = line()
      // @ts-ignore
      .defined(i => D[i])
      .curve(curveLinear)
      // @ts-ignore
      .x(i => xScale(X[i]))
      // @ts-ignore
      .y(i => yScale(Y[i]));

    // create svg element
    const svg = this.svg = this.d3
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);


    const gX = svg.append('g')
      .attr('transform', `translate(0,${height - this.border})`)
      .call(xAxis)
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
        .attr("y2", -(height - 2 * this.border))
        .attr("stroke-opacity", 0.1))
        // .attr('transform', 'rotate(180)');


    const gY = svg.append("g")
      .attr("transform", `translate(${this.border},0)`)
      .call(yAxis)
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
        .attr("x2", width - this.border - this.border)
        .attr("stroke-opacity", 0.1))
      .call(g => g.append("text")
        .attr("x", -this.border)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text('dbSPL'));

    svg.append("path")
      .attr("fill", "none")
      .attr("stroke", 'steelblue')
      .attr("stroke-width", 1.5)
      .attr("stroke-linecap", 'round')
      .attr("stroke-linejoin", 'round')
      .attr("stroke-opacity", 1)
    // @ts-ignore
      .attr("d", l(I));


    const z = zoom()
      .scaleExtent([1, 40])
      .translateExtent([[-100, -100], [width + 90, height + 100]])
      .filter(filter)
      .on("zoom", zoomed);


    Object.assign(svg.call(zoom).node(), {reset});

    function zoomed({ transform }) {
      svg.attr("transform", transform);
      gX.call(xAxis.scale(transform.rescaleX(2)));
      gY.call(yAxis.scale(transform.rescaleY(2)));
    }

    function reset() {
      svg.transition()
        .duration(750)
        .call(z.transform, zoomIdentity);
    }

    // prevent scrolling then apply the default filter
    function filter(event) {
      event.preventDefault();
      return (!event.ctrlKey || event.type === 'wheel') && !event.button;
    }
  }

  @HostListener('window:resize')
  resize() {
    console.log('resizing');
    const {width, height} = this.elm.nativeElement.getBoundingClientRect();

    this.svg
      .attr('top', 0)
      .attr('left', 0)
      .attr('width', width)
      .attr('height', height);

    this.xScale.range([0 + this.border, width - this.border]);
    // this.xAxis
    //   .attr('transform', `translate(0,${height - this.border})`)
    //   .call(axisBottom(this.xScale).tickFormat(format('2')));

    this.yScale.range([height - this.border, this.border]);

    // this.yAxis.attr('transform', `translate(${this.border}, 0)`)
    //   .call(axisLeft(this.yScale));


  }

}
