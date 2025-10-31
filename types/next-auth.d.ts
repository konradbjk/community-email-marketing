import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    merck_id: string
    surname: string
  }

  interface Session {
    user: {
      merck_id: string
      name: string
      surname: string
      email: string
      image?: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    merck_id?: string
    surname?: string
  }
}
