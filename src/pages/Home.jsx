import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Brain, 
  Globe, 
  Shield, 
  Sparkles, 
  BookOpen, 
  Users, 
  ArrowRight,
  Star,
  CheckCircle,
  Play
} from 'lucide-react'
import { useLanguageStore } from '../stores/languageStore'
import Button from '../components/ui/Button'

const Home = () => {
  const { t, isRTL } = useLanguageStore()

  const features = [
    {
      icon: Brain,
      title: t('aiPowered'),
      description: t('aiPoweredDesc'),
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Globe,
      title: t('multiLanguage'),
      description: t('multiLanguageDesc'),
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Shield,
      title: t('safe'),
      description: t('safeDesc'),
      color: 'from-purple-500 to-purple-600'
    }
  ]

  const stats = [
    { number: '10,000+', label: 'Content Generated' },
    { number: '5,000+', label: 'Happy Families' },
    { number: '15+', label: 'Languages Supported' },
    { number: '99.9%', label: 'Safety Rating' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <h1 className={`text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight ${isRTL() ? 'font-cairo' : ''}`}>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('heroTitle')}
              </span>
            </h1>
            
            <p className={`text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed ${isRTL() ? 'font-cairo' : ''}`}>
              {t('heroSubtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/register">
                <Button 
                  size="lg" 
                  className="px-8 py-4 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  icon={<ArrowRight className="w-5 h-5" />}
                  iconPosition="right"
                >
                  {t('getStarted')}
                </Button>
              </Link>
              
              <button className="flex items-center space-x-2 rtl:space-x-reverse text-gray-600 hover:text-gray-900 transition-colors duration-200">
                <div className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center group-hover:shadow-lg transition-shadow duration-200">
                  <Play className="w-5 h-5 text-blue-600 ml-0.5" />
                </div>
                <span className="text-lg font-medium">Watch Demo</span>
              </button>
            </div>
          </div>

          {/* Hero Image/Animation */}
          <div className="mt-20 relative">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 flex space-x-1 items-center px-4">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
              <div className="p-8">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold text-gray-900 mb-4 ${isRTL() ? 'font-cairo' : ''}`}>
              {t('features')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover what makes Kiddos the perfect educational platform for your children
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative">
                <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} mb-6 shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className={`text-xl font-semibold text-gray-900 mb-4 ${isRTL() ? 'font-cairo' : ''}`}>
                    {feature.title}
                  </h3>
                  
                  <p className={`text-gray-600 leading-relaxed ${isRTL() ? 'font-cairo' : ''}`}>
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-blue-100 text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Types Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold text-gray-900 mb-4 ${isRTL() ? 'font-cairo' : ''}`}>
              Content Types We Generate
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From stories to worksheets, we create engaging educational content for every learning style
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, title: t('stories'), desc: 'Engaging narratives that teach and entertain', color: 'bg-green-500' },
              { icon: Users, title: t('worksheets'), desc: 'Interactive exercises for hands-on learning', color: 'bg-blue-500' },
              { icon: CheckCircle, title: t('quizzes'), desc: 'Fun assessments to test knowledge', color: 'bg-purple-500' },
              { icon: Sparkles, title: t('exercises'), desc: 'Practical activities for skill building', color: 'bg-orange-500' }
            ].map((type, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${type.color} mb-4`}>
                  <type.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-lg font-semibold text-gray-900 mb-2 ${isRTL() ? 'font-cairo' : ''}`}>
                  {type.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {type.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className={`text-3xl md:text-4xl font-bold text-gray-900 mb-6 ${isRTL() ? 'font-cairo' : ''}`}>
            Ready to Start Creating?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Join thousands of families creating personalized educational content for their children
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="px-8 py-4 text-lg">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center space-x-2 rtl:space-x-reverse text-sm text-gray-500">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>No credit card required</span>
            <span className="mx-2">•</span>
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home