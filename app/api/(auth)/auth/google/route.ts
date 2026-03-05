import { NextRequest, NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/oogle-oauth";

export async function GET(request: NextRequest) {
  try {
    const authUrl = getGoogleAuthUrl();
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Google OAuth redirect error:", error);
    return NextResponse.json(
      { message: "Failed to initiate Google OAuth" },
      { status: 500 }
    );
  }
}
