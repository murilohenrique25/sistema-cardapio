import{authenticatedBackendFetch}from"@/lib/backend";import{proxy}from"@/lib/proxy";export async function GET(){return proxy(await authenticatedBackendFetch("/api/dashboard"))}
