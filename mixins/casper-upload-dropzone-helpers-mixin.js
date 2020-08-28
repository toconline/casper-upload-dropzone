import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';

export const CasperUploadDropzoneHelpersMixin = superClass => {
  return class extends superClass {
    /**
     * Helper method to dispatch a custom event.
     *
     * @param {String} name The event's name.
     * @param {Object} detail The event's detail upload.
     */
    __dispatchEvent (name, detail) {
      this.dispatchEvent(new CustomEvent(name, {
        detail,
        bubbles: true,
        composed: true,
      }));
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
        window.app.openToast({
          duration: 10000,
          text: this.__errors.join('<br />'),
          backgroundColor: 'var(--status-red)',
        });

        // Clear the errors so they do not get displayed again.
        this.__errors = [];
      }, 250);
    }

    /**
     * This method displays the upload information to the user - the maximum size per-file and for all files, the accepted extensions and the
     * maximum number of files.
     */
    __displayUploadInfo () {
      afterNextRender(this, () => {
        this.__uploadInfoContainer = this.shadowRoot.querySelector('ul');
        this.__uploadInfoContainer.innerHTML = '';

        // Maximum size per-file.
        if (this.maxFileSize) {
          this.__addItemToUploadInfo(`Cada ficheiro tem que ter no máximo um tamanho de ${this.__bytesToMegabytes(this.maxFileSize)}MB.`);
        }

        // The total max size of all the files combined.
        if (this.maxFilesTotalSize !== Infinity) {
          this.__addItemToUploadInfo(`A soma total dos ficheiros carregados não pode ultrapassar os ${this.__bytesToMegabytes(this.maxFilesTotalSize)}MB.`);
        }

        // The accepted extensions.
        this.__addItemToUploadInfo(`Pode fazer upload de ficheiros com a seguinte extensão: ${this.__humanReadableExtensions()}.`);

        // The maximum number of files.
        this.__addItemToUploadInfo(this.maxFiles === Infinity
          ? 'Não existe limite para o número de ficheiros.'
          : `Só pode fazer upload de ${this.maxFiles} ficheiro(s).`);
      });
    }

    /**
     * This method appends a new line to the area that contains information about the types and sizes of files that can be uploaded.
     *
     * @param {String} message The message that will be appended.
     */
    __addItemToUploadInfo (message) {
      const listItem = document.createElement('li');
      listItem.innerHTML = message;

      this.__uploadInfoContainer.appendChild(listItem);
    }

    /**
     * This method returns the allowed extensions in an understandable way.
     */
    __humanReadableExtensions () {
      const mimeTypesExtensions = {
        'application/pdf': '.pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
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
  }
}