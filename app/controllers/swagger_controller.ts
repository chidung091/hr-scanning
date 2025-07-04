import type { HttpContext } from '@adonisjs/core/http'
import { swaggerSpec } from '../config/swagger.js'
import env from '#start/env'

export default class SwaggerController {
  /**
   * Serve Swagger UI HTML page with enhanced features
   */
  async ui({ response }: HttpContext) {
    const appUrl = env.get('APP_URL', 'http://localhost:3333')
    const swaggerUiVersion = '5.17.14' // Latest stable version

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TechVision HR Scanning API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@${swaggerUiVersion}/swagger-ui.css" />
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@${swaggerUiVersion}/favicon-32x32.png" sizes="32x32" />
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@${swaggerUiVersion}/favicon-16x16.png" sizes="16x16" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin: 0;
      background: #fafafa;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .swagger-ui .topbar {
      background-color: #2563eb;
      padding: 10px 0;
    }
    .swagger-ui .topbar .download-url-wrapper .select-label {
      color: #fff;
    }
    .swagger-ui .topbar .download-url-wrapper input[type=text] {
      border: 2px solid #fff;
      border-radius: 4px;
    }
    .swagger-ui .info .title {
      color: #2563eb;
    }
    .swagger-ui .scheme-container {
      background: #fff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    /* Mobile responsive improvements */
    @media (max-width: 768px) {
      .swagger-ui .wrapper {
        padding: 0 10px;
      }
      .swagger-ui .info {
        margin: 20px 0;
      }
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@${swaggerUiVersion}/swagger-ui-bundle.js" crossorigin></script>
  <script src="https://unpkg.com/swagger-ui-dist@${swaggerUiVersion}/swagger-ui-standalone-preset.js" crossorigin></script>
  <script>
    window.onload = function() {
      // Begin Swagger UI call region
      const ui = SwaggerUIBundle({
        url: '${appUrl}/api/docs/json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        validatorUrl: null,
        docExpansion: 'list',
        defaultModelsExpandDepth: 2,
        defaultModelExpandDepth: 2,
        tryItOutEnabled: true,
        filter: true, // Enable filtering
        showRequestHeaders: true,
        showCommonExtensions: true,
        requestInterceptor: function(request) {
          // Add CSRF token to requests if available
          const csrfToken = document.querySelector('meta[name="csrf-token"]');
          if (csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method.toUpperCase())) {
            request.headers['X-CSRF-Token'] = csrfToken.getAttribute('content');
          }
          request.headers['X-Requested-With'] = 'XMLHttpRequest';
          request.headers['Accept'] = 'application/json';
          return request;
        },
        responseInterceptor: function(response) {
          // Log responses for debugging in development
          if (${env.get('NODE_ENV') === 'development'}) {
            console.log('API Response:', response);
          }
          return response;
        }
      });
      // End Swagger UI call region

      window.ui = ui;
    };
  </script>
</body>
</html>
    `

    response.header('Content-Type', 'text/html; charset=utf-8')
    response.header('Cache-Control', 'no-cache, no-store, must-revalidate')
    return response.send(html)
  }

  /**
   * Serve Swagger JSON specification with proper headers
   */
  async json({ response }: HttpContext) {
    try {
      response.header('Content-Type', 'application/json; charset=utf-8')
      response.header('Access-Control-Allow-Origin', '*')
      response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token')

      return response.json(swaggerSpec)
    } catch (error) {
      console.error('Error serving Swagger JSON:', error)
      return response.status(500).json({
        error: 'Failed to generate API documentation',
        message: 'Please check server logs for details'
      })
    }
  }

  /**
   * Serve Swagger YAML specification with proper headers
   */
  async yaml({ response }: HttpContext) {
    try {
      const yaml = await import('js-yaml')
      const yamlStr = yaml.dump(swaggerSpec, {
        indent: 2,
        lineWidth: 120,
        noRefs: true
      })

      response.header('Content-Type', 'application/x-yaml; charset=utf-8')
      response.header('Content-Disposition', 'inline; filename="api-docs.yaml"')
      response.header('Access-Control-Allow-Origin', '*')

      return response.send(yamlStr)
    } catch (error) {
      console.error('Error serving Swagger YAML:', error)
      return response.status(500).send('Failed to generate YAML documentation')
    }
  }
}
