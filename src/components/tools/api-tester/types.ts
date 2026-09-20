export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type AuthType = 'none' | 'bearer' | 'basic' | 'apikey';

export type BodyType = 'none' | 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw';

export interface KeyValueParam {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

export interface ApiRequestState {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  params: KeyValueParam[];
  headers: KeyValueParam[];
  auth: {
    type: AuthType;
    bearerToken?: string;
    basicUsername?: string;
    basicPassword?: string;
    apiKeyName?: string;
    apiKeyValue?: string;
    apiKeyLocation?: 'header' | 'query';
  };
  bodyType: BodyType;
  rawBody: string;
  formData: KeyValueParam[];
  urlEncodedData: KeyValueParam[];
  settings: {
    bypassCors: boolean;
    timeoutMs: number;
    followRedirects: boolean;
  };
}

export interface ApiResponseState {
  status: number;
  statusText: string;
  timeMs: number;
  sizeBytes: number;
  headers: Record<string, string>;
  headersList: { key: string; value: string }[];
  contentType: string;
  isJson: boolean;
  isBinary: boolean;
  data: any;
  rawText?: string;
  error?: string;
  url?: string;
  timestamp: number;
  corsMode: 'proxy' | 'direct';
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  method: HttpMethod;
  url: string;
  status?: number;
  statusText?: string;
  timeMs?: number;
  request: ApiRequestState;
}

export interface SavedCollection {
  id: string;
  name: string;
  description?: string;
  items: ApiRequestState[];
}

export interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface Environment {
  id: string;
  name: string;
  variables: EnvironmentVariable[];
}
