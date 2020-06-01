export const VaadinUploadMixin = superClass => {
  return class extends superClass {

    /**
     * This method is called when the user tries to upload an invalid file.
     */
    __onFileReject () {
      this.app.openToast({
        text: this.__supportedExtensions(),
        backgroundColor: 'var(--error-color)',
      });
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
      event.preventDefault();

      // If the developer specified additional params, include them in the XMLHttpRequest.
      if (this.additionalParams) {
        event.detail.xhr[this.additionalParamsKey] = this.additionalParams;
      }

      event.detail.xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      event.detail.xhr.setRequestHeader('Content-Disposition', 'form-data');
      event.detail.xhr.send(event.detail.file);
    }
  }
}