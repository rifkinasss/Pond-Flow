import { NextResponse } from "next/server";
import { getCurrentUser } from "@/shared/lib/auth";
export async function GET() { const user = await getCurrentUser(); return user ? NextResponse.json({ user }) : NextResponse.json({ error: "Unauthenticated" }, { status: 401 }); }
