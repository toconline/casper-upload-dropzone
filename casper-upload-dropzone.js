import { CasperUploadDropzoneErrors } from './casper-upload-dropzone-constants.js';

import '@vaadin/vaadin-upload/vaadin-upload.js';
import '@cloudware-casper/casper-icons/casper-icon.js';
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
       * Specifies the maximum size of each individual file.
       *
       * @type {Number}
       */
      maxFileSize: {
        type: Number,
        value: Infinity
      },
      /**
       * Specifies the maximum size of all the files combined.
       *
       * @type {Number}
       */
      maxFilesTotalSize: {
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
      },
      __rejectedFiles: {
        type: Array,
        value: []
      },
      __requestHeaders: {
        type: Object,
        value: () => ({
          'Content-Disposition': 'form-data',
          'Content-Type': 'application/octet-stream'
        })
      }
    };
  }
  static get template () {
    return html`
      <style>
        :host {
          display: block;
        }

        vaadin-upload {
          width: 100%;
          height: 100%;
          padding: 25px;
          display: flex;
          align-items: center;
          flex-direction: column-reverse;
        }

        vaadin-upload[dragover] {
          border: 2px solid var(--primary-color);
        }

        vaadin-upload[dragover-valid] {
          background: var(--light-primary-color);
          border-color: var(--primary-color);
        }

        vaadin-upload .container {
          width: 100%;
          height: fit-content;
          display: flex;
          align-items: center;
          flex-direction: column;
        }

        vaadin-upload .container .header-icon {
          width: 75px;
          height: 75px;
          color: var(--primary-color);
          @apply --casper-upload-dropzone-header-icon;
        }

        vaadin-upload .container .title-container {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 15px;
          color: var(--primary-color);
          @apply --casper-upload-dropzone-title;
        }

        vaadin-upload .container .sub-title-container {
          color: darkgray;
          margin-bottom: 15px;
          @apply --casper-upload-dropzone-sub-title;
        }

        vaadin-upload casper-button {
          margin: 0;
        }
      </style>

      <vaadin-upload
        id="upload"
        class="casper-upload-dropzone"
        files="{{__files}}"
        accept="[[accept]]"
        target="[[target]]"
        timeout="[[timeout]]"
        nodrop="[[disabled]]"
        headers="[[__requestHeaders]]"
        max-files="[[maxFiles]]"
        max-file-size="[[maxFileSize]]">
        <div class="container">
          <casper-icon class="header-icon" icon="[[headerIcon]]"></casper-icon>

          <!--Title and sub-title-->
          <template is="dom-if" if="[[title]]"><div class="title-container">[[title]]</div></template>
          <template is="dom-if" if="[[subTitle]]"><div class="sub-title-container">[[subTitle]]</div></template>
        </div>

        <casper-button slot="add-button" disabled="[[disabled]]">
          [[addFileButtonText]]
        </casper-button>
      </vaadin-upload>
    `;
  }

  ready () {
    super.ready();

    this.__setupUploadTranslations();

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
   * This method sets up the vaadin-upload translations.
   */
  __setupUploadTranslations () {
    this.$.upload.i18n = {
      ...this.$.upload.i18n,
      dropFiles: {
        one: 'Arraste o ficheiro para aqui',
        many: 'Arraste os ficheiros para aqui',
      },
      error: {
        tooManyFiles: CasperUploadDropzoneErrors.TOO_MANY_FILES,
        fileIsTooBig: CasperUploadDropzoneErrors.FILE_IS_TOO_BIG,
        incorrectFileType: CasperUploadDropzoneErrors.INCORRECT_FILE_TYPE,
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

  __humanReadableExtensions () {
    const mimeTypesExtensions = {
      'application/pdf': '.pdf',
      'application/xml': '.xml',
      'image/jpeg': '.jpg / .jpeg',
      'image/png': '.png',
      'text/html': '.html',
      'text/plain': '.txt',
      'text/xml': '.xml',
    };

    return this.accept
      .split(',')
      .map(extension => extension.trim())
      .map(acceptedMimeType => mimeTypesExtensions[acceptedMimeType]).join(' / ');
  }

  /**
   * This method is called when the user tries to upload an invalid file.
   */
  __onFileReject (event) {
    if (this.__rejectedFilesTimeout) clearTimeout(this.__rejectedFilesTimeout);

    // Push the current rejected file.
    this.__rejectedFiles.push(event.detail);
    this.__rejectedFilesTimeout = setTimeout(() => {
      this.__displayErrors(this.__rejectedFiles.map(rejectedFile => {
        // This means that with this file, the maximum number of allowed ones was surpassed.
        if (rejectedFile.error === CasperUploadDropzoneErrors.TOO_MANY_FILES) {
          return `O ficheiro ${rejectedFile.file.name} foi rejeitado por exceder o máximo de ${this.maxFiles} ficheiro(s).`;
        }

        // This means the file exceeds the maximum allowed size.
        if (rejectedFile.error === CasperUploadDropzoneErrors.FILE_IS_TOO_BIG) {
          return `O ficheiro ${rejectedFile.file.name} foi rejeitado por ter ${this.__bytesToMegabytes(rejectedFile.file.size)}MB quando o limite é ${this.__bytesToMegabytes(this.maxFileSize)}MB.`;
        }

        // This means the file's extension is not accepted.
        if (rejectedFile.error === CasperUploadDropzoneErrors.INCORRECT_FILE_TYPE) {
          return `O ficheiro ${rejectedFile.file.name} foi rejeitado por ser de um tipo inválido. Só pode fazer upload das seguintes extensões - ${this.__humanReadableExtensions()}.`;
        }
      }));

      this.__rejectedFiles = [];
    }, 250);
  }

  /**
   * This method is called when the request is successful and the file was uploaded.
   *
   * @param {Object} event The event's object.
   */
  __onUploadSuccess (event) {
    if (event.detail.xhr.status === 200) {
      this.dispatchEvent(new CustomEvent('on-upload-success', {
        bubbles: true,
        composed: true,
        detail: {
          originalFileName: event.detail.file.name,
          originalFileType: event.detail.file.type,
          uploadedFile: JSON.parse(event.detail.xhr.response).file,
          [this.additionalParamsKey]: event.detail.xhr[this.additionalParamsKey]
        }
      }));
    }
  }

  /**
   * This method is called when the upload component sends the file and we'll add two required headers.
   *
   * @param {Object} event The event's object.
   */
  __onUploadRequest (event) {
    if (!this.additionalParams) return;

    event.preventDefault();
    event.detail.xhr[this.additionalParamsKey] = this.additionalParams;
    event.detail.xhr.send(event.detail.file);
  }

  /**
   * This method converts a value currently in bytes to its equivalent in megabytes.
   *
   * @param {Number} bytes The number of bytes that'll be converted.
   */
  __bytesToMegabytes (bytes) {
    return (bytes / (1024 * 1024)).toFixed(2);
  }

  /**
   * This method displays the errors that occur when the user fails to upload some files.
   *
   * @param {Array} errors The list of errors.
   */
  __displayErrors (errors) {
    const errorsContainer = document.createElement('ul');
    errorsContainer.style.margin = 0;

    errors.forEach(error => {
      const errorContainer = document.createElement('li');
      errorContainer.textContent = error;
      errorsContainer.appendChild(errorContainer);
    });

    this.app.openToast({
      backgroundColor: 'var(--status-red)',
      text: errorsContainer.outerHTML
    });
  }
}

window.customElements.define('casper-upload-dropzone', CasperUploadDropzone);