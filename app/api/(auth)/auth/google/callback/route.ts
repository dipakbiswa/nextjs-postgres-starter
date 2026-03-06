import { NextRequest, NextResponse } from "next/server";
import { connection } from "@/util/db";
import { exchangeCodeForTokens, getGoogleUserInfo } from "@/lib/oogle-oauth";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXTAUTH_URL!;

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        `${baseUrl}/login?error=oauth_error&message=${encodeURIComponent(error)}`,
      );
    }

    if (!code) {
      return NextResponse.redirect(`${baseUrl}/login?error=no_code`);
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Get user info from Google
    const googleUser = await getGoogleUserInfo(tokens.access_token);

    if (!googleUser.verified_email) {
      return NextResponse.redirect(`${baseUrl}/login?error=email_not_verified`);
    }

    // Check if user already exists
    const existingUserResult = await connection.query(
      "SELECT * FROM users WHERE LOWER(email) = LOWER($1)",
      [googleUser.email],
    );

    let user;

    if (existingUserResult.rows.length > 0) {
      user = existingUserResult.rows[0];

      if (user.role !== "user") {
        return NextResponse.redirect(`${baseUrl}/login?error=invalid_role`);
      }

      // Update user with Google info if not already set
      await connection.query(
        `UPDATE users 
         SET google_id = COALESCE(google_id, $1),
             picture = COALESCE(picture, $2),
             name = COALESCE(name, $3),
             is_verified = true
         WHERE id = $4`,
        [googleUser.id, googleUser.picture, googleUser.name, user.id],
      );
    } else {
      // Create new user
      // FIX: removed trailing comma after role column, removed updated_at (not in schema)
      const insertResult = await connection.query(
        `INSERT INTO users (
          email, name, google_id, picture, is_verified,
          created_at, role
        ) VALUES ($1, $2, $3, $4, $5, NOW(), $6)
        RETURNING *`,
        [
          googleUser.email,
          googleUser.name,
          googleUser.id,
          googleUser.picture,
          true,
          "user",
        ],
      );

      user = insertResult.rows[0];
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

    const response = NextResponse.redirect(
      `${baseUrl}/auth/google/success?auth_token=${token}`,
    );

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 72000,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    // FIX: use absolute URL with baseUrl so it doesn't fall back to localhost
    return NextResponse.redirect(
      `${baseUrl}/login?error=oauth_callback_failed`,
    );
  }
}
