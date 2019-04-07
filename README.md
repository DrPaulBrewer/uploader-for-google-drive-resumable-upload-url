# uploader-for-google-drive-resumable-upload-url

This upload code was isolated from npm:decorated-google-drive and cleaned up a bit.

It handles the upload to a Google API v3 Resumable Upload URL provided from
an external service, checking the URL points to Google, uploading a stream,
checking the MD5 signature, and returning the new Google Drive file object.

## Usage

### Install

Pre-requisites are:
1. an external source of Google Drive API v3 Resumable Upload Urls (e.g. a service running npm: googleapis and perhaps npm: decorated-google-drive )
1. npm:request

```
npm i request -S
npm i uploader-for-google-drive-resumable-upload-url -S
```

### Use

    const request = require('request');
    const uploader = require('uploder-for-google-drive-resumable-upload-url');
    async function processTheUpload(url, pathToLocalSourceFile){
      const sourceStream = fs.createReadStream(pathToLocalSourceFile);
      const mimeType = "application/octet-stream"; // generic binary file
      const params = {
        sourceStream,
        mimeType,
        url,
        request // the npm: request module
      };
      const result = await uploader(params);
      return result;
    }

### Obtaining a Google Drive API v3 Resumable Upload URL

This module does not obtain the required url.

npm:decorated-google-drive can obtain the required url with `drive.x.uploadDirector`

Also, Google "Google Drive API v3 Resumable Upload" for more information.

### OAuth2 Security Note

The service request (not provided in this code) to obtain a resumable upload url
typically requires the Drive customer's Google Drive OAuth2 token.

Subsequently posting to the resumable upload url does NOT currently require an
OAuth2 token.  These urls are intended for uploading a specific folder and file to a specific customer.

### Verifying Uploads

This code verifies "binary" uploads only by comparing a locally generated
MD5 hash with one returned from the upload post to google. Uploads that have a
streaming error or have a MD5 hash mismatch throw an error. Errors can be
caught by subsequent code in the usual way with `.catch(function(err){ ... })`
or by using a try-catch block within an `async` function.

Text uploads are not verified.

A "binary" is any `mimeType` not beginning with `text`.  Some source code
types, although text in a broader sense, do not have mimeType `text/plain` but
rather  `application/json` or `application/javascript` and will undergo
verification.

## Tests

This module does not currently include its own tests.  The module is
a imported into `npm:decorated-google-drive` where it processes all uploads
generated in that code.  We regularly test that code.

## License: MIT

This code Copyright 2017, 2019- Paul Brewer, Economic and Financial Technology Consulting LLC <drpaulbrewer@eaftc.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

### No relationship to Google, Inc.

This is third party software, not a product of Google Inc.

Google Drive[tm] is a trademark of Google, Inc.
