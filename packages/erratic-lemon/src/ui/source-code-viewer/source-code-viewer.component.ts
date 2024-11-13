import { Component, html, Input } from '@microphi/flux';
import loader from '@monaco-editor/loader';

@Component({
  selector: 'fx-source-code-viewer',
  template: html`
      <style>


        #editor {
          border-radius: 8px;
          border: 1px solid #aeaeae;
          padding: 6px;
          width: 100%;
        }

      </style>

      <div id="editor"></div>


  `
})
export class FxSourceCodeViewer {
  @Input() code!: string;

  constructor(private elm: HTMLElement) {
  }

  fxOnViewInit() {

    //const value = this.code;

    const value = this.elm.firstElementChild?.innerHTML.trim();

    console.log('value to render', value);

    // const codeElm = this.elm.shadowRoot?.querySelector('code');
    // codeElm!.innerHTML = this.escapeHTML(value);

    const editorElm = this.elm.shadowRoot!.getElementById('editor') as HTMLElement;

    loader.init()
      .then((monaco) => {
        // Copy over editor styles
        const style = document.querySelector(
          'link[rel=\'stylesheet\'][data-name=\'vs/editor/editor.main\']'
        );
        this.elm.shadowRoot!.appendChild(style!.cloneNode(true));
        console.log('got monacor editor', monaco);

        // const value = this.elm.getElementsByTagName('textarea').item(0)!.value;
        console.log('value', value);

        // Hover on each property to see its docs!
        const myEditor = monaco.editor.create(editorElm, {
          value,
          language: 'typescript',
          minimap: {enabled: false},

          readOnly: true,
          useShadowDOM: true,
          automaticLayout: true,


          // theme: 'hc-black',

          // automaticLayout: true,
        });
        console.log(myEditor);
      })
      .catch((err) => {
        this.elm.replaceChild(editorElm, document.createElement('slot'));
        console.error('Error loading monaco-editor', err);
      });
  }

  escapeHTML(html: string) {
    return html
      .replace(/&map/g, '&')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

}
