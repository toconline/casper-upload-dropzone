import '@polymer/paper-ripple/paper-ripple.js';
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
        type: Number
      },
      /**
       * Flag that enables / disables the component's drop behavior.
       *
       * @type {Boolean}
       */
      nodrop: {
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
        casper-button {
          margin: 0;
        }

        #upload {
          padding: 8px;
        }

        :host(:not([disabled])) #upload {
          border: 1px solid #CCCCCC;
        }

        :host(:not([disabled])) #upload[dragover] {
          border: 1px solid var(--primary-color);
        }

        :host([disabled]) #upload {
          border: 1px dashed #CCCCCC;
        }
      </style>
      <vaadin-upload
        id="upload"
        accept="[[accept]]"
        target="[[target]]"
        nodrop="[[nodrop]]"
        timeout="[[timeout]]"
        max-files="[[maxFiles]]"
        max-files-reached="{{__maxFilesReached}}">
        <casper-button slot="add-button" disabled="[[disabled]]">
          [[addButtonText]]
        </casper-button>
        <paper-ripple id="ripple"></paper-ripple>

        [[__displaySupportedExtensions(accept)]]
      </vaadin-upload>
    `;
  }

  ready () {
    super.ready();
    window.upload = this;
    this.__setupUploadTranslations();

    this.$.upload.addEventListener('dragleave', () => this.__onDragLeave());
    this.$.upload.addEventListener('dragenter', () => this.__onDragEnter());
    this.$.upload.addEventListener('upload-before', () => this.__onUploadBefore());
    this.$.upload.addEventListener('upload-request', event => this.__onUploadRequest(event));
    this.$.upload.addEventListener('upload-success', event => this.__onUploadSuccess(event));
  }

  /**
   * This method clears all the files from the dropzone.
   */
  clearFiles () {
    this.$.upload.files = [];
  }

  /**
   * This method is called just before the upload begins.
   */
  __onUploadBefore () {
    this.$.ripple.upAction();
  }

  /**
   * This method is called when the request is successful and the file was uploaded.
   *
   * @param {Object} event The event's object.
   */
  __onUploadSuccess (event) {
    this.dispatchEvent(new CustomEvent('on-upload-success', {
      bubbles: true,
      composed: true,
      detail: {
        ...JSON.parse(event.detail.xhr.response),
        [this.additionalParamsKey]: event.detail.xhr[this.additionalParamsKey]
      }
    }));
  }

  /**
   * This method is called when the upload component sends the file and we'll add two required headers.
   *
   * @param {Object} event The event's object.
   */
  __onUploadRequest (event) {
    event.preventDefault();

    // If the developer specified additional params, include them in the XMLHttpRequest.
    if (this.additionalParams) event.detail.xhr[this.additionalParamsKey] = this.additionalParams;

    event.detail.xhr.setRequestHeader('Content-Disposition', 'form-data');
    event.detail.xhr.setRequestHeader('Content-Type', 'application/octet-stream');
    event.detail.xhr.send(event.detail.file);
  }

  /**
   * This method is called when the user enters the dropzone with a file.
   */
  __onDragEnter () {
    this.$.ripple.downAction();
  }

  /**
   * This method is called when the user leaves the dropzone with a file.
   */
  __onDragLeave () {
    this.$.ripple.upAction();
  }

  /**
   * This method is called when the disabled property changes.
   */
  __disabledChanged (disabled) {
    this.nodrop = this.disabled;
  }

  /**
   * This method is called when the maximum number of files is reached or not.
   */
  __maxFilesReachedChanged () {
    this.disabled = this.__maxFilesReached;
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

    const acceptedExtensions = this.accept.split(',').map(mimeType => mimeTypesExtensions[mimeType.trim()]);

    return `Os ficheiros suportados são os seguintes: ${[...new Set(acceptedExtensions)].join(' / ')}`;
  }
}

window.customElements.define('casper-upload-dropzone', CasperUploadDropzone);