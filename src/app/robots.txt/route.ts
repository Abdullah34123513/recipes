import { NextResponse } from "next/server"

export function GET() {
  const baseUrl = "https://recipehub.com"
  
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay
Crawl-delay: 1`

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 's-maxage=86400, stale-while-revalidate'
    }
  })
}