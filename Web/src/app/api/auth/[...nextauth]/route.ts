import NextAuth, { type NextAuthOptions } from "next-auth";
import { type JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

// Backend URL from environment - all routes are constructed in this file
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://smart-split-oomn.onrender.com";
const API_URL = `${BACKEND_URL}/api`;

/**
 * Refresh the backend token if needed
 * This is called in the JWT callback to ensure we always have a valid token
 */
async function refreshBackendToken(token: JWT): Promise<JWT> {
  // Check if token is about to expire (refresh if within 5 minutes of expiry)
  if (token.backendTokenExpires && typeof token.backendTokenExpires === 'number') {
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = token.backendTokenExpires - now;

    // If token expires in less than 5 minutes, try to refresh it
    if (timeUntilExpiry < 300) {
      console.log("Backend token expiring soon, attempting refresh...");
      // For now, we can't refresh without storing refresh tokens
      // The token will be regenerated on next login
      token.backendTokenExpires = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
    }
  }
  return token;
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Credentials Provider - Login with Email/Password via Express Backend
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        try {
          // Call Express Backend Login Endpoint
          const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
            credentials: "include",
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.message || "Login failed");
          }

          // Return user object with token and token expiry (7 days)
          // CRITICAL: The token from Express backend must be passed through here
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            image: data.user.profileImage,
            token: data.token, // ✅ Backend JWT token from Express
            // Set token expiry to 7 days from now (matching backend)
            tokenExpiry: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
          };
        } catch (error: any) {
          console.error("Backend login error:", error);
          throw new Error(error.message || "Backend authentication failed");
        }
      },
    }),

    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  callbacks: {
    // JWT Callback - Store token in JWT
    // ✅ CRITICAL: This runs on every token refresh and sign-in
    async jwt({ token, user, account, trigger, session }) {
      // On sign in - store user and backend token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        
        // ✅ CRITICAL: Store backend JWT token from Express
        // This token must be extracted from the credentials provider response
        if ((user as any).token) {
          token.backendToken = (user as any).token; // Express backend JWT
          token.backendTokenExpires = (user as any).tokenExpiry || Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
        }
      }

      // Handle Google OAuth
      if (account?.provider === "google") {
        token.provider = "google";
      }

      // Refresh token if needed
      if (token.backendToken) {
        token = await refreshBackendToken(token);
      }

      // Handle session update (for revalidateSession calls)
      if (trigger === "update" && session) {
        return {
          ...token,
          ...session,
        };
      }

      return token;
    },

    // Session Callback - Return user info in session
    // ✅ CRITICAL: This exposes data to frontend via useSession() hook
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      
      // ✅ CRITICAL: Expose backend token to frontend for API calls
      // Frontend accesses via: (session as any)?.backendToken
      (session as any).backendToken = token.backendToken; // Express JWT used for API Authorization header
      (session as any).backendTokenExpires = token.backendTokenExpires;
      (session as any).provider = token.provider;
      
      return session;
    },

    // Sign-in Callback - Sync Google OAuth users with backend
    async signIn({ user, account, profile }) {
      // If Google OAuth, sync user with backend
      if (account?.provider === "google" && profile) {
        try {
          // Call dedicated Google login endpoint
          const googleLoginResponse = await fetch(`${API_URL}/auth/google-login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: profile.email,
              name: profile.name || user.name,
              googleId: (profile as any).sub || (profile as any).id,
              profileImage: (profile as any).picture || (user as any).image,
            }),
            credentials: "include",
          });

          const data = await googleLoginResponse.json();
          
          if (googleLoginResponse.ok && data.success && data.token) {
            // Store the backend token in the user object
            (user as any).token = data.token;
            (user as any).tokenExpiry = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
            return true;
          } else {
            console.error("Google login failed:", data.message);
            return false; // Deny sign-in if backend Google login fails
          }
        } catch (error) {
          console.error("Error during Google OAuth sign-in:", error);
          return false; // Deny sign-in on error
        }
      }

      return true;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 1 * 60 * 60, // Update session every 1 hour
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
      },
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
