declare module 'paapi5-nodejs-sdk' {
  export class ApiClient {
    static instance: ApiClient;
    accessKey: string;
    secretKey: string;
    host: string;
    region: string;
  }

  export class DefaultApi {
    searchItems(request: SearchItemsRequest): Promise<any>;
  }

  export class SearchItemsRequest {
    PartnerTag: string;
    PartnerType: string;
    Keywords: string;
    ItemCount: number;
    Resources: string[];
  }
}