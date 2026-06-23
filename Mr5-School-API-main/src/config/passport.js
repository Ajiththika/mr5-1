import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import envConfig from './env.js';

export const isGoogleOAuthEnabled = Boolean(
    envConfig.GOOGLE_CLIENT_ID && envConfig.GOOGLE_CLIENT_SECRET
);

export default function (passport) {
    // Only register Google OAuth strategy if credentials are configured
    if (isGoogleOAuthEnabled) {
        passport.use(new GoogleStrategy({
            clientID: envConfig.GOOGLE_CLIENT_ID,
            clientSecret: envConfig.GOOGLE_CLIENT_SECRET,
            callbackURL: envConfig.GOOGLE_CALLBACK_URL,
        },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // STRICT CHECK: Auto-create or login
                    let user = await User.findOne({ googleId: profile.id });
                    if (user) {
                        return done(null, user);
                    } else {
                        // Check if user exists by email to merge accounts
                        const email = profile.emails[0].value;
                        user = await User.findOne({ email });

                        if (user) {
                            // Link Google ID to existing email account
                            user.googleId = profile.id;
                            if (!user.profileImage) user.profileImage = profile.photos?.[0]?.value;
                            await user.save();
                            return done(null, user);
                        }

                        // Create new user
                        const newUser = {
                            googleId: profile.id,
                            email: email,
                            name: profile.displayName,
                            profileImage: profile.photos?.[0]?.value,
                            password: 'google-oauth-login-' + Math.random().toString(36).slice(-8) // Dummy password
                        };
                        user = await User.create(newUser);
                        return done(null, user);
                    }
                } catch (err) {
                    console.error(err);
                    return done(err, null);
                }
            }
        ));
    } else {
        console.warn("⚠️  Google OAuth not configured (GOOGLE_CLIENT_ID/SECRET missing). /api/auth/google routes will not work.");
    }

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => done(err, user));
    });
}
