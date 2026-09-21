import { Application } from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import config from './index';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express TypeScript Backend API',
      version: '1.0.0',
      description:
        'Production-ready Modular Express.js TypeScript API Documentation with Smart Financial Insights, 100-pt Health Score Engine, Gamification, Unified Budget, Subscriptions, Costs, Socket.io, & File Uploads.',
      contact: {
        name: 'API Support',
        email: 'admin@admin.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api/v1`,
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token in the format: Bearer <token>',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '60d0fe4f5311236168a109ca' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            phoneNumber: { type: 'string', example: '+1234567890' },
            country: { type: 'string', example: 'USA' },
            currency: { type: 'string', example: 'USD' },
            role: { type: 'string', enum: ['SUPER_ADMIN', 'ADMIN', 'USER'], example: 'USER' },
            status: { type: 'string', enum: ['active', 'blocked'], example: 'active' },
            profileImage: { type: 'string', example: '/uploads/images/avatar-12345.png' },
            createdAt: { type: 'string', example: '2026-08-31T09:00:00.000Z' },
          },
        },
        IncomeRequest: {
          type: 'object',
          required: ['title', 'amount'],
          properties: {
            title: { type: 'string', example: 'Monthly Salary' },
            amount: { type: 'number', example: 25000.0 },
            date: { type: 'string', example: '2026-08-01' },
            note: { type: 'string', example: 'Primary income' },
          },
        },
        FixedExpenseRequest: {
          type: 'object',
          required: ['title', 'amount'],
          properties: {
            title: { type: 'string', example: 'Rent' },
            amount: { type: 'number', example: 8000.0 },
            category: { type: 'string', example: 'Housing' },
            frequency: { type: 'string', enum: ['monthly', 'yearly'], example: 'monthly' },
          },
        },
        SavingsGoalRequest: {
          type: 'object',
          required: ['name', 'target_amount'],
          properties: {
            name: { type: 'string', example: 'Emergency Fund' },
            target_amount: { type: 'number', example: 100000.0 },
            saved_amount: { type: 'number', example: 35000.0 },
            target_date: { type: 'string', example: '2027-12-31' },
            currency: { type: 'string', example: 'SEK' },
          },
        },
        CostRequest: {
          type: 'object',
          required: ['amount', 'title', 'category'],
          properties: {
            title: { type: 'string', example: 'ICA Supermarket' },
            amount: { type: 'number', example: 350.0 },
            category: { type: 'string', example: 'Food' },
            date: { type: 'string', example: '2026-09-20' },
            note: { type: 'string', example: 'Weekly groceries' },
            currency: { type: 'string', example: 'SEK' },
          },
        },
        PopularServiceRequest: {
          type: 'object',
          required: ['name', 'price', 'billing_period', 'currency', 'category_id'],
          properties: {
            name: { type: 'string', example: 'Netflix Premium' },
            price: { type: 'number', example: 199.0 },
            billing_period: { type: 'string', enum: ['monthly', 'yearly'], example: 'monthly' },
            currency: { type: 'string', example: 'SEK' },
            category_id: { type: 'string', example: '60d0fe4f5311236168a109ca' },
          },
        },
        SubscriptionRequest: {
          type: 'object',
          required: ['name', 'price', 'billing_period', 'currency', 'category'],
          properties: {
            name: { type: 'string', example: 'Netflix' },
            price: { type: 'number', example: 149.0 },
            billing_period: { type: 'string', enum: ['monthly', 'yearly'], example: 'monthly' },
            currency: { type: 'string', example: 'SEK' },
            category: { type: 'string', example: 'Entertainment' },
          },
        },
        FinancialProfileRequest: {
          type: 'object',
          required: ['monthlySalary', 'monthlySavings', 'savingsGoal'],
          properties: {
            monthlySalary: { type: 'number', example: 32000 },
            otherIncome: { type: 'number', example: 0 },
            subscriptions: {
              type: 'array',
              items: { type: 'string' },
              example: ['Netflix', 'Spotify', 'YouTube Premium'],
            },
            fixedCosts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category: { type: 'string', example: 'Rent' },
                  amount: { type: 'number', example: 8000 },
                },
              },
              example: [
                { category: 'Rent', amount: 8000 },
                { category: 'Gym', amount: 350 },
              ],
            },
            monthlySavings: { type: 'number', example: 2000 },
            savingsGoal: { type: 'string', example: 'Holiday' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'admin@admin.com' },
            password: { type: 'string', example: 'adminpassword123' },
          },
        },
        CreateUserRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password'],
          properties: {
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'john@example.com' },
            password: { type: 'string', example: 'secret123' },
            phoneNumber: { type: 'string', example: '+1234567890' },
            country: { type: 'string', example: 'USA' },
            currency: { type: 'string', example: 'USD' },
            role: { type: 'string', enum: ['USER', 'ADMIN'], example: 'USER' },
          },
        },
      },
    },
    paths: {
      '/home': {
        get: {
          tags: ['Home Dashboard'],
          summary: 'Get unified Home Page Dashboard with health score, money left, days left, subscription cost, next draw, safe to spend, subscriptions, fixed costs & savings goals',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'month',
              in: 'query',
              schema: { type: 'string', example: '2026-09' },
              description: 'Target month in format YYYY-MM (defaults to current month)',
            },
          ],
          responses: {
            200: { description: 'Home page data fetched successfully' },
          },
        },
      },
      '/insights': {
        get: {
          tags: ['Smart Financial Insights'],
          summary: 'Get Smart Insights, 100-pt Financial Health Score & Points Breakdown',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'month',
              in: 'query',
              schema: { type: 'string', example: '2026-08' },
              description: 'Target month in format YYYY-MM',
            },
          ],
          responses: {
            200: { description: 'Financial insights fetched successfully' },
          },
        },
      },
      '/profile/dashboard': {
        get: {
          tags: ['Profile & Gamification'],
          summary: 'Get unified Profile Dashboard with financial summary, achievements, streak & titles',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Profile dashboard fetched successfully' },
          },
        },
      },
      '/achievements': {
        get: {
          tags: ['Profile & Gamification'],
          summary: 'Get list of achievements (optional filter status=unlocked or locked)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'status',
              in: 'query',
              schema: { type: 'string', enum: ['unlocked', 'locked'] },
            },
          ],
          responses: { 200: { description: 'Achievements retrieved' } },
        },
      },
      '/financial-health': {
        get: {
          tags: ['Profile & Gamification'],
          summary: 'Get financial health score (0-100), activity streak and current title',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Financial health details retrieved' } },
        },
      },
      '/budget/dashboard': {
        get: {
          tags: ['Unified Budget Dashboard'],
          summary: 'Get unified budget dashboard calculation for current/specified month',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'month',
              in: 'query',
              schema: { type: 'string', example: '2026-08' },
              description: 'Target month in format YYYY-MM',
            },
          ],
          responses: {
            200: { description: 'Budget dashboard fetched successfully' },
          },
        },
      },
      '/incomes': {
        get: {
          tags: ['Income Management'],
          summary: 'Get user incomes',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Incomes list fetched' } },
        },
        post: {
          tags: ['Income Management'],
          summary: 'Add an income entry',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/IncomeRequest' } } },
          },
          responses: { 201: { description: 'Income added' } },
        },
      },
      '/fixed-expenses': {
        get: {
          tags: ['Fixed Expenses'],
          summary: 'Get user fixed expenses',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Fixed expenses list fetched' } },
        },
        post: {
          tags: ['Fixed Expenses'],
          summary: 'Add a fixed expense entry',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/FixedExpenseRequest' } } },
          },
          responses: { 201: { description: 'Fixed expense added' } },
        },
      },
      '/savings-goals': {
        get: {
          tags: ['Savings Goals'],
          summary: 'Get user savings goals',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Savings goals list fetched' } },
        },
        post: {
          tags: ['Savings Goals'],
          summary: 'Create a savings goal',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SavingsGoalRequest' } } },
          },
          responses: { 201: { description: 'Savings goal created' } },
        },
      },
      '/cost-categories': {
        get: {
          tags: ['Cost Categories'],
          summary: 'Get all cost categories',
          responses: {
            200: { description: 'Categories retrieved successfully' },
          },
        },
      },
      '/costs/dashboard': {
        get: {
          tags: ['Costs / Variable Expenses'],
          summary: 'Get costs dashboard summary & transactions list',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'period',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['this_month', 'last_month', 'last_3_months'],
                default: 'this_month',
              },
            },
          ],
          responses: {
            200: { description: 'Costs dashboard fetched successfully' },
          },
        },
      },
      '/costs': {
        get: {
          tags: ['Costs / Variable Expenses'],
          summary: 'Get costs list with pagination and period filter',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Costs list fetched successfully' } },
        },
        post: {
          tags: ['Costs / Variable Expenses'],
          summary: 'Add a new cost / expense transaction',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CostRequest' } } },
          },
          responses: { 201: { description: 'Cost added successfully' } },
        },
      },
      '/popular-services': {
        get: {
          tags: ['Popular Services'],
          summary: 'Get all popular services',
          responses: { 200: { description: 'Popular services retrieved successfully' } },
        },
      },
      '/subscription-categories': {
        get: {
          tags: ['Subscription Categories'],
          summary: 'Get all subscription categories',
          responses: { 200: { description: 'Categories retrieved successfully' } },
        },
      },
      '/subscriptions/dashboard': {
        get: {
          tags: ['Subscriptions'],
          summary: 'Get subscription dashboard',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Dashboard fetched successfully' } },
        },
      },
      '/subscriptions': {
        get: {
          tags: ['Subscriptions'],
          summary: 'Get subscription list',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Subscriptions list fetched' } },
        },
        post: {
          tags: ['Subscriptions'],
          summary: 'Add a new subscription',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SubscriptionRequest' } } },
          },
          responses: { 201: { description: 'Subscription added successfully' } },
        },
      },
      '/financial-profile': {
        post: {
          tags: ['Financial Profile / Onboarding'],
          summary: 'Submit onboarding questionnaire / Save financial profile',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/FinancialProfileRequest' } } },
          },
          responses: { 200: { description: 'Financial profile saved successfully' } },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'User login',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
          },
          responses: { 200: { description: 'Login successful' } },
        },
      },
      '/users': {
        post: {
          tags: ['Users'],
          summary: 'Create a new user',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateUserRequest' } } },
          },
          responses: { 201: { description: 'User created successfully' } },
        },
      },
    },
  },
  apis: ['./src/app/modules/**/*.route.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Application): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};
