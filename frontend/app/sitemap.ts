import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://frontend-blue-kappa-15.vercel.app'

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/learn`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/chat`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/auth/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/auth/signup`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]
}
