import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
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
          // Call backend login endpoint
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/auth/login`,
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
            accessToken: user.access_token,
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
    signUp: "/auth/signup",
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // Add user data to token
      if (user) {
        token.id = user.id
        token.email = user.email
        token.accessToken = (user as any).accessToken
      }
      return token
    },

    async session({ session, token }) {
      // Add token to session
      session.user = {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
        image: token.picture as string,
      }
      ;(session as any).accessToken = token.accessToken
      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
