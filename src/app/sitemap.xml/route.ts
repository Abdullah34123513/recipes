import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const recipes = await db.recipe.findMany({
      where: {
        status: "PUBLISHED"
      },
      select: {
        id: true,
        updatedAt: true
      }
    })

    const baseUrl = "https://yourdomain.com"
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${recipes.map(recipe => `
  <url>
    <loc>${baseUrl}/recipe/${recipe.id}</loc>
    <lastmod>${recipe.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 's-maxage=86400, stale-while-revalidate'
      }
    })
  } catch (error) {
    console.error("Failed to generate sitemap:", error)
    return NextResponse.json(
      { error: "Failed to generate sitemap" },
      { status: 500 }
    )
  }
}