import { html } from './fx.element';


describe('fx.element', () => {
  it('should pass', () => {
    expect(true).toBeTruthy();
  });

  it('should build import path', () => {

    const name = 'davide';
    const id = 12;
    const items = ['a', 'b', 'c']

    console.log(html`<div id="${id}">
            ${name}
        <ul>
            ${items.map((i) => html`<li>{i}</li>`).join('\n')}
        </ul>
    </div>`);

  });
});
