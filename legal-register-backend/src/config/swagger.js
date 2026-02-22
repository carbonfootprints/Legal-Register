import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Legal Register Management System API',
      version: '1.0.0',
      description: 'API documentation for the Legal Register Management System - A comprehensive solution for managing legal permits, compliance documents, and renewal tracking.',
      contact: {
        name: 'API Support',
        email: 'support@legalregister.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      },
      {
        url: 'https://your-production-url.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            _id: {
              type: 'string',
              description: 'Auto-generated MongoDB ObjectId'
            },
            name: {
              type: 'string',
              description: 'User full name',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john@example.com'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User password (min 8 chars, uppercase, lowercase, number, special char)',
              example: 'Test@123456'
            },
            companyName: {
              type: 'string',
              description: 'Company name',
              example: 'Acme Corp'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              default: 'user'
            },
            isActive: {
              type: 'boolean',
              default: true
            }
          }
        },
        LegalRegister: {
          type: 'object',
          required: ['permit', 'documentNo', 'issuingAuthority', 'dateOfIssue', 'responsibility'],
          properties: {
            _id: {
              type: 'string',
              description: 'Auto-generated MongoDB ObjectId'
            },
            slNo: {
              type: 'integer',
              description: 'Auto-generated serial number per user'
            },
            permit: {
              type: 'string',
              description: 'Permit/License name',
              example: 'Environmental Clearance Certificate'
            },
            documentNo: {
              type: 'string',
              description: 'Document/License number',
              example: 'EC-2024-001'
            },
            issuingAuthority: {
              type: 'string',
              description: 'Authority that issued the permit',
              example: 'State Pollution Control Board'
            },
            dateOfIssue: {
              type: 'string',
              format: 'date',
              description: 'Date when permit was issued',
              example: '2024-01-15'
            },
            dateOfExpiry: {
              type: 'string',
              format: 'date',
              description: 'Date when permit expires',
              example: '2025-01-15'
            },
            dueDateForRenewal: {
              type: 'string',
              format: 'date',
              description: 'Due date for renewal',
              example: '2024-12-15'
            },
            reportingFrequency: {
              type: 'string',
              enum: ['N/A', 'Monthly', 'Quarterly', 'Half-Yearly', 'Yearly once', 'Two years', 'Three years once', 'Four years', 'Five years'],
              default: 'N/A'
            },
            dateOfLastReport: {
              type: 'string',
              format: 'date'
            },
            responsibility: {
              type: 'string',
              description: 'Person responsible for this permit',
              example: 'Environment Manager'
            },
            permitDocument: {
              type: 'string',
              description: 'URL to uploaded permit document'
            },
            complianceReport: {
              type: 'string',
              description: 'URL to uploaded compliance report'
            },
            status: {
              type: 'string',
              enum: ['Active', 'Expired', 'Pending Renewal', 'Cancelled'],
              default: 'Active'
            },
            isArchived: {
              type: 'boolean',
              default: false
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string'
            },
            data: {
              type: 'object'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints'
      },
      {
        name: 'Legal Registers',
        description: 'Legal register CRUD operations'
      },
      {
        name: 'Dashboard',
        description: 'Dashboard statistics and alerts'
      },
      {
        name: 'Export',
        description: 'Data export functionality'
      },
      {
        name: 'Upload',
        description: 'File upload functionality'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
