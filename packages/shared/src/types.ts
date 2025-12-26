/**
 * Postman Collection Types
 */

export interface PostmanUrl {
  raw?: string;
  protocol?: string;
  host?: string | string[];
  path?: string | string[];
  query?: PostmanQueryParam[];
  variable?: PostmanVariable[];
}

export interface PostmanQueryParam {
  key: string;
  value: string;
  disabled?: boolean;
  description?: string | { content: string; type: string };
}

export interface PostmanVariable {
  key: string;
  value: string;
  type?: string;
  disabled?: boolean;
  description?: string | { content: string; type: string };
}

export interface PostmanHeader {
  key: string;
  value: string;
  disabled?: boolean;
  description?: string | { content: string; type: string };
}

export interface PostmanBody {
  mode: string;
  raw?: string;
  options?: {
    raw?: {
      language?: string;
      headerFamily?: string;
    };
  };
}

export interface PostmanRequest {
  name: string;
  description?: string;
  url: PostmanUrl;
  method: string;
  header?: PostmanHeader[];
  body?: PostmanBody;
  auth?: any;
}

export interface PostmanResponse {
  id?: string;
  name: string;
  originalRequest?: PostmanRequest;
  status: string;
  code: number;
  header?: PostmanHeader[];
  body?: string;
  _postman_previewlanguage?: string;
}

export interface PostmanItem {
  id?: string;
  name: string;
  description?: string | { content: string; type: string };
  item?: PostmanItem[];
  request?: PostmanRequest;
  response?: PostmanResponse[];
  event?: PostmanEvent[];
}

export interface PostmanEvent {
  listen: string;
  script: {
    type: string;
    exec: string[];
  };
}

export interface PostmanInfo {
  name: string;
  description?: string | { content: string; type: string };
  schema: string;
  _postman_id?: string;
}

export interface PostmanCollection {
  info: PostmanInfo;
  item: PostmanItem[];
  variable?: PostmanVariable[];
  event?: PostmanEvent[];
}

/**
 * Configuration Types
 */

export interface FilterConfig {
  include?: Record<string, boolean>;
  note?: string;
  normalizationRules?: Record<string, string>;
}

export interface DescriptionConfig {
  collection?: Record<
    string,
    {
      name?: string;
      description?: string;
    }
  >;
  folders?: Record<string, string>;
  requests?: Record<string, string>;
}

export interface ExampleResponse {
  name: string;
  status: string;
  code: number;
  body?: any;
}

export interface ExampleConfig {
  requests?: Record<string, { body?: any }>;
  responses?: Record<string, ExampleResponse>;
}

export interface VariableConfig {
  path?: Record<string, string>;
  query?: Record<string, string>;
  environment?: Record<string, string>;
  descriptions?: Record<string, string>;
  baseUrlVar?: string;
}

export interface TestConfig {
  auto?: boolean;
}

export interface OrganizeConfig {
  enabled: boolean;
  strategy?: 'resources' | 'tags' | 'flat';
  nestingLevel?: number;
  excludePathParams?: boolean;
}

export interface PathVariablesConfig {
  enabled: boolean;
  mapping?: Record<string, { reference: string; description?: string }>;
}

export interface EnrichmentConfig {
  filter?: FilterConfig;
  descriptions?: DescriptionConfig;
  examples?: ExampleConfig;
  variables?: VariableConfig;
  tests?: TestConfig;
  organize?: OrganizeConfig;
  pathVariables?: PathVariablesConfig;
}
