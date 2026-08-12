export interface Endpoint {
  method: string;
  path: string;
  description: string;
  requiresAuth: boolean;
  requestBody?: unknown;
  mockResponse: {
    status: number;
    body: unknown;
  };
}

export interface APIConfig {
  name: string;
  slug: string;
  baseUrl: string;
  demoCredentials: { email: string; password: string };
  loginPath: string;
  endpoints: Endpoint[];
}

export const apiConfigs: APIConfig[] = [
  {
    name: 'habitual-habits-api',
    slug: 'habitual-habits',
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '',
    demoCredentials: { email: 'demo@habitual.dev', password: 'demo1234' },
    loginPath: '/login',
    endpoints: [
      {
        method: 'POST',
        path: '/register',
        description: 'Register a new user',
        requiresAuth: false,
        requestBody: { email: 'user@example.com', password: 'securepassword123' },
        mockResponse: {
          status: 200,
          body: { id: 1, email: 'user@example.com' },
        },
      },
      {
        method: 'POST',
        path: '/login',
        description: 'Login and get access token',
        requiresAuth: false,
        requestBody: { username: 'demo@habitual.dev', password: 'demo1234' },
        mockResponse: {
          status: 200,
          body: { access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', token_type: 'bearer' },
        },
      },
      {
        method: 'POST',
        path: '/habits/',
        description: 'Create a new habit',
        requiresAuth: true,
        requestBody: { title: 'Morning workout', description: 'Exercise for 30 minutes', frequency: 'daily' },
        mockResponse: {
          status: 200,
          body: { id: 1, title: 'Morning workout', description: 'Exercise for 30 minutes', frequency: 'daily', user_id: 1 },
        },
      },
      {
        method: 'GET',
        path: '/habits/',
        description: 'List all habits',
        requiresAuth: true,
        mockResponse: {
          status: 200,
          body: [
            { id: 1, title: 'Morning workout', description: 'Exercise for 30 minutes', frequency: 'daily', user_id: 1 },
            { id: 2, title: 'Read 30 minutes', description: null, frequency: 'daily', user_id: 1 },
            { id: 3, title: 'Review pull requests', description: 'Check open PRs on GitHub', frequency: 'weekdays', user_id: 1 },
          ],
        },
      },
      {
        method: 'GET',
        path: '/habits/1',
        description: 'Get habit by ID',
        requiresAuth: true,
        mockResponse: {
          status: 200,
          body: { id: 1, title: 'Morning workout', description: 'Exercise for 30 minutes', frequency: 'daily', user_id: 1 },
        },
      },
      {
        method: 'PUT',
        path: '/habits/1',
        description: 'Update a habit',
        requiresAuth: true,
        requestBody: { title: 'Morning run', description: 'Run for 30 minutes', frequency: 'daily' },
        mockResponse: {
          status: 200,
          body: { id: 1, title: 'Morning run', description: 'Run for 30 minutes', frequency: 'daily', user_id: 1 },
        },
      },
      {
        method: 'DELETE',
        path: '/habits/1',
        description: 'Delete a habit',
        requiresAuth: true,
        mockResponse: {
          status: 200,
          body: { detail: 'Habit deleted' },
        },
      },
      {
        method: 'POST',
        path: '/habits/1/complete',
        description: 'Log a completion',
        requiresAuth: true,
        requestBody: { date_completed: '2026-02-28' },
        mockResponse: {
          status: 200,
          body: { id: 1, habit_id: 1, date_completed: '2026-02-28' },
        },
      },
      {
        method: 'GET',
        path: '/habits/1/streak',
        description: 'Get current streak',
        requiresAuth: true,
        mockResponse: {
          status: 200,
          body: { streak: 12 },
        },
      },
    ],
  },
  {
    name: 'taskboard-api',
    slug: 'taskboard',
    baseUrl: process.env.NEXT_PUBLIC_TASKBOARD_API_URL || '',
    demoCredentials: { email: 'demo@taskboard.dev', password: 'demo1234' },
    loginPath: '/login',
    endpoints: [
      {
        method: 'POST',
        path: '/register',
        description: 'Register a new user',
        requiresAuth: false,
        requestBody: { email: 'user@example.com', password: 'securepass123', display_name: 'Chris' },
        mockResponse: {
          status: 200,
          body: { id: 1, email: 'user@example.com', display_name: 'Chris' },
        },
      },
      {
        method: 'POST',
        path: '/login',
        description: 'Login and get access token',
        requiresAuth: false,
        requestBody: { username: 'demo@taskboard.dev', password: 'demo1234' },
        mockResponse: {
          status: 200,
          body: { access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', token_type: 'bearer' },
        },
      },
      {
        method: 'POST',
        path: '/boards/',
        description: 'Create a board',
        requiresAuth: true,
        requestBody: { title: 'Weekend Plans' },
        mockResponse: {
          status: 200,
          body: { id: 1, title: 'Weekend Plans', owner_id: 1, created_at: '2026-02-28T12:00:00' },
        },
      },
      {
        method: 'GET',
        path: '/boards/',
        description: 'List your boards',
        requiresAuth: true,
        mockResponse: {
          status: 200,
          body: [
            { id: 1, title: 'Weekend Plans', owner_id: 1, created_at: '2026-02-28T12:00:00' },
            { id: 2, title: 'Grocery List', owner_id: 1, created_at: '2026-02-27T09:30:00' },
          ],
        },
      },
      {
        method: 'GET',
        path: '/boards/1',
        description: 'Get board with columns and cards',
        requiresAuth: true,
        mockResponse: {
          status: 200,
          body: {
            id: 1,
            title: 'Weekend Plans',
            owner_id: 1,
            columns: [
              { id: 1, title: 'To Do', position: 0, cards: [
                { id: 1, title: 'Make coffee', description: 'The good beans, not the instant stuff', position: 0, column_id: 1, created_by: 1 },
                { id: 2, title: 'Go for a run', description: 'At least 3km, no excuses', position: 1, column_id: 1, created_by: 1 },
                { id: 3, title: 'Call mom', description: null, position: 2, column_id: 1, created_by: 1 },
              ]},
              { id: 2, title: 'In Progress', position: 1, cards: [
                { id: 4, title: 'Grocery shopping', description: 'Milk, eggs, and way too many snacks', position: 0, column_id: 2, created_by: 1 },
              ]},
              { id: 3, title: 'Done', position: 2, cards: [
                { id: 5, title: 'Clean the apartment', description: null, position: 0, column_id: 3, created_by: 1 },
              ]},
            ],
            members: [
              { user_id: 1, role: 'owner', display_name: 'Demo User' },
            ],
          },
        },
      },
      {
        method: 'POST',
        path: '/boards/1/columns/',
        description: 'Add a column',
        requiresAuth: true,
        requestBody: { title: 'Maybe Later' },
        mockResponse: {
          status: 200,
          body: { id: 4, title: 'Maybe Later', position: 3 },
        },
      },
      {
        method: 'POST',
        path: '/boards/1/cards/',
        description: 'Create a card',
        requiresAuth: true,
        requestBody: { column_id: 1, title: 'Take a nap', description: 'A short one, 20 min max' },
        mockResponse: {
          status: 200,
          body: { id: 6, title: 'Take a nap', description: 'A short one, 20 min max', position: 3, column_id: 1, created_by: 1 },
        },
      },
      {
        method: 'PUT',
        path: '/boards/1/cards/3/move',
        description: 'Move card to another column',
        requiresAuth: true,
        requestBody: { column_id: 3, position: 1 },
        mockResponse: {
          status: 200,
          body: { id: 4, title: 'Grocery shopping', description: 'Milk, eggs, and way too many snacks', position: 1, column_id: 3, created_by: 1 },
        },
      },
      {
        method: 'POST',
        path: '/boards/1/invite',
        description: 'Invite a member',
        requiresAuth: true,
        requestBody: { email: 'roommate@example.com', role: 'editor' },
        mockResponse: {
          status: 200,
          body: { user_id: 2, role: 'editor', display_name: 'Roommate' },
        },
      },
    ],
  },
];
