import Link from 'next/link'
import { Github, Twitter, Mail, MessageCircle, Heart, ExternalLink } from 'lucide-react'

const footerSections = [
  {
    title: 'Learn',
    links: [
      { label: 'All Chapters', href: '/learn' },
      { label: 'AI Chat Tutor', href: '/chat' },
      { label: 'Quiz Engine', href: '/learn' },
      { label: 'Progress Dashboard', href: '/dashboard' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Documentation', href: '#' },
      { label: 'Blog', href: '#' },
    ],
  },
  {
    title: 'Connect',
    links: [
      { label: 'GitHub', href: 'https://github.com/hafiznaveedchuhan-ctrl/FATIMAZEHRAAITUTOR', external: true },
      { label: 'Twitter', href: '#', external: true },
      { label: 'Discord', href: '#', external: true },
      { label: 'Contact', href: '#' },
    ],
  },
]

const socialLinks = [
  { icon: Github, href: 'https://github.com/hafiznaveedchuhan-ctrl/FATIMAZEHRAAITUTOR', label: 'GitHub' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: MessageCircle, href: '#', label: 'Discord' },
  { icon: Mail, href: '#', label: 'Email' },
]

export default function Footer() {
  return (
    <footer className="relative mt-20">
      {/* Multi-color top border — 3 layers */}
      <div className="h-px bg-gradient-to-r from-[#6C63FF] via-[#EC4899] to-[#06B6D4]" />
      <div className="h-px bg-gradient-to-r from-[#3B82F6]/60 via-[#F59E0B]/40 to-[#6C63FF]/60 mt-px" />
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-px" />

      <div className="backdrop-blur-xl pt-16 pb-8 footer-bg">
        <div className="container">
          {/* Main footer grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            {/* Brand column (wider) */}
            <div className="lg:col-span-2">
              <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#EC4899] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-500/20">
                  FZ
                </div>
                <span className="text-xl font-bold gradient-text">FatimaZehra AI Tutor</span>
              </Link>
              <p className="dark:text-gray-400 text-gray-600 text-sm leading-relaxed mb-6 max-w-sm">
                Master Python with AI-powered coaching. 10 comprehensive chapters,
                interactive quizzes, and personalized learning paths designed
                to accelerate your programming journey.
              </p>

              {/* Social icons */}
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className="w-10 h-10 rounded-xl dark:bg-white/5 bg-gray-100 border dark:border-white/10 border-gray-200 flex items-center justify-center dark:text-gray-400 text-gray-500 dark:hover:text-white hover:text-gray-900 dark:hover:bg-white/10 hover:bg-gray-200 hover:-translate-y-1 transition-all duration-300"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  )
                })}
              </div>
            </div>

            {/* Link columns */}
            {footerSections.map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold text-sm uppercase tracking-wider gradient-text mb-5">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm dark:text-gray-400 text-gray-500 dark:hover:text-white hover:text-gray-900 hover:translate-x-1 transition-all duration-200"
                        >
                          {link.label}
                          <ExternalLink className="w-3 h-3 opacity-50" />
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm dark:text-gray-400 text-gray-500 dark:hover:text-white hover:text-gray-900 hover:translate-x-1 transition-all duration-200 inline-block"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Hackathon badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border border-[#6C63FF]/20 text-sm">
              <span className="text-lg">🏆</span>
              <span className="dark:text-gray-300 text-gray-600">
                Built for{' '}
                <span className="font-semibold gradient-text">Panaversity Agent Factory Hackathon IV</span>
              </span>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#6C63FF]/40 to-transparent mb-6" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm dark:text-gray-500 text-gray-400">
            <p className="flex items-center gap-1">
              &copy; {new Date().getFullYear()} FatimaZehra AI Tutor. Made with
              <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400 inline mx-0.5" />
              for learners everywhere.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-gray-300 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-gray-300 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-gray-300 transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
