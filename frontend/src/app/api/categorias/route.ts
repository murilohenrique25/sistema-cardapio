import{NextRequest,NextResponse}from"next/server";import{authenticatedBackendFetch}from"@/lib/backend";
async function f(r:Response|null){if(!r)return NextResponse.json({message:"Não autenticado"},{status:401});return new NextResponse(await r.text(),{status:r.status,headers:{"Content-Type":"application/json"}})}
export async function GET(){return f(await authenticatedBackendFetch("/api/categorias"))}export async function POST(q:NextRequest){return f(await authenticatedBackendFetch("/api/categorias",{method:"POST",headers:{"Content-Type":"application/json"},body:await q.text()}))}
