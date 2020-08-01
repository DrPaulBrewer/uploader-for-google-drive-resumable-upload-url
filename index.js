// Copyright 2017- Paul Brewer, Economic and Financial Technology Consulting LLC
// License: MIT

const digestStream = require('digest-stream');

function assertMD5Match(result){
  if (result && result.md5Checksum && result.ourMD5) {
    // check md5 only on binary data, and only if reported back by Google Drive API
    if (result.ourMD5 !== result.md5Checksum) {
      throw new Error('bad md5 checksum on upload to Google Drive:'+JSON.stringify(result));
    }
  }
}

async function uploaderForGoogleDriveResumableUploadUrl({
  sourceStream,
  mimeType,
  url,
  axios,
  urlPrefix = "https://www.googleapis.com"
}) {
  if (typeof(url) !== "string") throw new Error("url should be a string");
  if (!(url.startsWith(urlPrefix))) throw new Error("incorrect url, got:" + url);
  let md5;
  const md5buddy = digestStream('md5', 'hex', function (_md5) {
    md5 = _md5;
  });
  const isBinary = (!mimeType) || (!mimeType.startsWith('text'));
  sourceStream.on('error', function (e) { throw new Error("upload error on source: " + e); });
  const dataStream = (isBinary) ? sourceStream.pipe(md5buddy) : sourceStream;
  const headers = {
      'Content-Type': mimeType
  };
  if (axios){
    const options = {
      headers,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    };
    const response = await axios.post(url,dataStream,options);
    if (response.status>=400){
      throw new Error(`upload error code: ${response.status} ${response.statusText}`);
    }
    const result = response.data;
    result.ourMD5 = md5; // set ours here too so the assert will find it
    if (isBinary) assertMD5Match(result);
    return result;
  }
  throw new Error("no https request module provided, must provide one of -- axios -- when initializing this module");
}

module.exports = uploaderForGoogleDriveResumableUploadUrl;
