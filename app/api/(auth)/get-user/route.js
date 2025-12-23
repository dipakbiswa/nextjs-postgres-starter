import { getCurrentUser } from "@/lib/getCurrentUser";
import { connection } from "@/util/db";
import { NextResponse } from "next/server";
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const users = await connection.query(
      "SELECT id, email, name FROM users WHERE id = $1",
      [user.id]
    );
    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const currentUser = users[0];
    console.log("Current User from route:", currentUser);
    return NextResponse.json({ user: currentUser });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
