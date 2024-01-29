import NextAuth from "next-auth";

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(token) {
    try {
        const url =
            process.env.NEKOS_API_OAUTH_TOKEN_URL

        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: process.env.NEKOS_API_CLIENT_ID,
                client_secret: process.env.NEKOS_API_CLIENT_SECRET,
                grant_type: "refresh_token",
                refresh_token: token.refreshToken,
            }),
            method: "POST",
        });

        const refreshedTokens = await response.json();

        if (!response.ok) {
            throw refreshedTokens;
        }

        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
        };
    } catch (error) {
        console.log(error);

        return {
            ...token,
            error: "RefreshAccessTokenError",
        };
    }
}

export const authOptions = {
    providers: [
        {
            id: "nekos-api",
            name: "Nekos API",
            type: "oauth",
            version: "2.0",
            httpOptions: {
                timeout: 20000,
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
                };
            },
            userinfo: "https://api.nekosapi.com/v2/auth/userinfo",
        },
    ],
    callbacks: {
        async session({ session, token }) {
            session.user = token.user;

            if (token) {
                session.user = token.user;
                session.accessToken = token.accessToken;
                session.error = token.error;
            }

            return session;
        },
        async jwt({ token, user, account }) {
            if (account && user) {
                token.user = user;
                return {
                    accessToken: account.accessToken,
                    accessTokenExpires: Date.now() + account.expires_in * 1000,
                    refreshToken: account.refresh_token,
                    user,
                };
            }

            // Return previous token if the access token has not expired yet
            if (Date.now() < token.accessTokenExpires) {
                return token;
            }

            // Access token has expired, try to update it
            return refreshAccessToken(token);
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
