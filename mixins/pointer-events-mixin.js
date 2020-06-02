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
    __onDragLeave () {
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

      const droppedFiles = Array.from(event.dataTransfer.files);

      if (droppedFiles.length === 0 || this.disabled) return;

      // Check the number and type of files that were dropped into the component.
      if (this.maxFiles < this.__files.length + droppedFiles.length || droppedFiles.some(file => !this.__acceptedExtensions().includes(file.type))) {
        return this.__onFileReject();
      }

      this.__files = [ ...this.__files, ...droppedFiles ];
      this.$.upload.uploadFiles(this.__files);
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
      this.shadowRoot.host.setAttribute('dragover', '');
    }

    /**
     * This method removes the dropzone styling, which is resetting the border and removing the ripple effect.
     */
    __removeDropzoneStyling () {
      this.shadowRoot.host.removeAttribute('dragover');
    }
  }
}