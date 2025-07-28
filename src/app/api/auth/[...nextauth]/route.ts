import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.compose'
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token, user }: any) {
      // Add access token to session for Gmail API calls
      if (token?.accessToken) {
        session.accessToken = token.accessToken;
      }
      if (user) {
        session.user.id = user.id;
      }
      return session;
    },
    async jwt({ token, account, user }: any) {
      // Store access token in JWT
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      if (user) {
        token.userId = user.id;
      }
      return token;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
export { authOptions };
