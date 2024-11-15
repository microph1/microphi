import { Component, html, Input } from '@microphi/flux';
import type { editor } from 'monaco-editor';
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
  @Input() isReadOnly = false;

  private editor!: editor.IStandaloneCodeEditor;

  constructor(private elm: HTMLElement) {
  }

  fxOnViewInit() {

    const value = this.elm.firstElementChild?.innerHTML.trim();
    const editorElm = this.elm.shadowRoot!.getElementById('editor') as HTMLElement;

    loader.init()
      .then((monaco) => {
        // Copy over editor styles
        const style = document.querySelector(
          'link[rel=\'stylesheet\'][data-name=\'vs/editor/editor.main\']'
        );
        this.elm.shadowRoot!.appendChild(style!.cloneNode(true));

        this.editor = monaco.editor.create(editorElm, {
          value,
          language: 'typescript',
          minimap: {enabled: false},

          readOnly: this.isReadOnly,
          useShadowDOM: true,
          automaticLayout: true,
          lineNumbers: 'off',
          theme: 'vs-dark',
        });


        this.editor.onDidChangeModel((e) => {
          console.log(e);
        });

        this.editor.onDidChangeModelContent((e) => {
          console.log(e);
        });

      })
      .catch((err) => {
        this.elm.replaceChild(editorElm, document.createElement('slot'));
        console.error('Error loading monaco-editor', err);
      });
  }

}
