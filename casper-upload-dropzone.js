import { VaadinUploadMixin } from './mixins/vaadin-upload-mixin.js';
import { PointerEventsMixin } from './mixins/pointer-events-mixin.js';

import '@polymer/paper-ripple/paper-ripple.js';
import '@vaadin/vaadin-upload/vaadin-upload.js';
import '@cloudware-casper/casper-icons/casper-icon.js';
import '@cloudware-casper/casper-button/casper-button.js';
import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';

class CasperUploadDropzone extends PointerEventsMixin(VaadinUploadMixin(PolymerElement)) {

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
       * Additional parameters that will be included on the XMLHttpRequest.
       *
       * @type {Object}
       */
      additionalParams: {
        type: Object
      },
      /**
       * The XHR property in which we'll save the aforementioned additional parameters.
       *
       * @type {String}
       */
      additionalParamsKey: {
        type: String,
        value: 'additionalParams'
      },
      /**
       * The app's global object.
       *
       * @type {Object}
       */
      app: {
        type: Object,
        value: () => { return window.app; }
      },
      /**
       * Flag that enables / disables the upload component.
       *
       * @type {Boolean}
       */
      disabled: {
        type: Boolean,
        reflectToAttribute: true,
        observer: '__disabledChanged'
      },
      /**
       * Specifies the maximum number of files.
       *
       * @type {Number}
       */
      maxFiles: {
        type: Number,
        value: Infinity
      },
      /**
       * The URL where the files will be uploaded.
       *
       * @type {String}
       */
      target: {
        type: String
      },
      /**
       * Maximum time in milliseconds to upload the file.
       *
       * @type {Number}
       */
      timeout: {
        type: Number
      },
      /**
       * The flag that states if the maximum number of files was reached or not.
       *
       * @type {Boolean}
       */
      __maxFilesReached: {
        type: Boolean,
        observer: '__maxFilesReachedChanged'
      }
    };
  }
  static get template () {
    return html`
      <style>
        :host {
          height: 100%;
          padding: 25px;
          display: block;
          overflow: auto;
          position: relative;
          border: 1px dashed var(--primary-color);
        }

        :host([dragover]) {
          border: 1px solid var(--primary-color);
          background-color: var(--light-primary-color);
        }

        :host([dragover]) * {
          pointer-events: none;
        }

        #container {
          display: flex;
          position: relative;
          align-items: center;
          flex-direction: column;
          justify-content: center;
        }

        #container #ripple {
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          position: absolute;
        }

        #container #header-icon {
          width: 100px;
          height: 100px;
          color: var(--primary-color);
        }

        #container #upload {
          display: flex;
          width: 100%;
          align-items: center;
          flex-direction: column;
        }

        #container #upload casper-button {
          margin: 0;
        }

        #container .help {
          color: #929292;
          display: flex;
          align-items: center;
        }

        #container .help casper-icon {
          width: 25px;
          height: 25px;
          margin-right: 5px;
        }
      </style>

      <paper-ripple id="ripple"></paper-ripple>

      <div id="container">
        <casper-icon id="header-icon" icon="fa-light:cloud-upload"></casper-icon>

        <vaadin-upload
          id="upload"
          class="casper-upload-dropzone"
          nodrop
          accept="[[accept]]"
          target="[[target]]"
          timeout="[[timeout]]"
          max-files="[[maxFiles]]"
          max-files-reached="{{__maxFilesReached}}">
          <casper-button slot="add-button" disabled="[[disabled]]">
            [[addButtonText]]
          </casper-button>
        </vaadin-upload>

        <div class="help">
          <casper-icon icon="fa-light:info-circle"></casper-icon>
          [[__displaySupportedExtensions(accept, maxFiles)]]
        </div>
      </div>
    `;
  }

  ready () {
    super.ready();

    this.__setupUploadTranslations();

    this.shadowRoot.host.addEventListener('drop', event => this.__onDrop(event));
    this.shadowRoot.host.addEventListener('dragenter', () => this.__onDragEnter());
    this.shadowRoot.host.addEventListener('dragover', event => this.__onDragOver(event));
    this.shadowRoot.host.addEventListener('dragleave', event => this.__onDragLeave(event));

    this.$.upload.addEventListener('file-reject', event => this.__onFileReject(event));
    this.$.upload.addEventListener('upload-success', event => this.__onUploadSuccess(event));
    this.$.upload.addEventListener('upload-success', event => this.__onUploadSuccess(event));
  }

  /**
   * This method clears all the files from the dropzone.
   */
  clearFiles () {
    this.$.upload.files = [];
  }

  /**
   * This method is called when the maximum number of files is reached or not.
   */
  __maxFilesReachedChanged () {
    this.disabled = this.__maxFilesReached;
  }

  /**
   * Displays a helper text which lists the allowed file extensions.
   */
  __displaySupportedExtensions () {
    const mimeTypesExtensions = {
      'application/pdf': '.pdf',
      'application/xml': '.xml',
      'image/jpeg': '.jpg / .jpeg',
      'image/png': '.png',
      'text/html': '.html',
      'text/xml': '.xml',
    };

    const acceptedExtensions = [...new Set(this.accept.split(',').map(mimeType => mimeTypesExtensions[mimeType.trim()]))].join(' / ');

    return this.maxFiles === Infinity
      ? `Pode fazer upload de ficheiros com as seguintes extensões: ${acceptedExtensions}`
      : `Pode fazer upload de ${this.maxFiles} ficheiro(s) com as seguintes extensões: ${acceptedExtensions}`;
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