import * as yaml from 'js-yaml';
import {
  ApiRequestState,
  HttpMethod,
  KeyValueParam,
  SwaggerParamType,
  SwaggerPropertyType,
  SwaggerResponseDef,
  SwaggerSchemaDef,
  SwaggerSchemaProperty,
  WorkspaceProject,
} from './types';

/**
 * Normalizes an API path into standard Swagger format:
 * e.g. "https://api.example.com/v1/posts/1" or "/posts/{id}" -> "/posts/{id}"
 */
export function extractSwaggerPath(rawUrl: string, host: string = '', basePath: string = ''): string {
  if (!rawUrl) return '/';

  let pathPart = rawUrl.trim();

  // Strip query string and hashes
  const qIndex = pathPart.indexOf('?');
  if (qIndex !== -1) {
    pathPart = pathPart.substring(0, qIndex);
  }
  const hIndex = pathPart.indexOf('#');
  if (hIndex !== -1) {
    pathPart = pathPart.substring(0, hIndex);
  }

  // Strip protocol and domain if full URL
  try {
    if (pathPart.startsWith('http://') || pathPart.startsWith('https://')) {
      const parsed = new URL(pathPart);
      pathPart = parsed.pathname;
    }
  } catch {
    // If not a full URL, strip leading hostname if present
    pathPart = pathPart.replace(/^https?:\/\/[^/]+/i, '');
  }

  // Strip basePath if path starts with it
  if (basePath && basePath !== '/' && pathPart.startsWith(basePath)) {
    pathPart = pathPart.substring(basePath.length);
  }

  if (!pathPart.startsWith('/')) {
    pathPart = '/' + pathPart;
  }

  return pathPart;
}

/**
 * Detects path parameters in URL template like `/posts/{id}` or `:id`
 */
export function extractPathParamsFromTemplate(pathTemplate: string): string[] {
  const matches = pathTemplate.match(/\{([^}]+)\}/g);
  if (matches) {
    return matches.map(m => m.replace(/[{}]/g, '').trim());
  }
  // also check express style :param
  const expressMatches = pathTemplate.match(/:([a-zA-Z0-9_]+)/g);
  if (expressMatches) {
    return expressMatches.map(m => m.substring(1).trim());
  }
  return [];
}

/**
 * Automatically infers a SwaggerSchemaDef from an arbitrary JSON value.
 */
export function inferSchemaFromJson(data: any): SwaggerSchemaDef {
  if (data === null || data === undefined) {
    return {
      type: 'object',
      properties: [],
      exampleJson: '{}',
    };
  }

  if (Array.isArray(data)) {
    const firstItem = data[0];
    if (firstItem !== undefined && typeof firstItem === 'object' && firstItem !== null) {
      const childSchema = inferSchemaFromJson(firstItem);
      return {
        type: 'array',
        itemsType: 'object',
        properties: [],
        itemsProperties: childSchema.properties,
        exampleJson: JSON.stringify(data.slice(0, 2), null, 2),
      };
    } else {
      const primitiveType = typeof firstItem;
      const swaggerType: SwaggerPropertyType =
        primitiveType === 'number'
          ? Number.isInteger(firstItem)
            ? 'integer'
            : 'number'
          : primitiveType === 'boolean'
          ? 'boolean'
          : 'string';
      return {
        type: 'array',
        itemsType: swaggerType,
        properties: [],
        exampleJson: JSON.stringify(data, null, 2),
      };
    }
  }

  if (typeof data === 'object') {
    const properties: SwaggerSchemaProperty[] = [];
    const keys = Object.keys(data);

    for (const key of keys) {
      const val = data[key];
      const valType = typeof val;

      let propType: SwaggerPropertyType = 'string';
      let format: string | undefined = undefined;

      if (val === null || val === undefined) {
        propType = 'string';
      } else if (Array.isArray(val)) {
        propType = 'array';
      } else if (valType === 'boolean') {
        propType = 'boolean';
      } else if (valType === 'number') {
        if (Number.isInteger(val)) {
          propType = 'integer';
          format = 'int32';
        } else {
          propType = 'number';
          format = 'float';
        }
      } else if (valType === 'object') {
        propType = 'object';
      } else {
        propType = 'string';
        // Check for common formats
        if (typeof val === 'string') {
          if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) {
            format = 'date-time';
          } else if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
            format = 'date';
          } else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
            format = 'email';
          } else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)) {
            format = 'uuid';
          }
        }
      }

      properties.push({
        id: 'prop_' + Math.random().toString(36).substring(2, 9),
        name: key,
        type: propType,
        format,
        required: false,
        example: val !== null && val !== undefined ? (typeof val === 'object' ? JSON.stringify(val) : String(val)) : '',
        description: '',
      });
    }

    return {
      type: 'object',
      properties,
      exampleJson: JSON.stringify(data, null, 2),
    };
  }

  return {
    type: 'string',
    properties: [],
    exampleJson: String(data),
  };
}

