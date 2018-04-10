/**!
 * Droparea.js
 * Makes it easy and intuitive to upload files through drag and drop
 * or thru the normal select from your computer method.
 *
 * @requires jQuery v2.1.3 or above
 * @version 2.0.1
 * @cat Plugins/Image
 * @author Rogério Taques (rogerio.taques@gmail.com)
 * @copyright 2015-2018, Rogério Taques
 * @see https://rogeriotaques.github.io/droparea
 */

/**
 * Licensed under MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons
 * to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

(function($) {
  'use strict';

  var dropArea = [];

  var oo = [];

  // Default options
  var defaults = {
    // Server url
    url: 'path/to/server/script',

    // The method that will be used to call the server.
    // Possible values: POST, PATCH, PUT
    method: 'POST',

    // If set to false, droparea won't upload the file to server, but set it
    // into a local 'file' field instead. If that's the case, a 'fileHolder'
    // is required.
    upload: true,

    // The file holder to place files when 'upload' is set to false
    // ignored when 'upload' is set to true.
    fileHolder: '#file',

    // When uploading an image file and filePreview is given droparea tries
    // to intercept the manual selection of files on 'fileHolder' and display
    // the selected image on 'filePreview' as soon as it is selected.
    filePreview: '#file-preview',

    // Delay to remove the 'complete' notification (milisenconds)
    notificationDelay: 5000,

    // Accepted extensions for upload.
    // Set null or false for all files
    accepted: '.jpg|.png|.gif',

    // The file max-size allowed for uploads
    fileMaxSize: 2048,

    // Extra information that would be necessary to subimit with the file.
    // It's supposed to be only html form elements, such as: input, select, etc.
    // It must be an array with the id of elements (# is not required).
    extra: [],

    // A success callback, called after the upload completes.
    // Three arguments are passed to the callback:
    //    response   - The server response. Usually JSON.
    //    file_name  - Whatever string the server returns as the file-name.
    //    file_refer - Local uploaded object (reference) file.
    onSuccess: null,

    // A failure callback, called after the upload fails.
    // One argument is passed to the callback:
    //    error      - The server response. Usually Object.
    onFail: null,

    // Internationalization object
    i18n: {
      unableToUpload: 'Unable to upload at this time.<br >Select a file.',
      wrongFileType: 'Unacceptable file type!<br >Try: %s',
      wrongFileSize: 'Dropped file is too big!<br >Max file size allowed: %s',
      abort: 'Abort',
      mb: ' MB',
      kb: ' KB',
      percent: '% ',
      dismiss: 'Dismiss',
      error: 'Err: '
    }
  };

  // The counter for submitions.
  var _sent = 0;

  /**
   * Updates the image source with the selected/ dropped one.
   * @param {FileDataObject} [droppedFile]
   * @return void
   */
  var _updateImageSource = function(file) {
    var oFReader = new FileReader();

    // When file is selected
    if (file) {
      oFReader.readAsDataURL(file);

      oFReader.onload = function(oFREvent) {
        $(o.filePreview).animate({ opacity: 0 }, 'slow', function() {
          // change source
          $(o.filePreview).attr('src', oFREvent.target.result);
          $(o.filePreview).animate({ opacity: 1 }, 'slow', function() {
            // remove the alert block, if any.
            drop_area
              .find('.statusbar.alert-block')
              .fadeOut('slow', function() {
                $(this).remove();
              });
          });
        });
      };
    }
  }; // _updateImageSource

  /**
   * Called when user clicks on dismiss button from alert block
   * @param {object} ev The window event
   * @return void
   */
  var _onClickDismiss = function(ev) {
    ev.stopPropagation();
    ev.preventDefault();

    $(ev.currentTarget)
      .parent()
      .fadeOut('fast', function() {
        $(this).remove();
      });
  }; // _onClickDismiss

  /**
   * Creates an status bar of the droparea upload progress.
   * @param {jqyElement} drop_area The droparea element
   * @return StatusBar
   */
  var _createStatusBar = function(drop_area) {
    _sent += 1; // increase the submission counter

    var daKey = drop_area.data('droparea-key');

    var o = oo[daKey];

    var abortElem = $('<a class="btn abort">' + o.i18n.abort + '</div>');

    var fileNameElem = $('<div class="filename" ></div>');

    var fileSizeElem = $('<div class="filesize" ></div>');

    var progressBarElem = $('<div class="progressbar"><div ></div></div>', {
      style: { top: 0, left: 0 }
    });

    var statusBarElem = $('<div class="statusbar"></div>', {
      id: 'droparea-statusbar-' + _sent
    });

    var setFileNameSize = function(fileName, fileSize) {
      var sizeStr = '';

      var sizeKb = fileSize / 1024;

      var fixSize = function(val) {
        val = parseFloat(val.toFixed(2));
        return val % 1 === 0 ? val.toFixed(0) : val.toFixed(2);
      };

      if (parseInt(sizeKb) > 1024) {
        sizeStr = fixSize(sizeKb / 1024) + o.i18n.mb;
      } else {
        sizeStr = fixSize(sizeKb) + o.i18n.kb;
      }

      fileNameElem.html(fileName);
      fileSizeElem.html(sizeStr);
    };

    var setProgress = function(progress) {
      progressBarElem
        .find('div')
        .animate({ width: progress + '%' }, 10)
        .html(progress + o.i18n.percent);

      if (parseInt(progress) >= 100) {
        abortElem.hide();
      }
    };

    var setAbort = function(jqxhr) {
      abortElem.off('click.droparea').on('click.droparea', function(event) {
        event.preventDefault();
        event.stopPropagation();

        if (jqxhr.abort) {
          jqxhr.abort();
        }

        statusBarElem.fadeOut('fast', function() {
          statusBarElem.remove();
        });
      });
    };

    var setFailure = function(msg) {
      progressBarElem.addClass('droparea-fail');
      progressBarElem.find('div:first').html(msg);
    };

    statusBarElem.append(
      fileNameElem,
      fileSizeElem,
      progressBarElem,
      abortElem
    );

    // Removes any pre-existing statusbar
    drop_area.find('.statusbar').remove();

    // Append the new status block ...
    drop_area.append(statusBarElem);

    return {
      statusBar: statusBarElem,
      setFailure: setFailure,
      setFileNameSize: setFileNameSize.bind(this),
      setProgress: setProgress.bind(this),
      setAbort: setAbort.bind(this)
    };
  }; // _createStatusBar

  /**
   *
   * @param {jqrElement} target The droparea element
   * @param {json} opts The instance options
   * @param {string} msg The message to display
   * @param {boolean} [dismissable] If true, a dismiss button will be at the alert block
   * @param {boolean} [autohide] If true, message will disapear after defaults.notificationDelay
   * @return void
   */
  var _createAlertBlock = function(target, msg, dismissable, autohide) {
    var alertblock, filename, dismiss;
    var daKey = target.data('droparea-key');
    var opts = oo[daKey];

    // sanitize arguments
    dismissable = typeof dismissable != 'undefined' ? dismissable : true;
    autohide = typeof autohide != 'undefined' ? autohide : true;

    alertblock = $('<div class="statusbar alert-block"></div>');

    filename = $('<div class="filename"></div>')
      .html(msg)
      .appendTo(alertblock);

    dismiss = $('<button class="btn dismiss"></button>').html(
      opts.i18n.dismiss
    );

    // place statusbar covering all the object
    alertblock.css({
      top: 0,
      left: 0
    });

    // Removes any pre-existing statusbar
    target.find('.statusbar').remove();

    // Appends the error notification block
    target.append(alertblock);

    // implement a dismiss button
    // and inject it when alert block is dismissable
    if (dismissable) {
      dismiss
        .off('click.droparea')
        .on('click.droparea', _onClickDismiss)
        .appendTo(alertblock);
    }

    // whenever alert is auto-hideable
    // makes it hidden after notificationDelay setting
    if (autohide) {
      setTimeout(function() {
        alertblock.fadeOut('fast', function() {
          $(this).remove();
        });
      }, opts.notificationDelay);
    }
  }; // _createAlertBlock

  /**
   * Prepares and send the file to the server.
   * @param {File} file
   * @return void
   */
  var _sendFileToServer = function(drop_area, o, file) {
    var statusbar, jqXHR;

    var fnXHR = function() {
      var xhrObj = $.ajaxSettings.xhr();

      var onUploadProgress = function(ev) {
        var percent = 0;
        var position = ev.loaded || ev.position;
        var total = ev.total;

        if (ev.lengthComputable) {
          percent = Math.ceil(position / total * 100);
        }

        // update progress
        statusbar.setProgress(percent);
      };

      if (xhrObj.upload) {
        xhrObj.upload.addEventListener('progress', onUploadProgress, false);
      }

      return xhrObj;
    };

    var ajaxOpts = {
      xhr: fnXHR,
      url: o.url,
      method: o.method,
      type: o.method, // backward compatibility
      contentType: false,
      processData: false,
      cache: false,
      data: {}
    };

    var onXHRSuccess = function(r) {
      if (typeof r === 'string') {
        r = $.parseJSON(r);
      }

      statusbar.setProgress(100);

      // now it's time to run the callback
      if (o.onSuccess !== null && $.isFunction(o.onSuccess)) {
        var fileNameToReturn =
          typeof r.file_name !== 'undefined' ? r.file_name : null;

        // call the callback and pass the return from server,
        // the file name (file_name) whenever it exists and the
        // offline uploaded file.
        o.onSuccess(r, fileNameToReturn, file);
      }

      // Don't need to update the image when API returns
      // it should be made by the consumer.
      // _updateImageSource(file);

      // remove 'drop' style from droppable area
      drop_area.removeClass('droparea-dropped');
    }; // onXHRSuccess

    var onXHRFail = function(jqXHR, textStatus, errorThrown) {
      statusbar.setFailure(o.i18n.error + errorThrown);

      if (o.onFail && $.isFunction(o.onSuccess)) {
        o.onFail(jqXHR.responseJSON || jqXHR);
      }
    }; // onXHRFail

    var onXHRComplete = function(rjqXHR, textStatus) {
      var fh = $(o.fileHolder);

      fh.replaceWith(fh.val('').clone(true));

      // after complete, remove the status
      setTimeout(function() {
        statusbar.statusBar.fadeOut('fast', function() {
          $(this).remove();
        });
      }, o.notificationDelay);
    }; // onXHRComplete

    // define form data
    ajaxOpts.data = new FormData();
    ajaxOpts.data.append(o.fileHolder.replace('#', ''), file);

    // append on ajaxOpts.data all extra data
    if (o.extra !== null) {
      for (var i in o.extra) {
        if ($('#' + o.extra[i].replace('#', '')).length) {
          ajaxOpts.data.append(
            o.extra[i].replace('#', ''),
            $('#' + o.extra[i].replace('#', '')).val()
          );
        }
      }
    }

    // create the statusbar in order to set submition progress
    statusbar = new _createStatusBar(drop_area);
    statusbar.setFileNameSize(file.name, file.size);

    jqXHR = $.ajax(ajaxOpts)
      .then(onXHRSuccess)
      .catch(onXHRFail)
      .always(onXHRComplete);

    statusbar.setAbort(jqXHR);
  }; // _sendFileToServer

  /**
   * Intercepts the file select
   * @param {jqrElement} drop_area The droparea element
   * @param {json} o The options
   * @return void
   */
  var _interceptFileSelector = function(drop_area, o) {
    if ($(o.fileHolder).length && $(o.filePreview).length) {
      $(o.fileHolder)
        .off('change.droparea')
        .on('change.droparea', (event) => {
          var file;

          if (
            event.originalEvent &&
            event.originalEvent.target &&
            event.originalEvent.target.files
          ) {
            file = event.originalEvent.target.files[0];
            _sendFileToServer(drop_area, o, file);
          }
        });
    }
  }; // _interceptFileSelector

  /**
   * Called when user clicks on the droparea box
   * @param {window.event} ev
   * @return void
   */
  var _onClick = function(ev) {
    ev.stopPropagation();
    ev.preventDefault();

    var drop_area = $(ev.currentTarget);
    var daKey = drop_area.data('droparea-key');
    var o = oo[daKey];

    // simulate that user is selecting the file,
    // but not dropping it instead
    $(o.fileHolder).click();
  }; // _onClick

  /**
   * Called when user enters the droparea box
   * @param {window.event} ev
   * @return void
   */
  var _onDragEnter = function(ev) {
    ev.stopPropagation();
    ev.preventDefault();

    var drop_area = $(ev.currentTarget);

    // apply a new style on droppable area
    drop_area.addClass('droparea-dragging');
  }; // _onDragEnter

  /**
   * Called when user leaves the droparea box
   * @param {window.event} ev
   * @return void
   */
  var _onDragLeave = function(ev) {
    ev.stopPropagation();
    ev.preventDefault();

    var drop_area = $(ev.currentTarget);

    // restore original style
    drop_area.removeClass('droparea-dragging');
  }; // _onDragLeave

  /**
   * Called when user is dragging an image
   * @param {window.event} ev
   * @return void
   */
  var _onDragOver = function(ev) {
    ev.stopPropagation();
    ev.preventDefault();

    var drop_area = $(ev.currentTarget);

    // apply a new style on droppable area
    drop_area.addClass('droparea-dragging');
  }; // _onDragOver

  /**
   * Called when user drops an image into droparea box
   * @param {window.event} ev
   * @return void
   */
  var _onDrop = function(ev) {
    ev.preventDefault();

    // get the original file
    var file = ev.originalEvent.dataTransfer.files[0];

    var drop_area = $(ev.currentTarget);
    var daKey = drop_area.data('droparea-key');
    var o = oo[daKey];

    // apply a new style on droppable area
    drop_area.toggleClass('droparea-dropped droparea-dragging');

    // do not upload when options.upload is set to false
    // open the file selection for 'fileHolder' instead.
    if (!o.upload) {
      _createAlertBlock(drop_area, o.i18n.unableToUpload, true, false);
      $(o.fileHolder).click();
      return;
    }

    // check if dropped file is allowed
    if (o.accepted !== null && typeof o.accepted !== 'boolean') {
      var accepting = o.accepted.toLowerCase();
      var extension = file.name
        .substr(file.name.lastIndexOf('.'))
        .toLowerCase();

      if (accepting.indexOf(extension) === -1) {
        _createAlertBlock(
          drop_area,
          o.i18n.wrongFileType.replace(
            '%s',
            '<b >' + o.accepted.split('|').join('</b> or <b >') + '</b>'
          )
        );

        return;
      }
    }

    // check if dropped file size is allowed
    if (file.size / 1024 > o.fileMaxSize) {
      _createAlertBlock(
        drop_area,
        o.i18n.wrongFileSize.replace(
          '%s',
          '<b >' + o.fileMaxSize + ' ' + o.i18n.kb + '</b>'
        )
      );

      return;
    }

    _sendFileToServer(drop_area, o, file);
  }; // _onDrop

  /**
   * Initializes the plugin handlers
   * @param {jqrObject} drop_area The droparea element
   * @return void
   */
  var _initHandlers = function(drop_area) {
    drop_area
      .off('click.droparea')
      .on('click.droparea', _onClick)
      .off('dragenter.droparea')
      .on('dragenter.droparea', _onDragEnter)
      .off('dragleave.droparea')
      .on('dragleave.droparea', _onDragLeave)
      .off('dragover.droparea')
      .on('dragover.droparea', _onDragOver)
      .off('drop.droparea')
      .on('drop.droparea', _onDrop);
  }; // initHandlers

  /**
   * Constructs the plugin
   * @param {json} options
   * @return jQuery.droparea
   */
  var _construct = function(options) {
    return this.each(function() {
      var daKey = dropArea.length;
      var drop_area = $(this);
      var o = $.extend({}, defaults, options);

      drop_area.attr('data-droparea-key', daKey);

      // If given method isn't allowed fallback to POST
      if (['POST', 'PATCH', 'PUT'].indexOf(o.method) === -1) {
        o.method = 'POST';
      }

      // Prevents mess with progress bar style
      drop_area
        .parent()
        .css('position', drop_area.parent().css('position') || 'relative');

      dropArea[daKey] = drop_area;
      oo[daKey] = o;

      _interceptFileSelector(drop_area, o);
      _initHandlers(drop_area);
    });
  }; // _construct

  // Droparea methods
  var methods = {
    init: _construct
  };

  // Attach the plugin to jQuery
  $.fn.droparea = function(method) {
    if (methods[method]) {
      return methods[method].apply(
        this,
        Array.prototype.slice.call(arguments, 1)
      );
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on Droparea.js');
    }
  };
})(jQuery);
