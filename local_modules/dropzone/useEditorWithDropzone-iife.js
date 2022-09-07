/*!
 * Pintura Image Editor 8.32.3
 * (c) 2018-2022 PQINA Inc. - All Rights Reserved
 * License: https://pqina.nl/pintura/license/
 */
/* eslint-disable */

var useEditorWithDropzone = (function () {
    'use strict';

    var useEditorWithDropzone = (openEditor, editorOptions, dropzoneOptions = {}) => {
        // Map of original and transformed files
        var fileMap = new Map();

        // File queue to edit
        var queue = [];

        function editNextFile() {
            var next = queue[0];
            if (next) next();
        }

        function queueFile(dz, file, done) {
            // Queue for editing
            queue.push(function () {
                const editor = openEditor({
                    ...editorOptions,
                    src: file,
                });

                editor.on('hide', () => {
                    // Remove this item from the queue
                    queue.shift();

                    // Edit next item in queue
                    editNextFile();
                });

                editor.on('loaderror', () => done('error loading image'));
                editor.on('processerror', () => done('error processing image'));

                editor.on('process', ({ dest }) => {
                    // No output means cancelled, remove file from list
                    if (!dest) return done();

                    // Create new thumbnail
                    dz.createThumbnail(
                        dest,
                        dz.options.thumbnailWidth,
                        dz.options.thumbnailHeight,
                        dz.options.thumbnailMethod,
                        false,
                        function (dataURL) {
                            // Update the thumbnail
                            dz.emit('thumbnail', file, dataURL);

                            // Return modified file to dropzone
                            done(undefined, dest);
                        }
                    );
                });
            });

            // If this is first item, let's open the editor immmidiately
            if (queue.length === 1) editNextFile();
        }

        dropzoneOptions.accept = function (file, done) {
            // only allow images files
            if (!/image/.test(file.type)) return done(file);

            // is image file, let's queue
            queueFile(this, file, function (err, fileOut) {
                if (err) {
                    return done(err);
                }

                if (fileOut) {
                    fileMap.set(file, fileOut);
                }

                done();
            });
        };

        dropzoneOptions.transformFile = function (file, done) {
            if (fileMap.has(file)) return done(fileMap.get(file));
            done(file);
        };

        return dropzoneOptions;
    };

    return useEditorWithDropzone;

}());