/**
 * Generates sample JSON output based on a SwaggerSchemaDef.
 */
export function generateSampleJsonFromSchema(schema?: SwaggerSchemaDef): any {
  if (!schema) return {};

  if (schema.exampleJson) {
    try {
      return JSON.parse(schema.exampleJson);
    } catch {}
  }

  if (schema.type === 'array') {
    if (schema.itemsType === 'object' && schema.itemsProperties && schema.itemsProperties.length > 0) {
      const itemObj: Record<string, any> = {};
      for (const prop of schema.itemsProperties) {
        itemObj[prop.name] = getSampleValueForProp(prop);
      }
      return [itemObj];
    }
    return [getSampleValueByType(schema.itemsType || 'string')];
  }

  if (schema.type === 'object') {
    const result: Record<string, any> = {};
    for (const prop of schema.properties || []) {
      result[prop.name] = getSampleValueForProp(prop);
    }
    return result;
  }

  return getSampleValueByType(schema.type);
}

function getSampleValueForProp(prop: SwaggerSchemaProperty): any {
  if (prop.example !== undefined && prop.example !== '') {
    if (prop.type === 'number' || prop.type === 'integer') {
      const n = Number(prop.example);
      if (!isNaN(n)) return n;
    }
    if (prop.type === 'boolean') {
      return prop.example === 'true' || prop.example === '1';
    }
    if (prop.type === 'object' || prop.type === 'array') {
      try {
        return JSON.parse(prop.example);
      } catch {}
    }
    return prop.example;
  }

  if (prop.enum && prop.enum.length > 0) {
    return prop.enum[0];
  }

  return getSampleValueByType(prop.type, prop.format, prop.name);
}

function getSampleValueByType(type: SwaggerPropertyType, format?: string, propName: string = ''): any {
  const lowerName = propName.toLowerCase();
  switch (type) {
    case 'integer':
      if (lowerName.includes('id')) return 1;
      if (lowerName.includes('age')) return 25;
      if (lowerName.includes('count') || lowerName.includes('total')) return 100;
      return 0;
    case 'number':
      if (lowerName.includes('price') || lowerName.includes('amount')) return 49.99;
      if (lowerName.includes('rating')) return 4.8;
      return 0.0;
    case 'boolean':
      return true;
    case 'array':
      return [];
    case 'object':
      return {};
    case 'string':
    default:
      if (format === 'email' || lowerName.includes('email')) return 'user@example.com';
      if (format === 'date-time') return new Date().toISOString();
      if (format === 'date') return new Date().toISOString().split('T')[0];
      if (format === 'uuid' || lowerName.includes('uuid')) return '123e4567-e89b-12d3-a456-426614174000';
      if (lowerName.includes('name')) return 'Sample Name';
      if (lowerName.includes('title')) return 'Sample Title';
      if (lowerName.includes('status')) return 'active';
      if (lowerName.includes('url') || lowerName.includes('image')) return 'https://example.com/asset.png';
      return 'sample_string';
  }
}

/**
 * Builds a Swagger Schema Object from SwaggerSchemaDef for Swagger 2.0.
 */
