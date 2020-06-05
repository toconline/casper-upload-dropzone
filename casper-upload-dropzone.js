import { VaadinUploadMixin } from './mixins/vaadin-upload-events-mixin.js';
import { CasperUploadDropzoneErrors } from './casper-upload-dropzone-constants.js';

import '@vaadin/vaadin-upload/vaadin-upload.js';
import '@cloudware-casper/casper-icons/casper-icon.js';
import '@cloudware-casper/casper-button/casper-button.js';
import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';

class CasperUploadDropzone extends VaadinUploadMixin(PolymerElement) {

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
      additionalParams: Object,
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
       * Function that will be invoked before uploading a file to allow some extra validations.
       *
       * @type {Function}
       */
      beforeUploadValidator: Function,
      /**
       * Flag that enables / disables the upload component.
       *
       * @type {Boolean}
       */
      disabled: Boolean,
      /**
       * The list of files that are in the upload component.
       *
       * @type {Array}
       */
      files: {
        type: Array,
        notify: true
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
       * This flag prevents the user of uploading the same file twice.
       *
       * @type {Boolean}
       */
      noRepeatedFiles: Boolean,
      /**
       * The component's sub title.
       *
       * @type {String}
       */
      subTitle: String,
      /**
       * The URL where the files will be uploaded.
       *
       * @type {String}
       */
      target: String,
      /**
       * Maximum time in milliseconds to upload the file.
       *
       * @type {Number}
       */
      timeout: Number,
      /**
       * The component's title.
       *
       * @type {String}
       */
      title: String,
      /**
       * The list of errors that will eventually be displayed.
       *
       * @type {Array}
       */
      __errors: {
        type: Array,
        value: () => []
      },
      /**
       * A flag which states if the component has reached the maximum number of files.
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
        vaadin-upload {
          width: 100%;
          height: 100%;
          padding: 0 25px;
          display: flex;
          overflow-y: auto;
          overflow-x: hidden;
          box-sizing: border-box;
          flex-direction: column-reverse;
          justify-content: space-between;
          @apply --casper-upload-dropzone-vaadin-upload;
        }

        vaadin-upload[nodrop] {
          border: 2px dashed var(--disabled-background-color);
        }

        vaadin-upload:not([nodrop]) {
          border: 2px dashed var(--primary-color);
        }

        vaadin-upload[dragover] {
          border: 2px solid var(--primary-color);
        }

        vaadin-upload[dragover-valid] {
          background: var(--light-primary-color);
          border-color: var(--primary-color);
        }

        vaadin-upload .container {
          display: flex;
          align-items: center;
          flex-direction: column;
          @apply --casper-upload-dropzone-container;
        }

        vaadin-upload .container .header-icon {
          width: 100px;
          height: 100px;
          color: var(--primary-color);
          @apply --casper-upload-dropzone-header-icon;
        }

        vaadin-upload .container .title-container,
        vaadin-upload .container .sub-title-container {
          text-align: center;
          margin-bottom: 15px;
        }

        vaadin-upload .container .title-container {
          font-size: 20px;
          font-weight: bold;
          color: var(--primary-color);
          @apply --casper-upload-dropzone-title;
        }

        vaadin-upload .container .sub-title-container {
          color: darkgray;
          @apply --casper-upload-dropzone-sub-title;
        }

        vaadin-upload .container casper-notice {
          width: 100%;
          margin-bottom: 20px;
          @apply --casper-upload-dropzone-notice;
        }

        vaadin-upload .container casper-notice * {
          margin: 0;
          padding: 0;
        }

        vaadin-upload casper-button {
          margin: 0;
          width: 100%;
          @apply --casper-upload-dropzone-button;
        }
      </style>

      <vaadin-upload
        id="upload"
        class="casper-upload-dropzone"
        form-data-name="my-attachment"
        files="{{files}}"
        accept="[[accept]]"
        target="[[target]]"
        timeout="[[timeout]]"
        nodrop="[[disabled]]"
        max-files="[[maxFiles]]"
        max-file-size="[[maxFileSize]]"
        max-files-reached="{{__maxFilesReached}}">
        <div class="container">
          <casper-icon class="header-icon" icon="[[headerIcon]]"></casper-icon>

          <!--Title and sub-title-->
          <template is="dom-if" if="[[title]]"><div class="title-container">[[title]]</div></template>
          <template is="dom-if" if="[[subTitle]]"><div class="sub-title-container">[[subTitle]]</div></template>

          <casper-notice title="Informação">
            <ul>
              <li>[[__maxFilesInfo(maxFiles)]]</li>
              <li>[[__maxFileSizeInfo(maxFileSize)]]</li>
              <li>[[__maxFileTotalSizeInfo(maxFilesTotalSize)]]</li>
              <li>[[__acceptInfo(accept)]]</li>
            </ul>
          </casper-notice>

          <casper-button disabled="[[disabled]]" on-click="__onAddFilesClick">
            [[addFileButtonText]]
          </casper-button>
        </div>
      </vaadin-upload>
    `;
  }

  ready () {
    super.ready();

    this.__setupUploadTranslations();

    this.$.upload.addEventListener('file-reject', event => this.__onFileReject(event));
    this.$.upload.addEventListener('upload-before', event => this.__onUploadBefore(event));
    this.$.upload.addEventListener('upload-request', event => this.__onUploadRequest(event));
    this.$.upload.addEventListener('upload-success', event => this.__onUploadSuccess(event));
  }

  /**
   * This method clears all the files from the dropzone.
   */
  clearUploadedFiles () {
    this.files = [];
  }

  /**
   * This method is invoked when the used clicks on the add files button.
   */
  __onAddFilesClick () {
    if (this.disabled) return;

    this.$.upload.$.fileInput.value = '';
    this.$.upload.$.fileInput.click();
  }

  /**
   * This method get invoked when the maximum number of files is reached.
   */
  __maxFilesReachedChanged () {
    this.disabled = this.__maxFilesReached;
  }

  /**
   * This method displays the maximum size for each uploaded file.
   */
  __maxFileSizeInfo () {
    return this.maxFileSize === Infinity
      ? 'Não existe limite para o tamanho de cada ficheiro.'
      : `Cada ficheiro tem que ter no máximo um tamanho de ${this.__bytesToMegabytes(this.maxFileSize)}MB.`;
  }

  /**
   * This method displays the maximum number of files which can be uploaded.
   */
  __maxFilesInfo () {
    return this.maxFiles === Infinity
      ? 'Não existe limite para o número de ficheiros.'
      : `Só pode fazer upload de ${this.maxFiles} ficheiro(s).`;
  }

  /**
   * This method displays the extensions that can be uploaded.
   */
  __acceptInfo () {
    return `Pode fazer upload de ficheiros com a seguinte extensão: ${this.__humanReadableExtensions()}.`;
  }

  /**
   * This method displays the maximum size for all the files that were uploaded.
   */
  __maxFileTotalSizeInfo () {
    return this.maxFilesTotalSize === Infinity
      ? 'Não existe limite para a soma total do tamanho dos ficheiros.'
      : `A soma total dos ficheiros carregados não pode ultrapassar os ${this.__bytesToMegabytes(this.maxFilesTotalSize)}MB.`;
  }

  /**
   * This method returns the allowed extensions in an understandable way.
   */
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
   * This method converts a value currently in bytes to its equivalent in megabytes.
   *
   * @param {Number} bytes The number of bytes that'll be converted.
   */
  __bytesToMegabytes (bytes) {
    return (bytes / (1024 * 1024)).toFixed(2);
  }

  /**
   * This method displays the errors that occur when the user fails to upload some files.
   */
  __displayErrors () {
    if (this.__displayErrorsTimeout) clearTimeout(this.__displayErrorsTimeout);

    this.__displayErrorsTimeout = setTimeout(() => {
      // Open the application's toast displaying why certain files were rejected.
      this.app.openToast({
        duration: 10000,
        text: this.__errors.join('<br />'),
        backgroundColor: 'var(--status-red)',
      });

      // Clear the errors so they do not get displayed again.
      this.__errors = [];
    }, 250);
  }
}

window.customElements.define('casper-upload-dropzone', CasperUploadDropzone);