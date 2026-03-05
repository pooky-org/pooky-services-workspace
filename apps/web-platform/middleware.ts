import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
	const url = request.nextUrl.clone();

	if (url.pathname === "/") {
		url.pathname = "/modules";
		return NextResponse.redirect(url);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/"],
};
