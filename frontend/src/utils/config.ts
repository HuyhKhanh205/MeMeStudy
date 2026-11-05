export const config = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api',
  useMock: process.env.EXPO_PUBLIC_USE_MOCK === 'true',
  requestTimeoutMs: 15000,
} as const;
