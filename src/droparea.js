/**!
 * Droparea - Makes an easy and intuitive to upload upload files through drag and drop or select methods.
 * Copyright (c) 2015, Rogério Taques.
 *
 * @requires jQuery v1.11 or above
 * @version 1.0.5
 * @cat Plugins/Image
 * @author Rogério Taques (rogerio.taques@gmail.com)
 * @see https://github.com/rogeriotaques/droparea
 */

/**
 * This plugin is inspired on the solution given by Ravishanker Kusuma (http://twitter.com/hayageek)
 * at http://hayageek.com/drag-and-drop-file-upload-jquery/ where he describes how to create an easy way to
 * drag and drop files and upload it to server. Many other enhancements were made.
 *
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
 *
 */

/**
 * CHANGELOG
 *
 * 1.0 	First release.
 *      Whenever user don't drop, but click to select an image instead, droparea opens the selection box.
 *      Validating the dropped file size, according on given initialization option.
 *      Don't force the next image to have the previous image size.
 *      Fixes a bug that prevent multiple dropareas in the same page.
 */

(function( $ ) {
    "use strict";

    var

    // default options
    defaults = {
    	// server url
    	url: 'path/to/server/script',

    	// whenever set to false, droparea won't upload the file to server, but set it into a local 'file' field instead.
    	// if false, a 'file_holder' is required
    	upload: true,

    	// the file holder to place files when 'upload' is set to false
    	// ignored when 'upload' is set to true.
    	file_holder: '#file',

    	// whenever uploading an image file and file_preview is given
    	// droparea tries to intercept the manual selection of files on 'file_holder'
    	// and display the selected image on 'file_preview' as soon as it is selected.
    	file_preview: '#file_preview',

    	// delay to remove the 'complete' notification (milisenconds)
    	notification_delay: 5000,

    	// accepted extensions for upload
    	// set null or false for all files
    	accepted: '.jpg|.png|.gif',

    	// the file max size allowed for upload
    	file_max_size: 2048,

    	// extra data that would be necessary to subimit with file
    	// it's supposed to be only html form elements, such as: input, select, etc.
    	// must be an array with the id of elements (# is not required)
    	extra_data: [],

    	// a success callback, called after upload is complete
    	// there are two arguments passed: server_response_obj and file_name whenever the server returns it
    	success: null,

    	i18n: {
    		unable_to_upload: 'Unable to upload at this time.<br >Select a file.',
    		wrong_file_type: 'Unacceptable file type!<br >Try: %s',
    		wrong_file_size: 'Dropped file is too big!<br >Max file size allowed: %s',
    		abort: 'Abort',
    		mb: ' MB',
    		kb: ' KB',
    		percent: '% ',
    		dismiss: 'Dismiss',
    		error: 'Err: '
    	}
    },

    // plugin methods
    methods = {

    	// initialize
    	init: function( options )
    	{
    		return this.each( function() {

        		var drop_area = $( this	),
          			file = null,
          			form_data = null,
          			statusbar = null,
                o = {};

            o = $.extend({}, defaults, options);

        		// intercepts the 'file_holder' element to assure that
        		// whenever user selects an image file from there, it will be displayed as preview.
        		if ( $(o.file_holder).length && $(o.file_preview).length )
            {
              $( o.file_holder ).on('change', function(ev)
              {
                var oFReader = new FileReader();

                oFReader.readAsDataURL( $( this )[0].files[0] );
                oFReader.onload = function (oFREvent)
                {
                  $( o.file_preview ).animate({opacity: 0}, 'slow', function(){
                    // change the image source
                    $(this).attr('src', oFREvent.target.result).animate({opacity: 1}, 'slow');

                    // remove the alert block whenever it exists.
                    drop_area.find('.statusbar.alert-block').fadeOut('slow', function(){ $(this).remove(); });
                  });
                };
              });
            }

        		// need to explicit the parent position definition
        		// to prevent problems with statusbar style.
        		drop_area.parent().css('position', drop_area.parent().css('position') );

        		// setup handlers
	    		drop_area
    				.on('click', function (ev)
            {
              // prevent event bubble propagation
              ev.stopPropagation();
              ev.preventDefault();

              // simulate that user is selecting the file, but not dropping it instead
              $( o.file_holder ).click();
            })
    				.on('dragenter', function (ev)
            {
              // prevent event bubble propagation
              ev.stopPropagation();
              ev.preventDefault();

              // apply a new style on droppable area
              drop_area.addClass( 'droparea-dragging' );
            })
	    			.on('dragleave', function (ev)
            {
              // prevent event bubble propagation
              ev.stopPropagation();
              ev.preventDefault();

              // restore original style
              drop_area.removeClass( 'droparea-dragging' );
            })
	    			.on('dragover', function (ev)
            {
              // prevent event bubble propagation
              ev.stopPropagation();
              ev.preventDefault();

              // apply a new style on droppable area
              drop_area.addClass( 'droparea-dragging' );
            })
		    		.on('drop', function (ev)
            {
              ev.preventDefault();

              // apply a new style on droppable area
              drop_area.toggleClass( 'droparea-dropped droparea-dragging' );

              // get the original file
              file = ev.originalEvent.dataTransfer.files[0];

              // do not upload when options.upload is set to false
              // open the file selection for 'file_holder' instead.
              if ( !o.upload )
              {
                _createAlertBlock( drop_area, o.i18n.unable_to_upload, true, false );
                $(o.file_holder).click();

                return;
              }

              // check if dropped file is allowed
              if ( o.accepted !== null && typeof o.accepted != 'boolean' )
              {
                if ( o.accepted.indexOf( file.name.substr( file.name.lastIndexOf('.') ) ) === -1 )
                {
                  _createAlertBlock( drop_area, o.i18n.wrong_file_type.replace('%s', '<b >' + o.accepted.split('|').join('</b> or <b >') + '</b>') );
                  return;
                }
              }

              // check if dropped file weight is allowed
              if ( (file.size / 1024) > o.file_max_size )
              {
                _createAlertBlock( drop_area, o.i18n.wrong_file_size.replace('%s', '<b >' + o.file_max_size + ' ' + o.i18n.kb + '</b>') );
                return;
              }

              // define form data
              form_data = new FormData();
              form_data.append(o.file_holder.replace('#', ''), file);

              // append on form_data all extra data
              if ( o.extra_data !== null )
              {
                for( var i in o.extra_data)
                {
                  if ( $( '#' + o.extra_data[i].replace('#', '') ).length )
                  {
                    form_data.append(o.extra_data[i].replace('#', ''), $( '#' + o.extra_data[i].replace('#', '') ).val());
                  }
                }
              }

              // create the statusbar in order to set submition progress
              statusbar = new _createStatusBar( drop_area, o );
              statusbar.setFileNameSize( file.name, file.size );

              _sendFileToServer(form_data, statusbar, drop_area, file, o);

		    		});

    		} ); // this.each
    	}

    },

    // counter for submitions.
    _sent = 0,

    _createStatusBar = function( obj, o )
    {
    	_sent++;	// count the new submition

    	this.statusbar 	 = $('<div class="statusbar statusbar-' + _sent + '"></div>');
    	this.filename  	 = $('<div class="filename"></div>').appendTo(this.statusbar);
    	this.size 	   	 = $('<div class="filesize"></div>').appendTo(this.statusbar);
    	this.progressBar = $('<div class="progressbar"><div></div></div>').appendTo(this.statusbar);
    	this.progressBarWidth = 0;
    	this.abort 		 = $('<a class="btn abort">' + o.i18n.abort + '</div>').appendTo(this.statusbar);

    	// place statusbar covering all the object
    	this.statusbar.css({
    		'width': obj.outerWidth(),
    		'height': obj.outerHeight(),
            'top': obj.offset().top,
            'left': obj.offset().left,
    	});

    	obj.append(this.statusbar);

    	this.setFileNameSize = function(name, size)
    	{
    		var size_str = '',
    			size_kb  = (size / 1024);

    		if ( parseInt(size_kb) > 1024)
    		{
    			size_str = (size_kb / 1024).toFixed(2) + o.i18n.mb;
    		}
    		else
    		{
    			size_str = size_kb.toFixed(2) + o.i18n.kb;
    		}

    		this.filename.html( name );
    		this.size.html( size_str );
    	};

    	this.setProgress = function( progress )
    	{
    		this.progressBarWidth = progress * this.progressBar.width() / 100;
    		this.progressBar.find('div').animate({ width: this.progressBarWidth }, 10).html(progress + o.i18n.percent);

    		if ( parseInt(progress) >= 100)
    		{
    			this.abort.hide();
    		}
    	};

    	this.setAbort = function( jqxhr )
    	{
    		this.abort.on('click', function(ev)
    		{
    			ev.preventDefault();
    			jqxhr.abort();
    			this.statusbar.hide();
    		});
    	};

    },

    _createAlertBlock = function( target, msg, dismissable, autohide )
    {
    	// sanitize arguments
    	dismissable = (typeof dismissable != 'undefined' ? dismissable : true);
    	autohide = (typeof autohide != 'undefined' ? autohide : true);

		var alertblock = $('<div class="statusbar alert-block"></div>'),
			filename   = $('<div class="filename"></div>').html( msg ).appendTo(alertblock),
			dismiss	   = $('<button class="btn dismiss"></button>').html( o.i18n.dismiss );

    	// place statusbar covering all the object
    	alertblock.css({
    		'width': target.outerWidth(),
    		'height': target.outerHeight(),
            'top': target.offset().top,
            'left': target.offset().left,
    	});

		target.append(alertblock);

		// implement a dismiss button
		// and inject it when alert block is dismissable
		if ( dismissable )
		{
			dismiss.on('click', function(ev)
			{
				ev.stopPropagation();
				ev.preventDefault();

				alertblock.fadeOut('fast', function() { $(this).remove(); });
			}).appendTo(alertblock);
		}

		// whenever alert is autohide
		// make it hidden after notification_delay setting
		if ( autohide )
		{
			setTimeout(function(){
				alertblock.fadeOut('fast', function() { $(this).remove(); });
			}, o.notification_delay );
		}

    },

    _sendFileToServer = function ( form_data, status, drop_area, file, o )
    {
    	var jqXHR = $.ajax( {
    			xhr: function()
    			{
    				var xhrobj = $.ajaxSettings.xhr();

    				if (xhrobj.upload)
    				{
    					xhrobj.upload.addEventListener('progress', function(ev)
    					{
    						var percent  = 0,
    							position = (ev.loaded || ev.position),
    							total 	 = ev.total;

    						if (ev.lengthComputable)
    						{
    							percent = Math.ceil(position / total * 100);
    						}

    						// update progress
    						status.setProgress( percent );
    					}, false);
    				}

    				return xhrobj;
    			},
    			url: o.url,
    			type: "POST",
    			contentType: false,
    			processData: false,
    			cache: false,
    			data: form_data,
    			success: function( r )
    			{
            r = $.parseJSON(r);
            status.setProgress( 100 );

            // now it's time to run the callback
            if ( o.success !== null && $.isFunction( o.success ) )
            {
              // call the callback and pass the return from server,
              // the file name (file_name) whenever it exists and the
              // offline uploaded file.
              o.success( r, (typeof r.file_name != 'undefined' ? r.file_name : null), file );
            }

            // remove 'drop' style from droppable area
            drop_area.removeClass( 'droparea-dropped' );
    			},

    			error: function( jqXHR, textStatus, errorThrown)
    			{
    				status.progressBar.addClass('droparea-fail');
    				status.progressBar.find('div:first').html( o.i18n.error + errorThrown );
    			},

    			complete: function( jqXHR, textStatus )
    			{
    				// after complete, remove the status
    				setTimeout( function()
		    		{
		    			status.statusbar.fadeOut('fast', function()
		    			{
		    				$(this).remove();
		    			});
		    		}, o.notification_delay );
    			}
    	});

    	status.setAbort( jqXHR );

    }; // _sendFileToServer

    $.fn.droparea = function( method )
    {
    	if( methods[method] )
    	{
    		return methods[method].apply( this, Array.prototype.slice.call(arguments, 1) );
    	}
    	else if( typeof method === 'object' || !method )
    	{
    		return methods.init.apply( this, arguments );
    	}
    	else
    	{
    		$.error('Method '+method+' does not exist on jQuery.droparea()');
    	}
    };

})(jQuery);
