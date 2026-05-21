import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      // v2 additions — populated by lib/auth.ts session callback so server
      // components + API handlers can scope queries without re-querying User.
      linkedRvsfId?: string
      linkedCcId?: string
      mustChangePassword?: boolean
    } & DefaultSession["user"]
  }

  interface User {
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    linkedRvsfId?: string
    linkedCcId?: string
    mustChangePassword?: boolean
  }
}
