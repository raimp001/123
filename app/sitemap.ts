import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://sciflowlabs.com'
  
  // Static pages
  const staticPages = [
    '',
    '/login',
    '/signup',
    '/whitepaper',
    '/dashboard',
    '/dashboard/bounties',
    '/dashboard/labs',
    '/dashboard/escrow',
    '/dashboard/open-bounties',
    '/dashboard/proposals',
    '/dashboard/research',
    '/dashboard/staking',
    '/dashboard/disputes',
    '/dashboard/leaderboard',
    '/dashboard/analytics',
    '/help',
  ]

  const sitemap: MetadataRoute.Sitemap = staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : route.startsWith('/dashboard') ? 0.8 : 0.6,
  }))

  return sitemap
}
