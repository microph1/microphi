import { Component, css, OnViewInit } from '@microphi/flux';
import { EMPTY, interval, scan, Subject, switchMap } from 'rxjs';
import template from './fx-root.component.html?raw';

type Directive = (this: FxRootComponent, elm: HTMLElement) => void;

export const directives: {[name: string]: Directive} = {};

export function registerDirective(name: string, cb: Directive) {
  directives[name] = cb;
}

@Component({
  selector: 'fx-root',
  template,
  style: css`
    :host {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .max-width {
      max-width: 1280px;
    }


  `,
})
export class FxRootComponent implements OnViewInit {

  timer = 0;

  count$ = new Subject<void>();
  repos: any[] = [];

  constructor(private elm: HTMLElement) {
    this.count$.pipe(

      scan((status, _) => {
        return !status;
      }, false),

      switchMap((status) => {
        console.log({status});
        if (status) {
          return interval(1_000);
        } else {
          return EMPTY;
        }
      }),
    ).subscribe((count) => {
      console.log({count});

      this.timer = count;

    });


  }

  async fxOnViewInit() {

    registerDirective('fx-parallax', (elm: HTMLElement) => {
      console.log('I do my thing in the House', elm);
      const parent: HTMLElement = document.body;

      // makes it a bit smoother
      //elm.style.setProperty('transition', 'background-position-y 0.1s linear');

      parent.addEventListener('scroll', (_event) => {

        //let parentHeight;
        //let scrollTop; if (parent === window) {
        //  parentHeight = parent.innerHeight;
        //  scrollTop = parent.pageYOffset;
        //} else if (parent instanceof HTMLElement) {
        const parentHeight = parent.offsetHeight;
        const scrollTop = parent.scrollTop;
        //}

        const elementPosition = elm!.offsetTop;


        // TODO this need to be extracted somehow

        const directiveValue = elm.getAttribute('[fx-parallax]') || '1.0';

        const factor = parseFloat(directiveValue);

        const positionY = Math.floor((scrollTop - elementPosition) * factor);

        if ((scrollTop + parentHeight) >= elementPosition) {
          elm.style.backgroundPositionY = `${positionY}px`;
        }
      });


      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            console.log('Element is visible!', entry.target);
          }
        });
      }, {
        root: null, // This listens to the viewport (entire page)
        rootMargin: '0px',
        threshold: 0.1 // Adjust visibility threshold
      });

      // Observe an element inside the shadow DOM
      //const targetElement = shadowRoot.querySelector('.some-element');
      observer.observe(this.elm);
    });

    // scan document for directives
    Object.entries(directives).forEach(([name, cb]) => {

      const directiveElms = this.elm.shadowRoot!.querySelectorAll(`[\\[${name}\\]]`);

      for (const elm of directiveElms) {
        if (elm instanceof HTMLElement) {
          cb.apply(this, [elm]);
        }
      }

    });

    const resp = await this.fetchByMaintainer('cavaliere.davide@gmail.com');
    const datakitchenStuff = await this.fetchByKeyword('@datakitchen');
    const repos: any[] = [...resp.objects, ...datakitchenStuff.objects];

    console.log(repos);

    this.repos = repos.map((elm: any) => {

      return {
        ...elm,
        id: elm.package.name,
        isPublisher: elm.package.publisher.email === 'cavaliere.davide@gmail.com',
        isMaintainer: (elm.package.maintainers as any[]).includes({username: 'davidecavaliere', email: 'cavaliere.davide@gmail.com'}),
      };
    }).sort((a: any, b: any) => {

      return new Date(b.package.date).getTime() - new Date(a.package.date).getTime();
    });

  }

  toggle() {
    this.count$.next();
  }

  private async fetchByMaintainer(text: string): {objects: any[]} {
    const endpoint = `https://registry.npmjs.org/-/v1/search?text=maintainer:${text}`;
    const res = await fetch(endpoint);
    const data = await res.json();
    console.log(data);
    return data;
  }

  private async fetchByKeyword(text: string): {objects: any[]} {
    const endpoint = `https://registry.npmjs.org/-/v1/search?text=${text}`;
    const res = await fetch(endpoint);
    const data = await res.json();
    console.log(data);
    return data;
  }
}
