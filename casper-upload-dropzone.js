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
}

window.customElements.define('casper-upload-dropzone', CasperUploadDropzone);