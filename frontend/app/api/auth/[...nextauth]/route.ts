import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"

// Server-side API URL (used in NextAuth authorize — runs on Node.js server, not browser)
// BACKEND_URL is a private env var for server→backend calls (e.g. WSL2 IP on local dev)
// Falls back to NEXT_PUBLIC_API_URL for production deployments
const SERVER_API = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export const authOptions: NextAuthOptions = {
  providers: [
    // Email/Password authentication
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Call backend login endpoint (server-side)
          const res = await fetch(
            `${SERVER_API}/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          )

          if (!res.ok) {
            return null
          }

          const user = await res.json()
          return {
            id: user.user_id,
            email: user.email,
            name: user.name,
            accessToken: user.access_token,
            tier: user.tier,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),

    // Google OAuth (optional, Phase 2)
    GoogleProvider({
      clientId: process.env.OAUTH_GOOGLE_ID || "",
      clientSecret: process.env.OAUTH_GOOGLE_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  pages: {
    signIn: "/auth/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 7 * 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.email = user.email ?? ''
        token.name = user.name ?? ''
        token.accessToken = user.accessToken
        token.tier = user.tier
      }
      // Re-fetch live tier from backend when session.update() is called (e.g. after payment)
      if (trigger === 'update' && token.accessToken) {
        try {
          const res = await fetch(
            `${SERVER_API}/auth/me`,
            { headers: { Authorization: `Bearer ${token.accessToken}` } }
          )
          if (res.ok) {
            const me = await res.json()
            token.tier = me.tier
          }
        } catch {}
      }
      return token
    },

    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        name: token.name,
        image: token.picture as string | undefined,
        tier: token.tier,
      }
      session.accessToken = token.accessToken
      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