function buildSwagger2SchemaObject(schemaDef?: SwaggerSchemaDef): any {
  if (!schemaDef) {
    return { type: 'object' };
  }

  if (schemaDef.type === 'array') {
    const itemsSchema: any = {};
    if (schemaDef.itemsType === 'object' && schemaDef.itemsProperties && schemaDef.itemsProperties.length > 0) {
      itemsSchema.type = 'object';
      itemsSchema.properties = {};
      const requiredList: string[] = [];
      for (const p of schemaDef.itemsProperties) {
        itemsSchema.properties[p.name] = {
          type: p.type,
          description: p.description || undefined,
          example: p.example || undefined,
          format: p.format || undefined,
        };
        if (p.required) requiredList.push(p.name);
      }
      if (requiredList.length > 0) itemsSchema.required = requiredList;
    } else {
      itemsSchema.type = schemaDef.itemsType || 'string';
    }

    return {
      type: 'array',
      description: schemaDef.description || undefined,
      items: itemsSchema,
    };
  }

  if (schemaDef.type === 'object') {
    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const prop of schemaDef.properties || []) {
      properties[prop.name] = {
        type: prop.type,
        format: prop.format || undefined,
        description: prop.description || undefined,
        example: prop.example || undefined,
        enum: prop.enum && prop.enum.length > 0 ? prop.enum : undefined,
      };
      if (prop.required) {
        required.push(prop.name);
      }
    }

    const schemaObj: any = {
      type: 'object',
      description: schemaDef.description || undefined,
      properties,
    };

    if (required.length > 0) {
      schemaObj.required = required;
    }

    if (schemaDef.exampleJson) {
      try {
        schemaObj.example = JSON.parse(schemaDef.exampleJson);
      } catch {}
    }

    return schemaObj;
  }

  return {
    type: schemaDef.type,
    description: schemaDef.description || undefined,
  };
}

/**
 * Generates a complete, standard-compliant Swagger 2.0 JSON specification document.
 * Follows Swagger 2.0 specification:
 * - https://swagger.io/docs/specification/v2_0/basic-structure/
 * - https://swagger.io/docs/specification/v2_0/paths-and-operations/
 */
