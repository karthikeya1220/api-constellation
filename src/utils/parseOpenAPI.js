/**
 * Parse OpenAPI 3.0 spec into StarData array
 * @param {object} spec - OpenAPI 3.0.0 or 3.0.1 spec object
 * @returns {object} ParseResult with stars, constellations, metadata
 */
export function parseOpenAPI(spec) {
  try {
    if (!spec || !spec.paths) {
      return {
        stars: [],
        constellations: [],
        apiTitle: 'Unknown',
        apiVersion: '0.0.0',
        baseUrl: '',
        totalEndpoints: 0,
        error: 'Invalid OpenAPI spec: missing paths',
      };
    }

    const stars = [];
    const info = spec.info || {};
    const servers = spec.servers || [];
    const baseUrl = servers.length > 0 ? servers[0].url : '';

    // Iterate through all paths
    Object.entries(spec.paths).forEach(([pathKey, pathItem]) => {
      // Skip parameters and summary
      const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

      methods.forEach(method => {
        const operation = pathItem[method];
        if (!operation) return;

        const httpMethod = method.toUpperCase();
        const operationId = operation.operationId || `${httpMethod} ${pathKey}`;
        const tags = operation.tags || ['untagged'];
        const summary = operation.summary || operationId;
        const description = operation.description || '';
        const constellationId = tags[0] || 'untagged';

        // Parse parameters
        const parameters = [];
        if (operation.parameters) {
          operation.parameters.forEach(param => {
            parameters.push({
              name: param.name,
              in: param.in,
              required: param.required || false,
              description: param.description || '',
              schema: param.schema || { type: 'string' },
            });
          });
        }

        // Parse request body
        let requestBody = null;
        if (operation.requestBody) {
          const content = operation.requestBody.content || {};
          const contentType = Object.keys(content)[0] || 'application/json';
          requestBody = {
            required: operation.requestBody.required || false,
            contentType,
            schema: content[contentType]?.schema || {},
            example: content[contentType]?.example,
          };
        }

        // Parse responses
        const responses = [];
        if (operation.responses) {
          Object.entries(operation.responses).forEach(([statusCode, response]) => {
            const content = response.content || {};
            const contentType = Object.keys(content)[0];
            responses.push({
              statusCode,
              description: response.description || '',
              contentType,
              schema: contentType ? content[contentType].schema : undefined,
            });
          });
        }

        // Create star
        const star = {
          id: `${httpMethod}:${pathKey}`,
          method: httpMethod,
          path: pathKey,
          summary,
          description,
          tags,
          constellationId,
          parameters,
          requestBody,
          responses,
          frequency: 0.5, // Will be overwritten by mockFrequency
          x: 0,
          y: 0,
          z: 0,
          color: '#E8E8FF',
          brightness: 0.5,
          size: 1.0,
        };

        stars.push(star);
      });
    });

    return {
      stars,
      constellations: [], // Will be filled by constellationGroup.js
      apiTitle: info.title || 'Unknown API',
      apiVersion: info.version || '0.0.0',
      baseUrl,
      totalEndpoints: stars.length,
      error: null,
    };
  } catch (err) {
    return {
      stars: [],
      constellations: [],
      apiTitle: 'Unknown',
      apiVersion: '0.0.0',
      baseUrl: '',
      totalEndpoints: 0,
      error: err.message,
    };
  }
}

