export const PointerEventsMixin = superClass => {
  return class extends superClass {

    /**
     * This method is called when the user enters the dropzone with a file.
     */
    __onDragEnter () {
      if (this.disabled) return;

      this.__applyDropzoneStyling();
    }

    /**
     * This method is called when the user leaves the dropzone with a file.
     */
    __onDragLeave (event) {
      this.__removeDropzoneStyling();
    }

    /**
     * This method is called when the user drops a file inside the dropzone.
     *
     * @param {Object} event The event's object.
     */
    __onDrop (event) {
      // Prevent the automatic opening of the file.
      event.preventDefault();
      this.__removeDropzoneStyling();

      if (event.dataTransfer.files.length === 0 || this.disabled) return;

      // Check the type of files that were uploaded.
      if (Array.from(event.dataTransfer.files).some(file => !this.__acceptedExtensions.includes(file.type))) {
        return this.__onFileReject();
      }

      this.$.upload.files = [ ...this.$.upload.files, ...event.dataTransfer.files ];
      this.$.upload.uploadFiles(this.$.upload.files);
    }

    /**
     * This method is called when the user stops dragging the file into the dropzone.
     *
     * @param {Object} event The event's object.
     */
    __onDragOver (event) {
      // Prevent the automatic opening of the file.
      event.preventDefault();
    }

    /**
     * This method applies the dropzone styling, which is changing the border and triggering the ripple effect.
     */
    __applyDropzoneStyling () {
      this.$.ripple.downAction();
      this.shadowRoot.host.setAttribute('dragover', '');
    }

    /**
     * This method removes the dropzone styling, which is resetting the border and removing the ripple effect.
     */
    __removeDropzoneStyling () {
      this.$.ripple.upAction();
      this.shadowRoot.host.removeAttribute('dragover');
    }
  }
}