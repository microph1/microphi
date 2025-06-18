import { Component, css, FxElement, OnViewInit } from '@microphi/flux';
import { EMPTY, interval, scan, Subject, switchMap } from 'rxjs';
import { projects } from '../../projects';
import { FxOverlayComponent } from '../fx-overlay/fx-overlay.component';
import templateUrl from './fx-root.component.html?url';
type Directive = (this: FxRootComponent, elm: HTMLElement) => void;

export const directives: {[name: string]: Directive} = {};

export function registerDirective(name: string, cb: Directive) {
  directives[name] = cb;
}


@Component({
  selector: 'fx-root',
  templateUrl,
  style: css`
    :host {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      gap: 12px;
    }

    .container {
      max-width: 1600px;
      margin: 0 auto;
    }


  `,
})
export class FxRootComponent implements OnViewInit {

  timer = 0;

  count$ = new Subject<void>();

  projects = projects;
  heimdall = projects.heimdall;
  automation = projects.automation;
  lasso = projects['2Lasso'];
  drD = projects['drD'];
  easytest = projects['Easytest'];

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

    const originalPushState = history.pushState;
    history.pushState = function (...args) {
      const result = originalPushState.apply(this, args);
      window.dispatchEvent(new Event('urlchange'));
      return result;
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = function (...args) {
      const result = originalReplaceState.apply(this, args);
      window.dispatchEvent(new Event('urlchange'));
      return result;
    };

    window.addEventListener('urlchange', () => {
      console.log('URL changed to:', location.href);
    });

  }

  async fxOnViewInit() {
    this.elm.shadowRoot!.addEventListener('click', (event) => {
      // Check if the clicked element is an <a> element
      const target = event.target;
      if (target instanceof HTMLAnchorElement && target.tagName === 'A' && target.href) {
        event.preventDefault(); // Prevent the default browser navigation
        console.log('Intercepted link click:', target.href);

        // Handle the custom logic for navigation here
        // For example, update the URL using the History API
        history.pushState(null, '', target.href);

        // Trigger any additional logic (e.g., re-rendering a section)
      }
    });

    registerDirective('fx-focus', (elm: HTMLElement) => {


      setTimeout(() => {

        elm.scrollIntoView({
          behavior: 'smooth',
        });
      }, 100);

    });

    registerDirective('fx-parallax', (elm: HTMLElement) => {
      //console.log('I do my thing in the House', elm);
      const parent: HTMLElement = document.body;

      // makes it a bit smoother
      //elm.style.setProperty('transition', 'background-position-y 0.1s linear');

      parent.addEventListener('scroll', () => {

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
            //console.log('Element is visible!', entry.target);
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

    const header = this.elm.shadowRoot!.querySelector('header > div') as HTMLElement;
    document.body.addEventListener('scroll', () => {

      const scroll = document.body.scrollTop;
      const scrollMax = document.body.scrollHeight;

      // 1:percent = scrollMax:scroll
      const percent = (scroll) / scrollMax;

      header!.style.backgroundColor = `rgba(0,0,0, ${percent})`;
      header!.style.backdropFilter = `blur(${2 * percent}px)`;
    });
  }

  toggle() {
    this.count$.next();
  }

  scrollTo(id: string) {
    const elm = this.elm.shadowRoot!.getElementById(id);

    document.body.scrollTo({
      top: elm!.offsetTop - 80,
      behavior: 'smooth',
    });
  }

  openScreenshots(overlayElement: FxElement<FxOverlayComponent>) {
    console.log('should open screenshots for', overlayElement);

    overlayElement.controller.show();
  }
}
