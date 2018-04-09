# Droparea.js

[![Latest Version](https://img.shields.io/github/release/rogeriotaques/droparea.svg)](https://github.com/rogeriotaques/droparea/releases)

Creates an simple, but powerfull area for drag and drop files to upload, falling back to the traditional select method when the user click on it, yet empowered by the auto preview from the selected file.

Inspired on the solution given by Ravishanker Kusuma (http://twitter.com/hayageek)
at http://hayageek.com/drag-and-drop-file-upload-jquery/, which describes how to create a way drag and drop files and upload it to the server.

## [Live Demo](https://rogeriotaques.github.io/droparea/) here

> Note: This file is about Droparea.js from version `2.0.0`. If you are looking for the docs from version `1.0.7`, please refer to [this file](https://github.com/rogeriotaques/droparea/blob/master/readme-1.0.7.md).

## Dependencies

* jQuery 2.1.3 or later

## Getting started

Add the following block of code to the `HEAD` of your page. Remember that the path should be adjusted for the path to wherever you decide place the source files.

```html
    <!-- Import jQuery -->
    <script type="text/javascript" src="//code.jquery.com/jquery-2.1.3.min.js"></script>

    <!-- Import Droparea.js -->
    <link rel="stylesheet" type="text/css" href="path/to/src/droparea.css" media="screen" >
    <script type="text/javascript" src="path/to/src/droparea.min.js"></script>
```

Within the `BODY` tag, create the area where files are gonna be dropped, and the input file for the fallback. You can simply copy and paste the code block below:

```html
    <div class="droparea" >
        <span >Drag and drop files here!</span>
        <img src="http://placehold.it/200" id="file-preview" >
    </div>

    <input type="file" name="file" id="file" accept="image/*" style="display: none;" >
```

Now, all we need is create an instance of the Droparea.js, just like shown below. For your convenience, you can simply copy and paste the code block below:

```html
    <script type="text/javascript" >
      $(document).ready(function(){
        $('.droparea').droparea();
      });
    </script>
```

This will automatically create a droppable area in your page. Easy, right?

## Options

Even though Droparea.js works well with its standard settings, it can be customized to better fit on your project. You may pass the `options` to the plugin as follows:

```javascript
    var opts = { ... }; // see the options below.
    $('.droparea').droparea(opts);
```

### Available options

| Option              | Type       | Default                                                      | Definition                                                                                                                                                                                                        |
| ------------------- | ---------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| url                 | `string`   | `N/A`                                                        | Server-side script address.                                                                                                                                                                                       |
| method              | `string`   | `'POST'`                                                     | Define the method that droparea.js will use to call the `url`. Possible options are `POST`, `PATCH` or `PUT`.                                                                                                     |
| upload              | `boolean`  | `true`                                                       | If `false`, droparea.js won't call the URL, but force the user to select the file. If `false`, a `fileHolder` is required                                                                                         |
| fileHolder          | `string`   | `'#file'`                                                    | It is the file holder to place files when `upload` is set to `false`. Ignored when `upload` is set to `true`.                                                                                                     |
| filePreview         | `string`   | `'#file_preview'`                                            | When uploading an image file, and `filePreview` is given, droparea.js tries to intercept the manual selection of files on `fileHolder` and display the selected image on `filePreview` as soon as it is selected. |
| notificationDelay   | `number`   | `5000`                                                       | How long (milliseconds) droparea.js will keep the notification block overflowing the droppable area.                                                                                                              |
| accepted            | `string`   | `.jpg`&#124;`.png`&#124;`.gif`                               | The accepted extensions for uploaded files. If set `null` or `false` allow all files.                                                                                                                             |
| fileMaxSize         | `number`   | `2048`                                                       | The file maximum size allowed for the uploaded file.                                                                                                                                                              |
| extra               | `array`    | `[]`                                                         | All the extra data that should be submitted with the file. Push to this array all ids from form elements to be submitted.                                                                                         |
| i18n                | `object`   | \* See below                                                 | The internationalization object containing all used strings for translating the existing messages.                                                                                                                |
| i18n.unableToUpload | `string`   | Unable to upload at this time.&lt;br/&gt;Select a file.      |
| i18n.wrongFileType  | `string`   | Unacceptable file type!&lt;br/&gt;Try: %s                    | `%s` will be replaced by option `accepted` value.                                                                                                                                                                 |
| i18n.wrongFileDize  | `string`   | Dropped file is too big!&lt;br/&gt;Max file size allowed: %s | `%s` will be replaced by option `fileMaxSize` value.                                                                                                                                                              |
| i18n.abort          | `string`   | Abort                                                        |
| i18n.mb             | `string`   | &nbsp;MB                                                     |
| i18n.kb             | `string`   | &nbsp;KB                                                     |
| i18n.percent        | `string`   | %                                                            |
| i18n.dismiss        | `string`   | Dismiss                                                      |
| i18n.error          | `string`   | Err                                                          |
| onSuccess           | `function` | `null`                                                       | Called after the upload succeed. Three arguments are passed: `server_response`, `file_name` and `file`.                                                                                                           |
| onFail              | `function` | `null`                                                       | Called after the upload fail. One argument is passed: `server_response`.                                                                                                                                          |

## Contributions

Feel free to contribute with this project by either suggesting improvements ou bug fixes at the [Issues Page](https://github.com/rogeriotaques/droparea/issues) or forking this repository and submitting [Pull Requests](https://github.com/rogeriotaques/droparea/pulls) (prefered).

I will be more than happy to review and answer all comments and requests, however it may take a few days due to my lack and overload in other projects.

Happy coding! :)
