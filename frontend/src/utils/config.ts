// export const config = {
//   apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api',
//   useMock: process.env.EXPO_PUBLIC_USE_MOCK === 'true',
//   requestTimeoutMs: 15000,
// } as const;

export const config = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api',
  useMock: true, // Ép cứng luôn true để chạy dữ liệu giả
  requestTimeoutMs: 15000,
} as const;