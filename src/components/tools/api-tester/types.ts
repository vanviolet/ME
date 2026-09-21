export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type AuthType = 'none' | 'bearer' | 'basic' | 'apikey';

export type BodyType = 'none' | 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw';

export type ParamInLocation = 'query' | 'path' | 'header' | 'formData' | 'body';

export type SwaggerParamType = 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'file';

export type SwaggerPropertyType = 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';

export interface KeyValueParam {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
  type?: SwaggerParamType;
  format?: string;
  required?: boolean;
  location?: ParamInLocation;
}

export interface SwaggerSchemaProperty {
  id: string;
  name: string;
  type: SwaggerPropertyType;
  format?: string;
  description?: string;
  required?: boolean;
  example?: string;
  enum?: string[];
  itemsType?: SwaggerPropertyType;
}

export interface SwaggerSchemaDef {
  type: SwaggerPropertyType;
  title?: string;
  description?: string;
  requiredFields?: string[];
  properties: SwaggerSchemaProperty[];
  itemsType?: SwaggerPropertyType;
  itemsProperties?: SwaggerSchemaProperty[];
  exampleJson?: string;
}

export interface SwaggerResponseDef {
  statusCode: string; // e.g. '200', '201', '400', '404', '500', 'default'
  description: string;
  schemaType?: SwaggerPropertyType;
  schema?: SwaggerSchemaDef;
  examples?: Record<string, any>;
  exampleBody?: string;
}

export interface ApiRequestState {
  id: string;
  name: string;
  summary?: string;
  description?: string;
  operationId?: string;
  tag?: string;
  method: HttpMethod;
  url: string;
  path?: string; // Relative path e.g. /posts/{id}
  params: KeyValueParam[];
  pathParams?: KeyValueParam[];
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
  bodySchema?: SwaggerSchemaDef;
  responses?: Record<string, SwaggerResponseDef>;
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

export interface SwaggerContact {
  name?: string;
  email?: string;
  url?: string;
}

export interface SwaggerLicense {
  name?: string;
  url?: string;
}

export interface SwaggerTag {
  name: string;
  description?: string;
}

export interface SwaggerInfo {
  title: string;
  version: string;
  description: string;
  termsOfService?: string;
  contact?: SwaggerContact;
  license?: SwaggerLicense;
}

export interface WorkspaceProject {
  id: string;
  name: string;
  description?: string;
  swaggerVersion: '2.0';
  info: SwaggerInfo;
  host: string;
  basePath: string;
  schemes: ('http' | 'https' | 'ws' | 'wss')[];
  consumes: string[];
  produces: string[];
  tags: SwaggerTag[];
  endpoints: ApiRequestState[];
  createdAt: number;
  updatedAt: number;
}

// Deprecated alias for backwards compatibility
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
