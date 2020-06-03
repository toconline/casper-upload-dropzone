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
       * The file properties that should be included in the response.
       *
       * @type {Array}
       */
      responseFileProperties: {
        type: Array,
        value: []
      },
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
        value: []
      },
      /**
       * The list of files that are in the upload component.
       *
       * @type {Array}
       */
      __files: Array,
      /**
       * The list of headers that will be sent on every request.
       *
       * @type {Object}
       */
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
    this.$.upload.addEventListener('upload-before', event => this.__onUploadBefore(event));
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
   * This method returns the allowwd extensions in an understandable way.
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
        text: this.__errors.join('<br />'),
        backgroundColor: 'var(--status-red)',
        duration: 5000 * this.__errors.length
      });

      // Clear the errors so they do not get displayed again.
      this.__errors = [];
    }, 250);
  }
}

window.customElements.define('casper-upload-dropzone', CasperUploadDropzone);