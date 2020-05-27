import '@vaadin/vaadin-upload/vaadin-upload.js';
import '@cloudware-casper/casper-button/casper-button.js';
import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';

class CasperUploadDropzone extends PolymerElement {


  static get properties () {
    return {
      /**
       * Specifies which type of files can be uploaded.
       *
       * @type {String}
       */
      accept: {
        type: String,
        value: 'image/jpeg, image/png, application/pdf'
      },
      /**
       * The add button's text.
       *
       * @type {String}
       */
      addButtonText: {
        type: String,
        value: 'Carregar ficheiros'
      },
      /**
       * Flag that enables / disables the upload component.
       *
       * @type {Boolean}
       */
      disabled: {
        type: Boolean,
        observer: '__disabledChanged'
      },
      /**
       * Specifies the maximum number of files.
       *
       * @type {Number}
       */
      maxFiles: {
        type: Number,
        value: 1
      },
      /**
       * Flag that enables / disables the component's drop behavior.
       *
       * @type {Boolean}
       */
      noDrop: {
        type: Boolean
      },
      /**
       * The URL where the files will be uploaded.
       *
       * @type {String}
       */
      target: {
        type: String
      },
      __maxFilesReached: {
        type: Boolean,
        observer: '__maxFilesReachedChanged'
      }
    };
  }
  static get template () {
    return html`
      <vaadin-upload
        id="upload"
        accept="[[accept]]"
        target="[[target]]"
        nodrop="[[noDrop]]"
        max-files="[[maxFiles]]"
        max-files-reached="{{__maxFilesReached}}">
        <casper-button slot="add-button" disabled="[[disabled]]">
          [[addButtonText]]
        </casper-button>
      </vaadin-upload>
    `;
  }

  ready () {
    super.ready();

    this.__setupUploadTranslations();
  }

  /**
   * This method is called when the disabled property changes.
   *
   * @param {Boolean} disabled The current disabled property value.
   */
  __disabledChanged (disabled) {
    this.noDrop = disabled;
  }

  __maxFilesReachedChanged (maxFilesReached) {
    this.disabled = maxFilesReached;
  }

  /**
   * This method sets up the vaadin-upload translations.
   */
  __setupUploadTranslations () {
    this.$.upload.i18n = {
      ...this.$.upload.i18n,
      dropFiles: {
        one: 'Arraste o ficheiro para aqui',
        many: 'Arraste os ficheiros para aqui',
      },
      uploading: {
        status: {
          held: 'Em fila',
          stalled: 'Upload pausado',
          connecting: 'A conectar ao servidor...',
          processing: 'A fazer upload do ficheiro...',
        },
        error: {
          forbidden: 'Servidor indisponível',
          serverUnavailable: 'Servidor indisponível',
          unexpectedServerError: 'Ocorreu um erro inesperado no servidor',
        },
        remainingTime: {
          prefix: 'Tempo restante: ',
          unknown: 'Tempo restante desconhecido'
        }
      }
    };
  }
}

window.customElements.define('casper-upload-dropzone', CasperUploadDropzone);