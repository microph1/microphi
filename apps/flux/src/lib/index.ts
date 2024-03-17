// class WordCount extends HTMLElement {
//   elm = document.createElement('slot');
//   listeners;
//   template;
//
//   get counter() {
//     return parseInt(this.elm.innerHTML) || 0;
//   }
//
//   set counter(value) {
//     this.elm.innerHTML = `${value}`;
//   }
//
//   constructor() {
//     // Always call super first in constructor
//     super();
//
//     // Element functionality written in here
//     console.log('creating new', this);
//     this.attachShadow({ mode: 'open' });
//     // console.log(this.);
//   }
//
//   connectedCallback() {
//     this.elm.addEventListener('slotchange', () => {
//       const nodes = this.elm.assignedNodes();
//       console.log('slot changed to', nodes[0].textContent);
//       this.template = nodes[0].textContent;
//
//       nodes[0].textContent = this.template.replace('[[counter]]', this.counter);
//     });
//     // this.elm.innerHTML = `
//     //     <slot></slot>
//     // `;
//
//     console.log(this.elm);
//     this.shadowRoot.appendChild(this.elm);
//     // this.setAttribute("id", this.id);
//
//     // this.addEventListener("onClick", () => console.log("clicked"));
//
//     // this.shadowRoot.appendChild(template.content.cloneNode(true));
//     // this.shadowRoot.getElementById("inc").onclick = () => this.inc();
//     // this.shadowRoot.getElementById("dec").onclick = () => this.dec();
//     // this.update(this.count);
//     console.log('element connected', this);
//
//     // get updates when content is updated in the slot
//   }
//
//   disconnectedCallback() {
//     // this.listeners.forEach(removeFunc => removeFunc());
//   }
//
//   count(e) {
//     console.log({e});
//     console.log('counting', ++this.counter);
//     console.log(e.target);
//     const nodes = this.elm.assignedNodes();
//
//     nodes[0].textContent = this.template.replace('[[counter]]', this.counter);
//   }
// }
//
// customElements.define('word-count', WordCount);