export function generateSwaggerJson(workspace: WorkspaceProject): any {
  // Determine host and basePath
  let host = workspace.host || '';
  let basePath = workspace.basePath || '/';

  if (!basePath.startsWith('/')) {
    basePath = '/' + basePath;
  }

  const swaggerDoc: any = {
    swagger: '2.0',
    info: {
      title: workspace.info?.title || workspace.name || 'API Documentation',
      version: workspace.info?.version || '1.0.0',
      description: workspace.info?.description || workspace.description || 'Generated with API Testing Studio',
    },
    host: host || 'api.example.com',
    basePath: basePath,
    schemes: workspace.schemes && workspace.schemes.length > 0 ? workspace.schemes : ['https', 'http'],
    consumes: workspace.consumes && workspace.consumes.length > 0 ? workspace.consumes : ['application/json'],
    produces: workspace.produces && workspace.produces.length > 0 ? workspace.produces : ['application/json'],
  };

  if (workspace.info?.termsOfService) {
    swaggerDoc.info.termsOfService = workspace.info.termsOfService;
  }

  if (workspace.info?.contact && (workspace.info.contact.name || workspace.info.contact.email || workspace.info.contact.url)) {
    swaggerDoc.info.contact = workspace.info.contact;
  }

  if (workspace.info?.license && (workspace.info.license.name || workspace.info.license.url)) {
    swaggerDoc.info.license = workspace.info.license;
  }

  if (workspace.tags && workspace.tags.length > 0) {
    swaggerDoc.tags = workspace.tags.map(t => ({
      name: t.name,
      description: t.description || undefined,
    }));
  }

  // Paths mapping
  const paths: Record<string, any> = {};

  for (const endpoint of workspace.endpoints) {
    const rawPath = endpoint.path || extractSwaggerPath(endpoint.url, host, basePath);
    const normalizedPath = rawPath.startsWith('/') ? rawPath : '/' + rawPath;

    if (!paths[normalizedPath]) {
      paths[normalizedPath] = {};
    }

    const methodKey = endpoint.method.toLowerCase();

    // Collect tags
    const endpointTags: string[] = [];
    if (endpoint.tag && endpoint.tag.trim()) {
      endpointTags.push(endpoint.tag.trim());
    }

    // Parameters
    const parameters: any[] = [];

    // 1. Path parameters (from path template {id} or :id or explicit pathParams)
    const detectedPathKeys = extractPathParamsFromTemplate(normalizedPath);
    const explicitPathParams = endpoint.pathParams || [];

    for (const key of detectedPathKeys) {
      const explicit = explicitPathParams.find(p => p.key === key);
      parameters.push({
        name: key,
        in: 'path',
        required: true, // Swagger 2.0 strictly requires path params to be required: true
        type: explicit?.type || 'string',
        format: explicit?.format || (explicit?.type === 'integer' ? 'int64' : undefined),
        description: explicit?.description || `Path parameter for ${key}`,
        default: explicit?.value || undefined,
      });
    }

    // 2. Query parameters
    for (const param of endpoint.params) {
      if (!param.key || !param.key.trim()) continue;
      parameters.push({
        name: param.key.trim(),
        in: 'query',
        required: Boolean(param.required),
        type: param.type || 'string',
        format: param.format || undefined,
        description: param.description || undefined,
        default: param.value ? param.value : undefined,
      });
    }

    // 3. Header parameters
    for (const header of endpoint.headers) {
      if (!header.key || !header.key.trim()) continue;
      // Skip standard headers handled by consumes/produces
      const lowerKey = header.key.toLowerCase();
      if (lowerKey === 'content-type' || lowerKey === 'accept') continue;

      parameters.push({
        name: header.key.trim(),
        in: 'header',
        required: Boolean(header.required),
        type: header.type || 'string',
        format: header.format || undefined,
        description: header.description || undefined,
        default: header.value ? header.value : undefined,
      });
    }

    // 4. Body parameter / FormData parameter
    if (['post', 'put', 'patch'].includes(methodKey)) {
      if (endpoint.bodyType === 'json') {
        let bodySchema = endpoint.bodySchema;
        if (!bodySchema || (bodySchema.properties?.length === 0 && !bodySchema.exampleJson)) {
          if (endpoint.rawBody && endpoint.rawBody.trim()) {
            try {
              const parsed = JSON.parse(endpoint.rawBody);
              bodySchema = inferSchemaFromJson(parsed);
            } catch {}
          }
        }

        parameters.push({
          name: 'body',
          in: 'body',
          required: true,
          description: endpoint.bodySchema?.description || 'Request payload',
          schema: buildSwagger2SchemaObject(bodySchema),
        });
      } else if (endpoint.bodyType === 'x-www-form-urlencoded' || endpoint.bodyType === 'form-data') {
        const formItems = endpoint.bodyType === 'form-data' ? endpoint.formData : endpoint.urlEncodedData;
        for (const item of formItems) {
          if (!item.key || !item.key.trim()) continue;
          parameters.push({
            name: item.key.trim(),
            in: 'formData',
            required: Boolean(item.required),
            type: item.type || 'string',
            description: item.description || undefined,
            default: item.value || undefined,
          });
        }
      }
    }

    // Responses
    const responses: Record<string, any> = {};

    if (endpoint.responses && Object.keys(endpoint.responses).length > 0) {
      for (const [code, resp] of Object.entries(endpoint.responses)) {
        const respObj: any = {
          description: resp.description || `HTTP ${code} Response`,
        };

        if (resp.schema) {
          respObj.schema = buildSwagger2SchemaObject(resp.schema);
        } else if (resp.exampleBody) {
          try {
            const parsedExample = JSON.parse(resp.exampleBody);
            respObj.schema = buildSwagger2SchemaObject(inferSchemaFromJson(parsedExample));
            respObj.examples = {
              'application/json': parsedExample,
            };
          } catch {}
        }

        if (resp.examples) {
          respObj.examples = resp.examples;
        }

        responses[code] = respObj;
      }
    } else {
      // Default 200 response
      responses['200'] = {
        description: 'Successful response',
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation completed successfully' },
          },
        },
      };
    }

    const operationObj: any = {
      summary: endpoint.summary || endpoint.name || `${endpoint.method} ${normalizedPath}`,
      description: endpoint.description || undefined,
      operationId: endpoint.operationId || `${methodKey}_${normalizedPath.replace(/[^a-zA-Z0-9]/g, '_')}`.replace(/_+/g, '_'),
      tags: endpointTags.length > 0 ? endpointTags : undefined,
      parameters: parameters.length > 0 ? parameters : undefined,
      responses,
    };

    if (endpoint.bodyType === 'form-data') {
      operationObj.consumes = ['multipart/form-data'];
    } else if (endpoint.bodyType === 'x-www-form-urlencoded') {
      operationObj.consumes = ['application/x-www-form-urlencoded'];
    }

    paths[normalizedPath][methodKey] = operationObj;
  }

  swaggerDoc.paths = paths;

  return swaggerDoc;
}

