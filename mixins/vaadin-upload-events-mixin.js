import { CasperUploadDropzoneErrors } from '../casper-upload-dropzone-constants.js';

import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';

export const VaadinUploadMixin = superClass => {
  return class extends superClass {
    /**
     * This method is called when the user tries to upload an invalid file.
     *
     * @param {Object} event The event's object.
     */
    __onFileReject (event) {
      const { error, file } = event.detail;

      switch (error) {
        case CasperUploadDropzoneErrors.TOO_MANY_FILES:
          // This means that with this file, the maximum number of allowed ones was surpassed.
          this.__errors.push(`O ficheiro "${file.name}" foi rejeitado por exceder o máximo de ${this.maxFiles} ficheiro(s).`);
          break;
        case CasperUploadDropzoneErrors.FILE_IS_TOO_BIG:
          // This means the file exceeds the maximum allowed size.
          this.__errors.push(`O ficheiro "${file.name}" foi rejeitado por ter ${this.__bytesToMegabytes(file.size)}MB quando o limite é ${this.__bytesToMegabytes(this.maxFileSize)}MB.`);
          break;
        case CasperUploadDropzoneErrors.INCORRECT_FILE_TYPE:
          // This means the file's extension is not accepted.
          this.__errors.push(`O ficheiro "${file.name}" foi rejeitado por ser de um tipo inválido. Só pode fazer upload das seguintes extensões - ${this.__humanReadableExtensions()}.`);
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
      let fileError;
      const { file } = event.detail;

      const uploadedFiles = this.__files.filter(file => !file.held);
      const uploadedFilesSize = uploadedFiles.reduce((totalSize, file) => totalSize + file.size, 0);

      if (this.beforeUploadValidator && (error = this.beforeUploadValidator(file))) {
        // Check if the file passes the custom validator implemented by the developer.
        fileError = error;
      } else if (uploadedFilesSize + file.size > this.maxFilesTotalSize) {
        // Check if the uploaded file surpasses the maximum total size.
        fileError = `O ficheiro "${file.name}" não foi carregado por ultrapassar o limite total de ${this.__bytesToMegabytes(this.maxFilesTotalSize)}MB.`;
      } else if (this.noDuplicates && uploadedFiles.some(uploadedFile => uploadedFile.name === file.name && uploadedFile.size === file.size && uploadedFile.type === file.type)) {
        // Check if the uploaded file is already in the list and the developer explicitly doesn't want that behavior.
        fileError = `Não pode carregar o ficheiro "${file.name}" novamente.`;
      }

      if (!fileError) return;

      event.preventDefault();

      this.__errors.push(fileError);
      this.__displayErrors();

      // Remove the invalid file from the list.
      this.__files = this.__files.filter(existingFile => existingFile !== file);
    }

    /**
     * This method is called when the request is successful and the file was uploaded.
     *
     * @param {Object} event The event's object.
     */
    __onUploadSuccess (event) {
      this.__updateUploadingState();
      this.__updateUploadedFilesState();

      const { xhr, file } = event.detail;

      this.__dispatchEvent('on-upload-success', {
        originalFileSize: file.size,
        originalFileName: file.name,
        originalFileType: file.type,
        uploadedFile: JSON.parse(xhr.response).file,
        [this.additionalParamsKey]: xhr[this.additionalParamsKey]
      });
    }

    /**
     * This method is called when the request is errors out.
     *
     * @param {Object} event The event's object.
     */
    __onUploadError (event) {
      this.__updateUploadingState();

      const { file, xhr } = event.detail;

      this.__dispatchEvent('on-upload-error', {
        originalFileSize: file.size,
        originalFileName: file.name,
        originalFileType: file.type
      });

      // This means the user has to buy more digital archive space.
      if (xhr.status === 413) {
        this.__files = this.__files.filter(existingFile => existingFile !== file);

        this.__errors.push(this.__noSpaceErrorMessage);
        this.__displayErrors();
      }
    }

    /**
     * This method is called when the request is errors out.
     *
     * @param {Object} event The event's object.
     */
    __onUploadAbort (event) {
      // Wait for the vaadin-upload component to actually remove the aborted file.
      afterNextRender(this, () => this.__updateUploadingState());

      this.__dispatchEvent('on-upload-abort', {
        originalFileSize: event.detail.file.size,
        originalFileName: event.detail.file.name,
        originalFileType: event.detail.file.type
      });
    }

    /**
     * This method is called when the upload component is about to send a file and adds the additional parameters if there are any.
     *
     * @param {Object} event The event's object.
     */
    __onUploadRequest (event) {
      event.preventDefault();

      this.__updateUploadingState();

      if (this.additionalParams) {
        event.detail.xhr[this.additionalParamsKey] = this.additionalParams;
      }

      event.detail.xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      event.detail.xhr.setRequestHeader('Content-Disposition', `form-data; name="${this.formDataName}"; filename="uploaded_file";`);
      event.detail.xhr.send(event.detail.file);
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