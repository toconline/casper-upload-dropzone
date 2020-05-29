export const VaadinUploadMixin = superClass => {
  return class extends superClass {

    /**
     * This method is called when the user tries to upload an invalid file.
     *
     * @param {Object} event The event's object.
     */
    __onFileReject (event) {
      this.app.openToast({
        backgroundColor: 'var(--error-color)',
        text: `Não foi possível fazer upload do ficheiro ${event.detail.file.name}.`
      });
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
  }
}