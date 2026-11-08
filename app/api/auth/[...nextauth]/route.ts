import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export async function GET(req: any, context: any) {
    try {
        return await handler(req, context)
    } catch (error) {
        console.error("[NextAuth GET Error]:", error)
        return new Response(JSON.stringify({ error: "Internal Auth Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        })
    }
}

export async function POST(req: any, context: any) {
    try {
        return await handler(req, context)
    } catch (error) {
        console.error("[NextAuth POST Error]:", error)
        return new Response(JSON.stringify({ error: "Internal Auth Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        })
    }
}