/**
 * Generates a YAML string representation of the Swagger 2.0 document.
 */
export function generateSwaggerYaml(workspace: WorkspaceProject): string {
  const jsonDoc = generateSwaggerJson(workspace);
  try {
    return yaml.dump(jsonDoc, { indent: 2, lineWidth: -1, noRefs: true });
  } catch (err: any) {
    return `# Error generating YAML: ${err.message}\n` + JSON.stringify(jsonDoc, null, 2);
  }
}

/**
 * Parses either Swagger 2.0 or OpenAPI 3.0 from JSON or YAML string,
 * returning a normalized WorkspaceProject.
 */
export function parseSwaggerOrOpenApi(rawContent: string): { workspace: WorkspaceProject; warnings: string[] } {
  const warnings: string[] = [];
  let parsed: any = null;

  const trimmed = rawContent.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      parsed = JSON.parse(trimmed);
    } catch (e: any) {
      // Fallback to yaml parser
      try {
        parsed = yaml.load(trimmed);
      } catch (yamlErr: any) {
        throw new Error('Gagal membaca file JSON/YAML: ' + e.message);
      }
    }
  } else {
    try {
      parsed = yaml.load(trimmed);
    } catch (yamlErr: any) {
      throw new Error('Format YAML tidak valid: ' + yamlErr.message);
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('File tidak berisi objek Swagger atau OpenAPI yang valid.');
  }

  const isOpenApi3 = Boolean(parsed.openapi && String(parsed.openapi).startsWith('3.'));
  const isSwagger2 = parsed.swagger === '2.0';

  if (!isOpenApi3 && !isSwagger2 && !parsed.paths) {
    warnings.push('File tidak memiliki deklarasi swagger: "2.0" atau openapi: "3.x", mencoba membaca sebagai format generik.');
  }

  // Extract Info
  const infoTitle = parsed.info?.title || 'Imported API Project';
  const infoVersion = parsed.info?.version || '1.0.0';
  const infoDesc = parsed.info?.description || 'Imported Swagger/OpenAPI specification.';

  // Extract host, basePath, schemes
  let host = parsed.host || '';
  let basePath = parsed.basePath || '/';
  let schemes: ('http' | 'https' | 'ws' | 'wss')[] = ['https'];

  if (isOpenApi3 && parsed.servers && Array.isArray(parsed.servers) && parsed.servers.length > 0) {
    const serverUrl = parsed.servers[0].url || '';
    try {
      if (serverUrl.startsWith('http')) {
        const u = new URL(serverUrl);
        host = u.host;
        basePath = u.pathname || '/';
        schemes = [u.protocol.replace(':', '') as any];
      } else {
        basePath = serverUrl;
      }
    } catch {}
  }

  if (parsed.schemes && Array.isArray(parsed.schemes)) {
    schemes = parsed.schemes;
  }

  // Extract Tags
  const tags: { name: string; description?: string }[] = [];
  if (parsed.tags && Array.isArray(parsed.tags)) {
    for (const t of parsed.tags) {
      if (t && t.name) {
        tags.push({ name: t.name, description: t.description });
      }
    }
  }

  // Extract Endpoints / Operations from Paths
  const endpoints: ApiRequestState[] = [];
  const pathsObj = parsed.paths || {};

  for (const [pathKey, pathItem] of Object.entries(pathsObj)) {
    if (!pathItem || typeof pathItem !== 'object') continue;

    const commonParams = Array.isArray((pathItem as any).parameters) ? (pathItem as any).parameters : [];

    const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

    for (const m of HTTP_METHODS) {
      const op = (pathItem as any)[m.toLowerCase()];
      if (!op) continue;

      const opSummary = op.summary || `${m} ${pathKey}`;
      const opDesc = op.description || '';
      const opId = op.operationId || `op_${Math.random().toString(36).substring(2, 8)}`;
      const opTag = Array.isArray(op.tags) && op.tags.length > 0 ? op.tags[0] : '';

      // Merge common path parameters and operation parameters
      const allParams = [...commonParams, ...(Array.isArray(op.parameters) ? op.parameters : [])];

      const queryParams: KeyValueParam[] = [];
      const pathParams: KeyValueParam[] = [];
      const headers: KeyValueParam[] = [
        { id: 'h_acc', key: 'Accept', value: 'application/json', enabled: true },
      ];
      let bodyType: ApiRequestState['bodyType'] = 'none';
      let rawBody = '';
      let bodySchema: SwaggerSchemaDef | undefined = undefined;
      const formData: KeyValueParam[] = [];

      for (const p of allParams) {
        if (!p || typeof p !== 'object') continue;

        const pIn = p.in;
        const pName = p.name;
        if (!pName) continue;

        const kvParam: KeyValueParam = {
          id: 'p_' + Math.random().toString(36).substring(2, 9),
          key: pName,
          value: p.default !== undefined ? String(p.default) : (p.example !== undefined ? String(p.example) : ''),
          enabled: true,
          description: p.description,
          type: (p.type as SwaggerParamType) || 'string',
          format: p.format,
          required: Boolean(p.required),
          location: pIn,
        };

        if (pIn === 'query') {
          queryParams.push(kvParam);
        } else if (pIn === 'path') {
          pathParams.push({ ...kvParam, required: true });
        } else if (pIn === 'header') {
          headers.push(kvParam);
        } else if (pIn === 'formData') {
          bodyType = 'form-data';
          formData.push(kvParam);
        } else if (pIn === 'body' && p.schema) {
          bodyType = 'json';
          bodySchema = parseSwaggerSchemaToDef(p.schema, parsed.definitions);
          if (p.schema.example) {
            rawBody = JSON.stringify(p.schema.example, null, 2);
          } else {
            rawBody = JSON.stringify(generateSampleJsonFromSchema(bodySchema), null, 2);
          }
        }
      }

      // Handle OpenAPI 3.0 requestBody
      if (isOpenApi3 && op.requestBody && op.requestBody.content) {
        const jsonContent = op.requestBody.content['application/json'];
        const formContent = op.requestBody.content['application/x-www-form-urlencoded'] || op.requestBody.content['multipart/form-data'];

        if (jsonContent && jsonContent.schema) {
          bodyType = 'json';
          bodySchema = parseSwaggerSchemaToDef(jsonContent.schema, parsed.components?.schemas);
          if (jsonContent.example) {
            rawBody = JSON.stringify(jsonContent.example, null, 2);
          } else {
            rawBody = JSON.stringify(generateSampleJsonFromSchema(bodySchema), null, 2);
          }
        } else if (formContent) {
          bodyType = 'form-data';
        }
      }

      // Extract Responses
      const responses: Record<string, SwaggerResponseDef> = {};
      if (op.responses && typeof op.responses === 'object') {
        for (const [code, r] of Object.entries(op.responses)) {
          if (!r || typeof r !== 'object') continue;
          const rObj = r as any;

          let respSchemaDef: SwaggerSchemaDef | undefined = undefined;
          let exampleBody = '';

          if (rObj.schema) {
            respSchemaDef = parseSwaggerSchemaToDef(rObj.schema, parsed.definitions);
          } else if (isOpenApi3 && rObj.content?.['application/json']?.schema) {
            respSchemaDef = parseSwaggerSchemaToDef(rObj.content['application/json'].schema, parsed.components?.schemas);
          }

          if (rObj.examples?.['application/json']) {
            exampleBody = JSON.stringify(rObj.examples['application/json'], null, 2);
          } else if (respSchemaDef) {
            exampleBody = JSON.stringify(generateSampleJsonFromSchema(respSchemaDef), null, 2);
          }

          responses[code] = {
            statusCode: code,
            description: rObj.description || `Status ${code}`,
            schema: respSchemaDef,
            exampleBody,
          };
        }
      }

      // Build initial request URL
      const protocol = schemes[0] || 'https';
      const hostPart = host ? `${protocol}://${host}` : 'https://api.example.com';
      const cleanBasePath = basePath === '/' ? '' : basePath;
      const initialUrl = `${hostPart}${cleanBasePath}${pathKey}`;

      endpoints.push({
        id: 'ep_' + Math.random().toString(36).substring(2, 9),
        name: opSummary,
        summary: opSummary,
        description: opDesc,
        operationId: opId,
        tag: opTag,
        method: m,
        url: initialUrl,
        path: pathKey,
        params: queryParams,
        pathParams,
        headers,
        auth: { type: 'none' },
        bodyType,
        rawBody,
        formData,
        urlEncodedData: [],
        bodySchema,
        responses,
        settings: {
          bypassCors: true,
          timeoutMs: 30000,
          followRedirects: true,
        },
      });
    }
  }

  const workspace: WorkspaceProject = {
    id: 'ws_' + Date.now(),
    name: infoTitle,
    description: infoDesc,
    swaggerVersion: '2.0',
    info: {
      title: infoTitle,
      version: infoVersion,
      description: infoDesc,
      termsOfService: parsed.info?.termsOfService,
      contact: parsed.info?.contact,
      license: parsed.info?.license,
    },
    host,
    basePath,
    schemes,
    consumes: parsed.consumes || ['application/json'],
    produces: parsed.produces || ['application/json'],
    tags,
    endpoints,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return { workspace, warnings };
}

/**
 * Resolves simple schema definitions into SwaggerSchemaDef.
 */
function parseSwaggerSchemaToDef(schema: any, definitions?: Record<string, any>): SwaggerSchemaDef {
  if (!schema) {
    return { type: 'object', properties: [] };
  }

  // Handle $ref
  if (schema.$ref && typeof schema.$ref === 'string' && definitions) {
    const refKey = schema.$ref.replace(/^#\/(definitions|components\/schemas)\//, '');
    if (definitions[refKey]) {
      return parseSwaggerSchemaToDef(definitions[refKey], definitions);
    }
  }

  const schemaType = schema.type || (schema.properties ? 'object' : 'string');

  if (schemaType === 'array') {
    const items = schema.items || {};
    let itemsType: SwaggerPropertyType = items.type || 'string';
    let itemsProps: SwaggerSchemaProperty[] = [];

    if (items.properties) {
      itemsType = 'object';
      for (const [k, v] of Object.entries(items.properties)) {
        const pObj = v as any;
        itemsProps.push({
          id: 'prop_' + Math.random().toString(36).substring(2, 9),
          name: k,
          type: pObj.type || 'string',
          format: pObj.format,
          description: pObj.description,
          example: pObj.example !== undefined ? String(pObj.example) : '',
          required: Array.isArray(items.required) ? items.required.includes(k) : false,
        });
      }
    }

    return {
      type: 'array',
      itemsType,
      itemsProperties: itemsProps,
      properties: [],
    };
  }

  if (schemaType === 'object' || schema.properties) {
    const props: SwaggerSchemaProperty[] = [];
    const requiredList = Array.isArray(schema.required) ? schema.required : [];

    for (const [k, v] of Object.entries(schema.properties || {})) {
      const pObj = v as any;
      props.push({
        id: 'prop_' + Math.random().toString(36).substring(2, 9),
        name: k,
        type: pObj.type || 'string',
        format: pObj.format,
        description: pObj.description,
        example: pObj.example !== undefined ? String(pObj.example) : '',
        required: requiredList.includes(k),
        enum: Array.isArray(pObj.enum) ? pObj.enum.map(String) : undefined,
      });
    }

    return {
      type: 'object',
      properties: props,
    };
  }

  return {
    type: schemaType,
    properties: [],
  };
}
