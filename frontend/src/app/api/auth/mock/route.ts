import { NextResponse } from "next/server";

export async function POST(req: Request) {
	const body = await req.json().catch(() => ({}));
	const action = body?.action as string | undefined;
	const callbackUrl = (body?.callbackUrl as string | undefined) || "/";

	const res = NextResponse.json({ ok: true, action, callbackUrl });

	if (action === "signin") {
		// Set a simple non-secure cookie for demo purposes
		res.cookies.set("auth", "1", {
			httpOnly: false,
			sameSite: "lax",
			path: "/",
			maxAge: 60 * 60 * 24, // 1 day
		});
	} else if (action === "signout") {
		res.cookies.set("auth", "", { path: "/", maxAge: 0 });
	}

	return res;
}
