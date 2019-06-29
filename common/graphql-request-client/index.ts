import { ClientError, Headers as HttpHeaders, Options, Variables } from './types';
import 'cross-fetch/polyfill';

import { print } from 'graphql/language/printer';

export { ClientError } from './types';

export default class GraphQLClient {
  private url: string;
  private options: Options;

  constructor(url: string, options?: Options) {
    this.url = url;
    this.options = options || {};
  }

  // async rawRequest<T extends any>(
  //   query: string,
  //   variables?: Variables
  // ): Promise<{ data?: T; extensions?: any; headers: Headers; status: number; errors?: GraphQLError[] }> {
  //   const { headers, ...others } = this.options;

  //   const body = JSON.stringify({
  //     query,
  //     variables: variables ? variables : undefined
  //   });

  //   const response = await fetch(this.url, {
  //     method: 'POST',
  //     headers: this.processHeaders(Object.assign({ 'Content-Type': 'application/json' }, headers)),
  //     body,
  //     ...others
  //   });

  //   const result = await getResult(response);

  //   if (response.ok && !result.errors && result.data) {
  //     // tslint:disable-next-line
  //     const { headers, status } = response;
  //     return { ...result, headers, status };
  //   } else {
  //     const errorResult = typeof result === 'string' ? { error: result } : result;
  //     throw new ClientError(
  //       { ...errorResult, status: response.status, headers: response.headers },
  //       { query, variables }
  //     );
  //   }
  // }

  async request<T extends any>(query: string | object, variables?: Variables, options?: object): Promise<T> {
    const opt = { ...this.options, ...options };
    const { headers, token, ...others } = opt;

    if (token) {
      headers.Authorization = `Bearer: ${token}`;
    }

    if (others.debug) {
      console.log(
        '\x1b[1m',
        '=== DEBUG QUERY TO GRAPHQL ===',
        '\x1b[0m',
        '\x1b[32m',
        `
 ${typeof query === 'string' ? query : print(query)}`,
        '\x1b[0m'
      );

      if (variables) {
        console.log('   variables:\n', variables);
      }

      if (token) {
        console.log(
          '   \nauth:',
          `
 { "Authorization": "${headers.Authorization}" }`
        );
      }

      console.log('\x1b[1m', '=== DEBUG QUERY TO GRAPHQL ===', '\x1b[0m');
    }

    const body = JSON.stringify({
      query: typeof query === 'string' ? query : print(query),
      variables: variables ? variables : undefined
    });

    const response = await fetch(this.url, {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json' }, headers),
      body,
      ...others
    });

    const result = await getResult(response);

    if (response.ok && !result.errors && result.data) {
      return result.data;
    } else {
      console.error('GraphQL request errors', result.errors);
      console.error({ query, variables });
      result.error = true;
      return result;
    }
  }

  setHeaders(headers: HttpHeaders): GraphQLClient {
    this.options.headers = headers;

    return this;
  }

  setHeader(key: string, value: string): GraphQLClient {
    const { headers } = this.options;

    if (headers) {
      headers[key] = value;
    } else {
      this.options.headers = { [key]: value };
    }
    return this;
  }

  // processHeaders(headers: DynamicHeaders): HttpHeaders {
  //   for (const name in headers) {
  //     if (typeof headers[name] === 'function') {
  //       headers[name] = (headers[name] as DynamicHeaderValue)();
  //     }
  //   }
  //   return headers as HttpHeaders;
  // }
}

// export async function rawRequest<T extends any>(
//   url: string,
//   query: string,
//   variables?: Variables
// ): Promise<{ data?: T; extensions?: any; headers: Headers; status: number; errors?: GraphQLError[] }> {
//   const client = new GraphQLClient(url);

//   return client.rawRequest<T>(query, variables);
// }

// export async function request<T extends any>(url: string, query: string, variables?: Variables): Promise<T> {
//   const client = new GraphQLClient(url);

//   return client.request<T>(query, variables);
// }

// export default request;

async function getResult(response: Response): Promise<any> {
  const contentType = response.headers.get('Content-Type');
  if (contentType && contentType.startsWith('application/json')) {
    return response.json();
  } else {
    return response.text();
  }
}
