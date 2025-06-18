import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Mail, Phone, MapPin } from 'lucide-react'
import { useLanguageStore } from '../stores/languageStore'

const Footer = () => {
  const { t, isRTL } = useLanguageStore()

  const links = {
    product: [
      { name: 'Features', href: '/features' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'API', href: '/api' },
      { name: 'Documentation', href: '/docs' }
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'GDPR', href: '/gdpr' }
    ]
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="text-xl font-bold">Kiddos</span>
            </Link>
            
            <p className={`text-gray-400 mb-6 max-w-md leading-relaxed ${isRTL() ? 'font-cairo' : ''}`}>
              AI-powered educational content platform creating safe, personalized learning experiences for children worldwide.
            </p>
            
            <div className="flex space-x-4 rtl:space-x-reverse">
              <a 
                href="mailto:hello@kiddos.app" 
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a 
                href="tel:+971501234567" 
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Phone"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isRTL() ? 'font-cairo' : ''}`}>
              Product
            </h3>
            <ul className="space-y-3">
              {links.product.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isRTL() ? 'font-cairo' : ''}`}>
              Company
            </h3>
            <ul className="space-y-3">
              {links.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isRTL() ? 'font-cairo' : ''}`}>
              Legal
            </h3>
            <ul className="space-y-3">
              {links.legal.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-400 mb-4 md:mb-0">
              <span>© 2024 Kiddos. Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>in Dubai</span>
            </div>
            
            <div className="flex items-center space-x-1 rtl:space-x-reverse text-gray-400">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Dubai, UAE</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer