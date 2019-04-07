// Copyright 2017- Paul Brewer, Economic and Financial Technology Consulting LLC
// License: MIT

const digestStream = require('digest-stream');

async function uploaderForGoogleDriveResumableUploadUrl({
  sourceStream,
  mimeType,
  url,
  request,
  urlPrefix = "https://www.googleapis.com"
}) {
  if (typeof(url) !== "string") throw new Error("url should be a string");
  if (!(url.startsWith(urlPrefix))) throw new Error("incorrect url, got:" + url);
  let md5, length; // eslint-disable-line no-unused-vars
  const md5buddy = digestStream('md5', 'hex', function (_md5, _length) {
    md5 = _md5;
    length = _length;
  });
  const isBinary = (!mimeType) || (!mimeType.startsWith('text'));
  sourceStream.on('error', function (e) { throw new Error("upload error on source: " + e); });
  const dataStream = (isBinary) ? sourceStream.pipe(md5buddy) : sourceStream;
  const driveupload = {
    method: 'post',
    url,
    headers: {
      'Content-Type': mimeType
    }
  };
  return new Promise(function (resolve) {
    const uploadRequest = request(driveupload, (err, response, body) => {
      if (err) throw new Error("upload error code: "+(response && response.statusCode)+" "+err);
      let result;
      if (typeof(body) === 'string') {
        try {
          result = JSON.parse(body);
        } catch (e) { result = body; }
      } else {
        result = body;
      }
      if (isBinary && result && result.md5Checksum) {
        // check md5 only on binary data, and only if reported back by Google Drive API
        result.ourMD5 = md5; // set ours here too
        if (md5 !== result.md5Checksum) {
          throw new Error('bad md5 checksum on upload to Google Drive:', JSON.stringify(result));
        }
      }
      resolve(result);
    });
    dataStream.pipe(uploadRequest);
  });
}

module.exports.uploaderForGoogleDriveResumableUploadUrl = uploaderForGoogleDriveResumableUploadUrl;
