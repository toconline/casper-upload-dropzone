import { CasperUploadDropzoneErrors } from '../casper-upload-dropzone-constants.js';

export const VaadinUploadMixin = superClass => {
  return class extends superClass {
    /**
     * This method is called when the user tries to upload an invalid file.
     */
    __onFileReject (event) {
      const fileName = event.detail.file.name;
      const fileSize = event.detail.file.size;

      switch (event.detail.error) {
        case CasperUploadDropzoneErrors.TOO_MANY_FILES:
          // This means that with this file, the maximum number of allowed ones was surpassed.
          this.__errors.push(`O ficheiro "${fileName}" foi rejeitado por exceder o máximo de ${this.maxFiles} ficheiro(s).`);
          break;
        case CasperUploadDropzoneErrors.FILE_IS_TOO_BIG:
          // This means the file exceeds the maximum allowed size.
          this.__errors.push(`O ficheiro "${fileName}" foi rejeitado por ter ${this.__bytesToMegabytes(fileSize)}MB quando o limite é ${this.__bytesToMegabytes(this.maxFileSize)}MB.`);
          break;
        case CasperUploadDropzoneErrors.INCORRECT_FILE_TYPE:
          // This means the file's extension is not accepted.
          this.__errors.push(`O ficheiro "${fileName}" foi rejeitado por ser de um tipo inválido. Só pode fazer upload das seguintes extensões - ${this.__humanReadableExtensions()}.`);
          break;
      }

      this.__displayErrors();
    }
    /**
     * This method is called before the request is sent.
     *
     * @param {Object} event The event's object.
     */
    __onUploadBefore (event) {
      const uploadedFilesTotalSize = this.__files
        .filter(file => !file.held)
        .reduce((totalSize, file) => totalSize + file.size, 0);

      if (uploadedFilesTotalSize + event.detail.file.size > this.maxFilesTotalSize) {
        event.preventDefault();

        this.__errors.push(`O ficheiro "${event.detail.file.name}" não foi carregado por ultrapassar o limite total de ${this.__bytesToMegabytes(this.maxFilesTotalSize)}MB.`);
        this.__displayErrors();
      }
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
     */
    __onUploadRequest () {
      if (this.additionalParams) {
        event.detail.xhr[this.additionalParamsKey] = this.additionalParams;
      }
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
  }
}