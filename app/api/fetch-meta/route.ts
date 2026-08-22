import { NextRequest, NextResponse } from "next/server"

interface MetaData {
  favicon: string
  title: string
  description: string
  image?: string
}

function decodeHtml(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .trim();
}

async function fetchMetaData(url: string): Promise<MetaData> {
  const hostname = new URL(url).hostname
  
  const favicon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`
  
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MetaFetcher/1.0)",
      },
      signal: AbortSignal.timeout(5000),
    })
    
    const html = await response.text()
    
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? decodeHtml(titleMatch[1]) : hostname
    
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i)
      || html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
    const description = descMatch ? decodeHtml(descMatch[1]) : ""

    const imgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)
    let image = imgMatch ? imgMatch[1].trim() : undefined
    if (image && !image.startsWith("http")) {
      try {
        image = new URL(image, url).toString()
      } catch {}
    }
    
    return { favicon, title, description, image }
  } catch {
    return { favicon, title: hostname, description: "" }
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")
  
  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 })
  }
  
  try {
    new URL(url)
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
  }
  
  const metaData = await fetchMetaData(url)
  return NextResponse.json(metaData)
}