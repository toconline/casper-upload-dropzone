import { VaadinUploadMixin } from './mixins/vaadin-upload-mixin.js';
import { PointerEventsMixin } from './mixins/pointer-events-mixin.js';

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
        value: 'image/jpeg, image/png, application/pdf',
        observer: '__acceptChanged'
      },
      /**
       * The add button's text.
       *
       * @type {String}
       */
      addFileButtonText: {
        type: String,
        value: 'Carregar ficheiro(s)'
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
        reflectToAttribute: true
      },
      /**
       * The component's header icon.
       *
       * @type {String}
       */
      headerIcon: {
        type: String,
        value: 'fa-light:cloud-upload'
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
       * The component's sub title.
       *
       * @type {String}
       */
      subTitle: {
        type: String,
        value: 'Subtítulo'
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
       * The component's title.
       *
       * @type {String}
       */
      title: {
        type: String,
        value: 'Título'
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

        :host([disabled]) {
          border: 1px dashed var(--disabled-background-color);
        }

        :host([dragover]) {
          border: 1px solid var(--primary-color);
          background-color: var(--light-primary-color);
        }

        :host([dragover]) * {
          pointer-events: none;
        }

        #ripple {
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          position: absolute;
        }

        .container {
          display: flex;
          position: relative;
          align-items: center;
          flex-direction: column;
          justify-content: center;
        }

        .container .header-icon {
          margin-bottom: 25px;
          width: var(--casper-upload-dropzone-icon-size, 75px);
          height: var(--casper-upload-dropzone-icon-size, 75px);
          color: var(--casper-upload-dropzone-color, var(--primary-color));
        }

        :host([disabled]) .container .header-icon,
        :host([disabled]) .container .title-container {
          color: var(--casper-upload-dropzone-disabled-color, var(--disabled-text-color));
        }

        .container .title-container {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 15px;
          color: var(--casper-upload-dropzone-color, var(--primary-color));
        }

        .container .sub-title-container {
          color: darkgray;
          margin-bottom: 15px;
        }

        .container #upload {
          display: flex;
          width: 100%;
          padding: 0;
          align-items: center;
          flex-direction: column;
        }

        .container #upload casper-button {
          margin: 0;
        }

        .container .upload-info {
          color: #929292;
          font-size: 0.9em;
          display: flex;
          margin-top: 25px;
          align-items: center;
        }

        .container .upload-info casper-icon {
          width: 25px;
          height: 25px;
          margin-right: 5px;
        }
      </style>

      <div class="container">
        <casper-icon class="header-icon" icon="[[headerIcon]]"></casper-icon>

        <!--Title and sub-title-->
        <template is="dom-if" if="[[title]]"><div class="title-container">[[title]]</div></template>
        <template is="dom-if" if="[[subTitle]]"><div class="sub-title-container">[[subTitle]]</div></template>

        <vaadin-upload
          id="upload"
          class="casper-upload-dropzone"
          nodrop
          files="{{__files}}"
          accept="[[accept]]"
          target="[[target]]"
          timeout="[[timeout]]"
          max-files="[[maxFiles]]"
          max-files-reached="{{__maxFilesReached}}">
          <casper-button slot="add-button" disabled="[[disabled]]">
            [[addFileButtonText]]
          </casper-button>
        </vaadin-upload>

        <div class="upload-info">
          <casper-icon icon="fa-light:info-circle"></casper-icon>
          [[__supportedExtensions(accept, maxFiles)]]
        </div>
      </div>
    `;
  }

  ready () {
    super.ready();

    this.__setupUploadTranslations();

    this.shadowRoot.host.addEventListener('drop', event => this.__onDrop(event));
    this.shadowRoot.host.addEventListener('dragover', event => this.__onDragOver(event));
    this.shadowRoot.host.addEventListener('dragenter', event => this.__onDragEnter(event));
    this.shadowRoot.host.addEventListener('dragleave', event => this.__onDragLeave(event));

    this.$.upload.addEventListener('file-reject', event => this.__onFileReject(event));
    this.$.upload.addEventListener('upload-request', event => this.__onUploadRequest(event));
    this.$.upload.addEventListener('upload-success', event => this.__onUploadSuccess(event));
  }

  /**
   * This method clears all the files from the dropzone.
   */
  clearUploadedFiles () {
    this.$.upload.files = [];
  }

  /**
   * This method saves the accepted extensions in an array.
   */
  __acceptedExtensions () {
    return this.accept.split(',').map(extension => extension.trim());
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
  __supportedExtensions () {
    const mimeTypesExtensions = {
      'application/pdf': '.pdf',
      'application/xml': '.xml',
      'image/jpeg': '.jpg / .jpeg',
      'image/png': '.png',
      'text/html': '.html',
      'text/plain': '.txt',
      'text/xml': '.xml',
    };

    const acceptedExtensions = [...new Set(this.__acceptedExtensions().map(mimeType => mimeTypesExtensions[mimeType]))].join(' / ');

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