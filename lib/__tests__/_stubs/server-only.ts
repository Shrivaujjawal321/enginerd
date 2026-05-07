// Test-time stub for the `server-only` import marker.
// Real `server-only` throws when bundled into a client component;
// in unit tests there's no bundler context, so we just no-op.
export {};
