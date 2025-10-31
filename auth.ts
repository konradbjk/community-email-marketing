import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { User } from 'next-auth';

// POC: Hardcoded test users with SSO-ready structure
// In production, this will be replaced with SSO provider (Keycloak)
const testUsers = [
  {
    merck_id: 'm277098',
    name: 'Alex',
    surname: 'Johnson',
    email: 'alex.johnson@merck.com',
    username: 'alex.johnson',
    password: 'password',
    image: 'https://avatar.iran.liara.run/public/43',
  },
  {
    merck_id: 'm283456',
    name: 'Sarah',
    surname: 'Chen',
    email: 'sarah.chen@merck.com',
    username: 'sarah.chen',
    password: 'password',
    image: 'https://avatar.iran.liara.run/public/77',
  },
  {
    merck_id: 'm291234',
    name: 'Michael',
    surname: 'Rodriguez',
    email: 'michael.rodriguez@merck.com',
    username: 'michael.rodriguez',
    password: 'password',
    image: 'https://avatar.iran.liara.run/public/32',
  },
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // Find user by username
        const user = testUsers.find((u) => u.username === credentials.username);

        // Validate password
        if (!user || user.password !== credentials.password) {
          return null;
        }

        // Return user object (without password)
        // This structure matches what we'll get from SSO in production
        return {
          id: user.merck_id,
          merck_id: user.merck_id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          image: user.image,
        } as User;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/', // Custom sign-in page
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add custom fields to token on sign in
      if (user) {
        token.merck_id = user.merck_id;
        token.surname = user.surname;
      }
      return token;
    },
    async session({ session, token }) {
      // Add custom fields to session
      if (session.user) {
        session.user.merck_id = token.merck_id as string;
        session.user.surname = token.surname as string;
      }
      return session;
    },
  },
});
