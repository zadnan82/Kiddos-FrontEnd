import React, { useState, useEffect } from 'react'
import { 
  Coins, 
  CreditCard, 
  Gift, 
  TrendingUp, 
  ArrowUpRight,
  ArrowDownLeft,
  Star,
  CheckCircle,
  Zap,
  Crown,
  Package,
  History,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useLanguageStore } from '../stores/languageStore'
import { creditsAPI } from '../services/api'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/LoadingSpinner'

const Credits = () => {
  const { user, updateUser } = useAuthStore()
  const { t, isRTL } = useLanguageStore()
  const [creditPackages, setCreditPackages] = useState([])
  const [creditBalance, setCreditBalance] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [showTransactions, setShowTransactions] = useState(false)

  useEffect(() => {
    loadCreditsData()
  }, [])

  const loadCreditsData = async () => {
    try {
      setIsLoading(true)
      const [packagesResponse, balanceResponse] = await Promise.all([
        creditsAPI.getPackages(),
        creditsAPI.getBalance()
      ])
      
      setCreditPackages(packagesResponse.data)
      setCreditBalance(balanceResponse.data)
      setTransactions(balanceResponse.data.recent_transactions || [])
    } catch (error) {
      toast.error('Failed to load credits data')
      console.error('Load credits error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePurchase = async (packageType) => {
    try {
      setIsPurchasing(true)
      
      const response = await creditsAPI.purchaseCredits({
        package_type: packageType,
        payment_method: 'stripe'
      })
      
      // Redirect to Stripe checkout
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to initiate purchase')
      setIsPurchasing(false)
    }
  }

  const getPackageIcon = (packageType) => {
    const icons = {
      mini: Zap,
      basic: Package,
      family: Gift,
      bulk: Crown
    }
    return icons[packageType] || Package
  }

  const getPackageColor = (packageType) => {
    const colors = {
      mini: 'from-yellow-400 to-yellow-600',
      basic: 'from-blue-400 to-blue-600',
      family: 'from-green-400 to-green-600',
      bulk: 'from-purple-400 to-purple-600'
    }
    return colors[packageType] || 'from-gray-400 to-gray-600'
  }

  const getTransactionIcon = (type) => {
    const icons = {
      purchase: ArrowUpRight,
      consumption: ArrowDownLeft,
      refund: RefreshCw,
      bonus: Gift
    }
    const IconComponent = icons[type] || Coins
    return <IconComponent className="w-4 h-4" />
  }

  const getTransactionColor = (type) => {
    const colors = {
      purchase: 'text-green-600 bg-green-100',
      consumption: 'text-red-600 bg-red-100',
      refund: 'text-blue-600 bg-blue-100',
      bonus: 'text-purple-600 bg-purple-100'
    }
    return colors[type] || 'text-gray-600 bg-gray-100'
  }

  const PackageCard = ({ pkg }) => {
    const IconComponent = getPackageIcon(pkg.package_type)
    const isPopular = pkg.popular
    
    return (
      <div className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
        isPopular ? 'border-blue-500 scale-105' : 'border-gray-200 hover:border-gray-300'
      }`}>
        {isPopular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-semibold flex items-center">
              <Star className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0" />
              Most Popular
            </div>
          </div>
        )}
        
        <div className="p-6">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${getPackageColor(pkg.package_type)} mb-6`}>
            <IconComponent className="w-8 h-8 text-white" />
          </div>
          
          <h3 className={`text-xl font-bold text-gray-900 mb-2 capitalize ${isRTL() ? 'font-cairo' : ''}`}>
            {pkg.package_type} Pack
          </h3>
          
          <p className={`text-gray-600 text-sm mb-6 ${isRTL() ? 'font-cairo' : ''}`}>
            {pkg.description}
          </p>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Credits:</span>
              <span className="font-semibold text-gray-900">{pkg.credits}</span>
            </div>
            
            {pkg.bonus_credits > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Bonus:</span>
                <span className="font-semibold text-green-600">+{pkg.bonus_credits}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between border-t pt-4">
              <span className="text-gray-600">Total:</span>
              <span className="font-bold text-lg text-gray-900">{pkg.credits + pkg.bonus_credits}</span>
            </div>
          </div>
          
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              ${pkg.price_usd}
            </div>
            <div className="text-sm text-gray-500">
              ${(pkg.price_usd / (pkg.credits + pkg.bonus_credits)).toFixed(3)} per credit
            </div>
          </div>
          
          <Button
            fullWidth
            size="lg"
            onClick={() => handlePurchase(pkg.package_type)}
            disabled={isPurchasing}
            loading={isPurchasing}
            variant={isPopular ? 'primary' : 'outline'}
            icon={<CreditCard className="w-5 h-5" />}
          >
            Purchase Now
          </Button>
        </div>
      </div>
    )
  }

  const TransactionItem = ({ transaction }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-3 rtl:space-x-reverse">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTransactionColor(transaction.transaction_type)}`}>
          {getTransactionIcon(transaction.transaction_type)}
        </div>
        <div>
          <p className={`font-medium text-gray-900 ${isRTL() ? 'font-cairo' : ''}`}>
            {transaction.description || `${transaction.transaction_type} transaction`}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(transaction.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div className="text-right rtl:text-left">
        <p className={`font-semibold ${
          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
        </p>
        {transaction.cost_usd && (
          <p className="text-xs text-gray-500">
            ${transaction.cost_usd}
          </p>
        )}
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading credits information..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold text-gray-900 mb-2 ${isRTL() ? 'font-cairo' : ''}`}>
            {t('credits')} Management
          </h1>
          <p className={`text-gray-600 ${isRTL() ? 'font-cairo' : ''}`}>
            Purchase credits to generate educational content for your children
          </p>
        </div>

        {/* Current Balance */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold mb-2 ${isRTL() ? 'font-cairo' : ''}`}>
                Current Balance
              </h2>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Coins className="w-8 h-8" />
                <span className="text-4xl font-bold">{user?.credits || 0}</span>
                <span className="text-xl">credits</span>
              </div>
              {creditBalance && (
                <p className="text-blue-100 mt-2">
                  Total purchased: {creditBalance.total_purchased} • Total spent: {creditBalance.total_spent}
                </p>
              )}
            </div>
            
            <div className="text-right rtl:text-left">
              <Button
                variant="outline"
                onClick={() => setShowTransactions(!showTransactions)}
                icon={<History className="w-4 h-4" />}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                View History
              </Button>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        {showTransactions && creditBalance && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${isRTL() ? 'font-cairo' : ''}`}>
              Recent Transactions
            </h3>
            
            {creditBalance.recent_transactions.length > 0 ? (
              <div className="space-y-1">
                {creditBalance.recent_transactions.map((transaction) => (
                  <TransactionItem key={transaction.id} transaction={transaction} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className={`text-gray-500 ${isRTL() ? 'font-cairo' : ''}`}>
                  No transactions yet
                </p>
              </div>
            )}
          </div>
        )}

        {/* Credit Packages */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h2 className={`text-2xl font-bold text-gray-900 mb-4 ${isRTL() ? 'font-cairo' : ''}`}>
              Choose Your Credit Package
            </h2>
            <p className={`text-gray-600 max-w-2xl mx-auto ${isRTL() ? 'font-cairo' : ''}`}>
              Select the perfect package for your family's educational content needs. All packages include bonus credits!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {creditPackages.map((pkg) => (
              <PackageCard key={pkg.package_type} pkg={pkg} />
            ))}
          </div>
        </div>

        {/* Credit Usage Guide */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h3 className={`text-xl font-semibold text-gray-900 mb-6 ${isRTL() ? 'font-cairo' : ''}`}>
            How Credits Work
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-xl bg-green-50 border border-green-200">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h4 className={`font-semibold text-green-800 mb-2 ${isRTL() ? 'font-cairo' : ''}`}>
                Stories
              </h4>
              <p className="text-green-700 text-sm">1 credit each</p>
            </div>
            
            <div className="text-center p-4 rounded-xl bg-blue-50 border border-blue-200">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h4 className={`font-semibold text-blue-800 mb-2 ${isRTL() ? 'font-cairo' : ''}`}>
                Worksheets
              </h4>
              <p className="text-blue-700 text-sm">2 credits each</p>
            </div>
            
            <div className="text-center p-4 rounded-xl bg-purple-50 border border-purple-200">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h4 className={`font-semibold text-purple-800 mb-2 ${isRTL() ? 'font-cairo' : ''}`}>
                Quizzes
              </h4>
              <p className="text-purple-700 text-sm">2 credits each</p>
            </div>
            
            <div className="text-center p-4 rounded-xl bg-orange-50 border border-orange-200">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h4 className={`font-semibold text-orange-800 mb-2 ${isRTL() ? 'font-cairo' : ''}`}>
                Exercises
              </h4>
              <p className="text-orange-700 text-sm">1 credit each</p>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-start space-x-4 rtl:space-x-reverse">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className={`font-semibold text-blue-900 mb-2 ${isRTL() ? 'font-cairo' : ''}`}>
                  Best Value Tips
                </h4>
                <ul className={`text-blue-800 text-sm space-y-1 ${isRTL() ? 'font-cairo' : ''}`}>
                  <li>• Larger packages offer better value per credit</li>
                  <li>• Bonus credits are included with every package</li>
                  <li>• Credits never expire - use them at your own pace</li>
                  <li>• Family pack is perfect for multiple children</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h3 className={`text-xl font-semibold text-gray-900 mb-6 ${isRTL() ? 'font-cairo' : ''}`}>
            Frequently Asked Questions
          </h3>
          
          <div className="space-y-6">
            <div>
              <h4 className={`font-semibold text-gray-900 mb-2 ${isRTL() ? 'font-cairo' : ''}`}>
                Do credits expire?
              </h4>
              <p className={`text-gray-600 ${isRTL() ? 'font-cairo' : ''}`}>
                No, your credits never expire. You can use them at your own pace.
              </p>
            </div>
            
            <div>
              <h4 className={`font-semibold text-gray-900 mb-2 ${isRTL() ? 'font-cairo' : ''}`}>
                Can I get a refund?
              </h4>
              <p className={`text-gray-600 ${isRTL() ? 'font-cairo' : ''}`}>
                Yes, we offer refunds within 30 days of purchase for unused credits.
              </p>
            </div>
            
            <div>
              <h4 className={`font-semibold text-gray-900 mb-2 ${isRTL() ? 'font-cairo' : ''}`}>
                What payment methods do you accept?
              </h4>
              <p className={`text-gray-600 ${isRTL() ? 'font-cairo' : ''}`}>
                We accept all major credit cards, PayPal, and local payment methods through Stripe.
              </p>
            </div>
            
            <div>
              <h4 className={`font-semibold text-gray-900 mb-2 ${isRTL() ? 'font-cairo' : ''}`}>
                Is my payment information secure?
              </h4>
              <p className={`text-gray-600 ${isRTL() ? 'font-cairo' : ''}`}>
                Yes, all payments are processed securely through Stripe with industry-standard encryption.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Credits