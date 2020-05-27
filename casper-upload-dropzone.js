import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

/**
 * `casper-upload-dropzone`
 * 
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class CasperUploadDropzone extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      <h2>Hello [[prop1]]!</h2>
    `;
  }
  static get properties() {
    return {
      prop1: {
        type: String,
        value: 'casper-upload-dropzone',
      },
    };
  }
}

window.customElements.define('casper-upload-dropzone', CasperUploadDropzone);
