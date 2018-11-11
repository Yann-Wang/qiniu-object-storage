// const qiniu = require('qiniu');
var url = require('url');
var crypto = require('crypto');
const superagent = require('superagent');

var mac = {
  accessKey: 'DEFAULT_ACCESS_KEY',
  secretKey: 'DEFAULT_SECRET_KEY'
}

function strToBase64(str) {
  let buff = new Buffer(str);
  return buff.toString('base64');
}

exports.hmacSha1 = function(encodedFlags, secretKey) {
  /*
   *return value already encoded with base64
   * */
  var hmac = crypto.createHmac('sha1', secretKey);
  hmac.update(encodedFlags);
  return hmac.digest('base64');
}

exports.base64ToUrlSafe = function(v) {
  return v.replace(/\//g, '_').replace(/\+/g, '-');
}

const generateAccessToken = function(mac, requestURI, reqBody) {
  var u = url.parse(requestURI);
  var path = u.path;
  var access = path + '\n';

  if (reqBody) {
    access += reqBody;
  }

  var digest = exports.hmacSha1(access, mac.secretKey);
  var safeDigest = exports.base64ToUrlSafe(digest);
  return 'QBox ' + mac.accessKey + ':' + safeDigest;
}

// console.log('exports.generateAccessToken: ', exports.generateAccessToken(mac, URL, ''))

const filenameList = [
  'ExecutionEnvironment2.png',
  'RobotoMono-Regular.ttf',
  'RobotoMono.woff2',
  'a-and-stream-demo.jpeg',
  'access-control-expose-headers.jpeg',
  'atg.js',
  'atg.min.js',
  'black.png',
  'css_dom_class_diagram.png',
  'face_tears_apple.png',
  'face_tears_fb.png',
  'face_tears_google.png',
  'face_tears_ms.png',
  'file-download-dialog-demo.jpeg',
  'html_dom_class_diagram.png',
  'lib.js',
  'loading.gif',
  'params-verifier-flow.jpeg',
  'params-verifier-uml.jpeg',
  'prototype-chain.jpeg',
  'react-table-tree.jpeg',
  'robot.woff2',
  'table-tree-demo.jpeg',
  'tiny-loader.js',
  'tiny-loader.min.js',
  'validation-rule.jpeg',
  'watermark.jpeg',
  'white.png',
  'xhr-responseType-blob-compatibility.jpeg'
]


async function execute(filename) {
  const srcBucket = 'spray';
  const distBucket = 'download';
  const srcEntry = `${srcBucket}:${filename}`;
  const distEntry =`${distBucket}:${filename}`;
  const encodedSrcEntry = exports.base64ToUrlSafe(strToBase64(srcEntry));
  const encodedDistEntry = exports.base64ToUrlSafe(strToBase64(distEntry));
  const URL = `http://rs.qiniu.com/move/${encodedSrcEntry}/${encodedDistEntry}/force/true`
  const accessToken = generateAccessToken(mac, URL, '');
  await superagent.post(URL)
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .set('Authorization', accessToken)
    .then(() => {
      console.log(`${filename}: move successfully.`);
      return true;
    })
}

(async function(){
  await Promise.all(filenameList.map(async filename => {
    return (
      new Promise((resolve, reject) => {
        execute(filename).then(data => {
          if (data) {
            return resolve(true);
          }
          return reject();
        })
      })
    )
  }))
})()

console.log('execute over!');