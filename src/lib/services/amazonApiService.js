import crypto from 'crypto';
import https from 'https';

const AMAZON_ACCESS_KEY = process.env.AMAZON_ACCESS_KEY;
const AMAZON_SECRET_KEY = process.env.AMAZON_SECRET_KEY;
const AMAZON_STORE_ID = process.env.AMAZON_STORE_ID;
const AMAZON_REGION = 'us-east-1';
const AMAZON_HOST = 'webservices.amazon.com';
const AMAZON_URI = '/paapi5/searchitems';

function generateSignature(stringToSign, secretKey) {
  return crypto.createHmac('sha256', secretKey)
    .update(stringToSign)
    .digest('hex');
}

function buildCanonicalRequest(method, uri, queryParams, headers, payload) {
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map(key => `${key.toLowerCase()}:${headers[key]}`)
    .join('\n');

  const signedHeaders = Object.keys(headers)
    .sort()
    .map(key => key.toLowerCase())
    .join(';');

  return [
    method,
    uri,
    new URLSearchParams(queryParams).toString(),
    canonicalHeaders + '\n',
    signedHeaders,
    crypto.createHash('sha256').update(payload).digest('hex')
  ].join('\n');
}

export async function searchAmazonProducts(keyword) {
  const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const date = timestamp.slice(0, 8);

  const headers = {
    'content-encoding': 'amz-1.0',
    'content-type': 'application/json; charset=utf-8',
    'host': AMAZON_HOST,
    'x-amz-date': timestamp,
    'x-amz-target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems'
  };

  const payload = JSON.stringify({
    'Keywords': keyword,
    'Resources': [
      'ItemInfo.Title',
      'Offers.Listings.Price',
      'Images.Primary.Large'
    ],
    'PartnerTag': AMAZON_STORE_ID,
    'PartnerType': 'Associates',
    'Marketplace': 'www.amazon.com'
  });

  const canonicalRequest = buildCanonicalRequest(
    'POST',
    AMAZON_URI,
    {},
    headers,
    payload
  );

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    timestamp,
    `${date}/${AMAZON_REGION}/ProductAdvertisingAPI/aws4_request`,
    crypto.createHash('sha256').update(canonicalRequest).digest('hex')
  ].join('\n');

  const kDate = crypto.createHmac('sha256', 'AWS4' + AMAZON_SECRET_KEY).update(date).digest();
  const kRegion = crypto.createHmac('sha256', kDate).update(AMAZON_REGION).digest();
  const kService = crypto.createHmac('sha256', kRegion).update('ProductAdvertisingAPI').digest();
  const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();

  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  const authHeader = [
    `AWS4-HMAC-SHA256 Credential=${AMAZON_ACCESS_KEY}/${date}/${AMAZON_REGION}/ProductAdvertisingAPI/aws4_request`,
    `SignedHeaders=${Object.keys(headers).sort().map(h => h.toLowerCase()).join(';')}`,
    `Signature=${signature}`
  ].join(', ');

  return new Promise((resolve, reject) => {
    const request = https.request({
      hostname: AMAZON_HOST,
      path: AMAZON_URI,
      method: 'POST',
      headers: {
        ...headers,
        'Authorization': authHeader,
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    request.on('error', reject);
    request.write(payload);
    request.end();
  });
}