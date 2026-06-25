import { NextRequest, NextResponse } from "next/server";

const UPSTREAM = "https://data.kardashevlabs.org";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const url = `${UPSTREAM}/${path.join("/")}${request.nextUrl.search}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
