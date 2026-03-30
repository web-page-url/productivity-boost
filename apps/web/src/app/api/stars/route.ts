export const revalidate = 3600 // re-fetch at most once per hour

export async function GET() {
  try {
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json' }
    if (process.env.GITHUB_TOKEN) headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`

    const res = await fetch(
      'https://api.github.com/repos/zunalabs/productivity-boost',
      { headers, next: { revalidate: 3600 } }
    )
    if (!res.ok) return Response.json({ stars: null })
    const data = await res.json()
    return Response.json({ stars: data.stargazers_count ?? null })
  } catch {
    return Response.json({ stars: null })
  }
}
