import { NextRequest, NextResponse } from "next/server";
import { connection } from "@/util/db";
import { exchangeCodeForTokens, getGoogleUserInfo } from "@/lib/oogle-oauth";
import jwt from "jsonwebtoken";
import MailerLite from "@mailerlite/mailerlite-nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL(
          `${
            process.env.NEXTAUTH_URL
          }/login?error=oauth_error&message=${encodeURIComponent(error)}`,
          request.url,
        ),
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL(`${process.env.NEXTAUTH_URL}/login?error=no_code`, request.url),
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Get user info from Google
    const googleUser = await getGoogleUserInfo(tokens.access_token);

    if (!googleUser.verified_email) {
      return NextResponse.redirect(
        new URL(
          `${process.env.NEXTAUTH_URL}/login?error=email_not_verified`,
          request.url,
        ),
      );
    }

    // Check if user already exists
    const existingUserResult = await connection.query(
      "SELECT * FROM users WHERE LOWER(email) = LOWER($1)",
      [googleUser.email],
    );

    let user;

    if (existingUserResult.rows.length > 0) {
      if (existingUserResult.rows[0].role != "user") {
        return NextResponse.redirect(
          new URL(
            `${process.env.NEXTAUTH_URL}/login?error=invalid_role`,
            request.url,
          ),
        );
      }
    }

    if (existingUserResult.rows.length > 0) {
      // User exists, update Google-related fields if needed
      user = existingUserResult.rows[0];

      // Update user with Google info if not already set
      await connection.query(
        `UPDATE users 
         SET google_id = COALESCE(google_id, $1),
             picture = COALESCE(picture, $2),
             name = COALESCE(name, $3),
             is_verified = true,
             updated_at = NOW()
         WHERE id = $4`,
        [googleUser.id, googleUser.picture, googleUser.name, user.id],
      );
    } else {
      // Create new user
      const insertResult = await connection.query(
        `INSERT INTO users (
          email, name, google_id, picture, is_verified, 
          created_at, updated_at, role, newsletter_notification
        ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), $6, $7) 
        RETURNING *`,
        [
          googleUser.email,
          googleUser.name,
          googleUser.id,
          googleUser.picture,
          true,
          "user", // default role
          true, // default newsletter subscription
        ],
      );

      user = insertResult.rows[0];

      const mailerlite = new MailerLite({
        api_key: process.env.MAILERLITE_API_KEY || "",
      });

      const params = {
        email: googleUser.email,
        fields: {
          name: googleUser.name,
        },
        groups: [
          process.env.MAILERLITE_CUSTOMER_GROUP_ID || "168211870236280261",
        ],
      };

      await mailerlite.subscribers
        .createOrUpdate(params)
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          if (error.response) console.log(error.response.data);
        });
    }

    // Check is banned
    if (user.is_banned) {
      return NextResponse.redirect(
        new URL(
          `${process.env.NEXTAUTH_URL}/login?error=account_banned`,
          request.url,
        ),
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user?.id,
        email: user?.email,
        name: user?.name,
        role: user?.role,
        avatar: user?.picture,
        is_first_login: user?.is_first_login,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" },
    );

    // Redirect to a success page that will handle localStorage
    // const redirectUrl = new URL("/auth/google/success", request.url);
    // redirectUrl.searchParams.set("auth_token", token);
    // redirectUrl.searchParams.set(
    //   "first_login",
    //   user?.is_first_login ? "1" : "0"
    // );

    const redirectUrl = `${
      process.env.NEXTAUTH_URL
    }/auth/google/success?auth_token=${token}&first_login=${
      user?.is_first_login ? "1" : "0"
    }`;

    const response = NextResponse.redirect(redirectUrl);

    // Set secure httpOnly cookie (keeping your existing cookie logic)
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 72000, // 1 day
      path: "/",
    });

    connection.query(
      "UPDATE users SET is_first_login = false WHERE email = $1",
      [googleUser.email],
    );

    return response;
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/login?error=oauth_callback_failed", request.url),
    );
  }
}
