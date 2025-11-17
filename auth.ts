import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Keycloak from 'next-auth/providers/keycloak';
import type { User } from 'next-auth';

const DEFAULT_AVATAR_URL = 'https://avatar.iran.liara.run/public/1';

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
];

const isProd = process.env.NODE_ENV === 'production';

const hasKeycloakEnv =
  !!process.env.AUTH_KEYCLOAK_ISSUER &&
  !!process.env.AUTH_KEYCLOAK_ID &&
  !!process.env.AUTH_KEYCLOAK_SECRET;

// Preserve Credentials provider and test users logic
const credentialsProvider = Credentials({
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
});

// Configure Keycloak provider with profile mapping to our user shape
function makeKeycloakProvider() {
  return Keycloak({
    issuer: process.env.KEYCLOAK_ISSUER,
    clientId: process.env.KEYCLOAK_CLIENT_ID!,
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
    profile(profile) {
      const anyProfile = profile as Record<string, unknown>;
      const identifierCandidates = [
        anyProfile.preferred_username,
        anyProfile.sub,
        anyProfile.id,
      ];
      const rawIdentifier =
        identifierCandidates.find((value): value is string => typeof value === 'string' && value.length > 0) ?? '';
      const normalizedIdentifier = rawIdentifier.trim();
      const merckId = normalizedIdentifier.includes('@')
        ? normalizedIdentifier.split('@', 1)[0]
        : normalizedIdentifier;
      const id = merckId || normalizedIdentifier;
      const name =
        typeof anyProfile.given_name === 'string'
          ? anyProfile.given_name
          : typeof anyProfile.name === 'string'
            ? anyProfile.name
            : '';
      const surname =
        typeof anyProfile.family_name === 'string' ? anyProfile.family_name : '';
      const email =
        typeof anyProfile.email === 'string' ? anyProfile.email : '';
      const image =
        typeof anyProfile.picture === 'string' && anyProfile.picture.length > 0
          ? anyProfile.picture
          : DEFAULT_AVATAR_URL;

      return {
        id,
        merck_id: merckId || normalizedIdentifier,
        name,
        surname,
        email,
        image,
      } as unknown as User;
    },
  });
}

// Build providers array based on environment and env vars
let providers = [] as any[];

if (isProd) {
  if (!hasKeycloakEnv) {
    throw new Error(
      'Missing Keycloak configuration in production. Required: KEYCLOAK_ISSUER, KEYCLOAK_CLIENT_ID, KEYCLOAK_CLIENT_SECRET',
    );
  }
  providers = [makeKeycloakProvider()];
} else {
  // Development: always include credentials
  providers = [credentialsProvider];
  // Include Keycloak only if fully configured
  if (hasKeycloakEnv) {
    providers.push(makeKeycloakProvider());
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7,
  },
  pages: {
    signIn: '/', // Custom sign-in page
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add custom fields to token on sign in (preserve existing semantics)
      if (user) {
        token.merck_id = (user as any).merck_id;
        token.surname = (user as any).surname;
        token.picture =
          (user as any).image && typeof (user as any).image === 'string'
            ? (user as any).image
            : DEFAULT_AVATAR_URL;
      }
      if (!token.picture) {
        token.picture = DEFAULT_AVATAR_URL;
      }
      return token;
    },
    async session({ session, token }) {
      // Add custom fields to session (preserve existing semantics)
      if (session.user) {
        (session.user as any).merck_id = token.merck_id as string;
        (session.user as any).surname = token.surname as string;
        session.user.image =
          typeof token.picture === 'string' && token.picture.length > 0
            ? (token.picture as string)
            : DEFAULT_AVATAR_URL;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      const merckId = (user as any)?.merck_id as string | undefined;
      if (!merckId) {
        return;
      }
      await ensureUserArtifacts({
        merckId,
        name: user.name ?? '',
        surname: (user as any)?.surname ?? '',
        email: user.email ?? '',
        image: user.image ?? DEFAULT_AVATAR_URL,
      });
    },
  },
});

type EnsureUserArtifactsPayload = {
  merckId: string;
  name: string;
  surname: string;
  email: string;
  image: string;
};

async function ensureUserArtifacts({
  merckId,
  name,
  surname,
  email,
  image,
}: EnsureUserArtifactsPayload) {
  const isEdge =
    typeof process === 'undefined' || process.env.NEXT_RUNTIME === 'edge';
  if (isEdge) {
    return;
  }

  try {
    const [{ getDataSource }, { User }, { UserProfile }] = await Promise.all([
      import('@/database/data-source'),
      import('@/database/entities/user.entity'),
      import('@/database/entities/user-profile.entity'),
    ]);

    const dataSource = await getDataSource();
    const userRepository = dataSource.getRepository(User);
    const profileRepository = dataSource.getRepository(UserProfile);
    const now = new Date();

    let dbUser = await userRepository.findOne({
      where: { merck_id: merckId },
    });

    if (!dbUser) {
      dbUser = userRepository.create({
        merck_id: merckId,
        name,
        surname,
        email,
        image,
        last_login: now,
      });
    } else {
      if (name && name !== dbUser.name) {
        dbUser.name = name;
      }
      if (surname && surname !== dbUser.surname) {
        dbUser.surname = surname;
      }
      if (email && email !== dbUser.email) {
        dbUser.email = email;
      }
      if (image && image !== dbUser.image) {
        dbUser.image = image;
      }
      dbUser.last_login = now;
    }

    dbUser = await userRepository.save(dbUser);

    const profile = await profileRepository.findOne({
      where: { user_id: dbUser.id },
    });

    if (!profile) {
      const newProfile = profileRepository.create({
        user_id: dbUser.id,
      });
      await profileRepository.save(newProfile);
    }
  } catch (error) {
    console.error('Error ensuring user profile exists:', error);
  }
}
