import NextAuth from "next-auth";

export const authOptions = {
    providers: [
        {
            id: "nekos-api",
            name: "Nekos API",
            type: "oauth",
            version: "2.0",
            httpOptions: {
                timeout: 10000,
            },
            checks: ["pkce", "state", "nonce"],
            wellKnown:
                "https://api.nekosapi.com/v2/auth/.well-known/openid-configuration",
            authorization: {
                url: process.env.NEKOS_API_OAUTH_AUTHORIZATION_URL,
                params: {
                    scope: "account:public:retrieve openid",
                    redirect_uri: process.env.NEKOS_API_REDIRECT_URL,
                },
            },
            token: {
                url: process.env.NEKOS_API_OAUTH_TOKEN_URL,
            },
            clientId: process.env.NEKOS_API_CLIENT_ID,
            clientSecret: process.env.NEKOS_API_CLIENT_SECRET,
            idToken: true,
            profile: (profile, tokens) => {
                return {
                    id: profile.sub,
                    username: profile.username,
                    displayName: profile.nickname,
                    avatarImage: profile.avatar_image,
                    isActive: profile.is_active,
                    isStaff: profile.is_staff,
                    isSuperuser: profile.is_superuser,
                    accessToken: tokens.access_token,
                };
            },
            userinfo: "https://api.nekosapi.com/v2/auth/userinfo",
        },
    ],
    callbacks: {
        async session({ session, token }) {
            session.user = token.user;
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.user = user;
            }
            return token;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
