import { VaadinUploadMixin } from './mixins/vaadin-upload-events-mixin.js';
import { CasperUploadDropzoneHelpersMixin } from './mixins/casper-upload-dropzone-helpers-mixin.js';

import '@vaadin/vaadin-upload/vaadin-upload.js';
import '@cloudware-casper/casper-icons/casper-icon.js';
import '@cloudware-casper/casper-button/casper-button.js';
import '@cloudware-casper/casper-notice/casper-notice.js';
import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';

class CasperUploadDropzone extends CasperUploadDropzoneHelpersMixin(VaadinUploadMixin(PolymerElement)) {

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
      disabled: {
        type: Boolean,
        observer: '__updateDisabledState'
      },
      /**
       * The text indicating the user can drag the files into the dropzone.
       *
       * @type {String}
       */
      dragFileText: {
        type: String,
        value: 'Arraste os ficheiros para aqui'
      },
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
       * The property which specifies the form data name.
       *
       * @type {String}
       */
      formDataName: {
        type: String,
        value: 'my-attachment'
      },
      /**
       * The component's header icon.
       *
       * @type {String}
       */
      icon: {
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
        value: () => { return window.app.uploadMaxFileSize; },
        observer: '__maxFileSizeChanged'
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
       * This flag if set to true only shows the button and drop label.
       *
       * @type {Boolean}
       */
      minimalist: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
      },
      /**
       * This flag prevents the user of uploading the same file twice.
       *
       * @type {Boolean}
       */
      noDuplicates: Boolean,
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
      target: {
        type: String,
        value: () => { return window.app.uploadUrl; }
      },
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
       * This property contains the current list of files that were successfully uploaded.
       *
       * @type {Array}
       */
      uploadedFiles: {
        type: Array,
        value: () => [],
        notify: true
      },
      /**
       * This flag states if the component is currently uploading any file.
       *
       * @type {Boolean}
       */
      uploading: {
        type: Boolean,
        value: false,
        notify: true
      },
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
        observer: '__updateDisabledState'
      },
      /**
       * The error message that will be used when the user can't upload more files due to reaching its digital archive space.
       *
       * @type {String}
       */
      __noSpaceErrorMessage: {
        type: String,
        value: 'Não dispõe de espaço para arquivar novos ficheiros. Por favor fale com o responsável da empresa.'
      }
    };
  }

  static get template () {
    return html`
      <style>
        :host {
          width: 100%;
          height: 100%;
          display: block;
        }

        vaadin-upload {
          width: 100%;
          height: 100%;
          padding: 15px;
          display: flex;
          overflow: auto;
          box-sizing: border-box;
          flex-direction: column;
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

        :host([minimalist]) vaadin-upload {
          justify-content: center;
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
          margin-bottom: 15px;
          color: var(--primary-color);
          @apply --casper-upload-dropzone-header-icon;
        }

        vaadin-upload .container .title-container {
          font-size: 18px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 15px;
          color: var(--primary-color);
          @apply --casper-upload-dropzone-title;
        }

        vaadin-upload .container .sub-title-container {
          color: darkgray;
          text-align: center;
          margin-bottom: 15px;
          @apply --casper-upload-dropzone-sub-title;
        }

        vaadin-upload .container casper-notice {
          width: 100%;
          margin-bottom: 15px;
          @apply --casper-upload-dropzone-notice;
        }

        vaadin-upload .container casper-notice ul {
          margin: 0;
          padding-left: 20px;
          @apply --casper-upload-dropzone-notice-list;
        }

        vaadin-upload .container casper-button {
          width: 100%;
          margin: 0 0 15px 0;
          @apply --casper-upload-dropzone-button;
        }

        :host([minimalist]) vaadin-upload .container casper-button {
          width: 75%;
        }

        vaadin-upload .container .drop-label {
          display: flex;
          color: darkgray;
          align-items: center;
          @apply --casper-upload-dropzone-drop-label;
        }

        vaadin-upload .container .drop-label casper-icon {
          margin-right: 15px;
        }
      </style>

      <vaadin-upload
        id="upload"
        class="casper-upload-dropzone"
        files="{{__files}}"
        accept="[[accept]]"
        target="[[target]]"
        timeout="[[timeout]]"
        nodrop="[[__disabled]]"
        max-files="[[maxFiles]]"
        max-file-size="[[maxFileSize]]"
        max-files-reached="{{__maxFilesReached}}"
        form-data-name="[[formDataName]]">
        <div class="container">
          <template is="dom-if" if="[[!minimalist]]">
            <!--Header icon-->
            <casper-icon class="header-icon" icon="[[icon]]"></casper-icon>

            <!--Title and sub-title-->
            <template is="dom-if" if="[[title]]"><div class="title-container" inner-h-t-m-l="[[title]]"></div></template>
            <template is="dom-if" if="[[subTitle]]"><div class="sub-title-container"inner-h-t-m-l="[[subTitle]]"></div></template>

            <!--Upload information-->
            <casper-notice title="Informação">
              <ul>[[__displayUploadInfo(maxFiles, maxFileSize, maxFilesTotalSize, accept)]]</ul>
            </casper-notice>
          </template>

          <casper-button disabled="[[__disabled]]" on-click="__onAddFilesClick">
            [[__addFileButtonText(maxFiles, addFileButtonText)]]
          </casper-button>

          <div class="drop-label" disabled$="[[__disabled]]">
            <casper-icon icon="fa-solid:upload"></casper-icon>
            [[dragFileText]]
          </div>
        </div>
      </vaadin-upload>
    `;
  }

  static get observers () {
    return [
      '__filesChanged(__files.splices)'
    ];
  }

  ready () {
    super.ready();

    this.__setupUploadTranslations();

    this.$.upload.addEventListener('file-reject', event => this.__onFileReject(event));
    this.$.upload.addEventListener('upload-error', event => this.__onUploadError(event));
    this.$.upload.addEventListener('upload-abort', event => this.__onUploadAbort(event));
    this.$.upload.addEventListener('upload-before', event => this.__onUploadBefore(event));
    this.$.upload.addEventListener('upload-request', event => this.__onUploadRequest(event));
    this.$.upload.addEventListener('upload-success', event => this.__onUploadSuccess(event));

    // This makes sure the files will appear after the icon, title and sub-title.
    afterNextRender(this, () => {
      const defaultSlot = this.$.upload.shadowRoot.querySelector('slot:not([name])');
      const fileListSlot = this.$.upload.shadowRoot.querySelector('slot[name="file-list"]');

      this.$.upload.shadowRoot.insertBefore(defaultSlot, fileListSlot);
    });
  }

  /**
   * This method clears all the files from the dropzone.
   */
  clearUploadedFiles () {
    this.__files = [];
  }

  /**
   * This method returns the text that will appear in the add file button.
   */
  __addFileButtonText () {
    if (this.addFileButtonText) return this.addFileButtonText;

    return this.maxFiles === 1
      ? 'Carregar ficheiro'
      : 'Carregar ficheiros';
  }

  /**
   * This method is invoked when the used clicks on the add files button.
   */
  __onAddFilesClick () {
    if (this.__disabled) return;

    this.$.upload.$.fileInput.value = '';
    this.$.upload.$.fileInput.click();
  }

  /**
   * This method is invoked when the maximum number of files is reached.
   */
  __updateDisabledState () {
    this.__disabled = this.disabled || this.__maxFilesReached;
  }

  /**
   * This method is invoked when the list of files changes.
   */
  __filesChanged () {
    this.__fileListContainer = this.$.upload.shadowRoot.querySelector('slot[name="file-list"]').firstElementChild;

    this.__files.length > 0
      ? this.__fileListContainer.style.display = ''
      : this.__fileListContainer.style.display = 'none';

    this.files = [...this.__files];
    this.__updateUploadedFilesState();
  }

  /**
   * This method is invoked when the max file size changes and checks if the new value surpasses the server's hard limit.
   */
  __maxFileSizeChanged () {
    if (this.maxFileSize > window.app.uploadMaxFileSize) {
      this.maxFileSize = window.app.uploadMaxFileSize;
      console.warn('The maximum individual file size cannot be greater than the server\'s hard limit.');
    }
  }

  /**
   * This method checks the currently existing files to see if one is being currently uploaded or not.
   */
  __updateUploadingState () {
    this.uploading = this.__files.some(file => !file.error && !file.complete);
  }

  /**
   * This method makes sure the uploadedFiles property is up-to-date.
   */
  __updateUploadedFilesState () {
    this.uploadedFiles = this.__files.filter(file => !file.error && file.complete);
  }
}

window.customElements.define('casper-upload-dropzone', CasperUploadDropzone);