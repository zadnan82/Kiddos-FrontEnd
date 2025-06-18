import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Translation data
const translations = {
  ar: {
    // Navigation
    home: 'الرئيسية',
    dashboard: 'لوحة التحكم',
    children: 'الأطفال',
    generate: 'إنشاء محتوى',
    history: 'السجل',
    credits: 'النقاط',
    profile: 'الملف الشخصي',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    logout: 'تسجيل الخروج',

    // Common
    loading: 'جاري التحميل...',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',
    submit: 'إرسال',
    close: 'إغلاق',
    confirm: 'تأكيد',
    yes: 'نعم',
    no: 'لا',
    search: 'بحث',
    filter: 'تصفية',
    sort: 'ترتيب',
    
    // Forms
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    firstName: 'الاسم الأول',
    lastName: 'اسم العائلة',
    age: 'العمر',
    language: 'اللغة',
    timezone: 'المنطقة الزمنية',
    
    // Content
    story: 'قصة',
    worksheet: 'ورقة عمل',
    quiz: 'اختبار',
    exercise: 'تمرين',
    topic: 'الموضوع',
    difficulty: 'مستوى الصعوبة',
    
    // Messages
    welcome: 'مرحباً بك في كيدوز',
    loginSuccess: 'تم تسجيل الدخول بنجاح',
    logoutSuccess: 'تم تسجيل الخروج بنجاح',
    registrationSuccess: 'تم إنشاء الحساب بنجاح',
    saveSuccess: 'تم الحفظ بنجاح',
    deleteSuccess: 'تم الحذف بنجاح',
    error: 'حدث خطأ',
    tryAgain: 'حاول مرة أخرى',
    
    // Validation
    required: 'هذا الحقل مطلوب',
    invalidEmail: 'البريد الإلكتروني غير صحيح',
    passwordTooShort: 'كلمة المرور قصيرة جداً',
    passwordsDoNotMatch: 'كلمات المرور غير متطابقة',
    
    // Content types
    stories: 'القصص',
    worksheets: 'أوراق العمل',
    quizzes: 'الاختبارات',
    exercises: 'التمارين',
    
    // Placeholders
    enterEmail: 'أدخل البريد الإلكتروني',
    enterPassword: 'أدخل كلمة المرور',
    enterTopic: 'أدخل الموضوع',
    selectChild: 'اختر طفل',
    selectLanguage: 'اختر اللغة',
    
    // Home page
    heroTitle: 'محتوى تعليمي مخصص لأطفالك',
    heroSubtitle: 'منصة ذكية لإنتاج محتوى تعليمي آمن ومناسب لأعمار الأطفال باللغة العربية والإنجليزية',
    getStarted: 'ابدأ الآن',
    learnMore: 'اعرف المزيد',
    
    // Features
    features: 'المميزات',
    aiPowered: 'مدعوم بالذكاء الاصطناعي',
    aiPoweredDesc: 'محتوى تعليمي مخصص ومناسب لعمر طفلك',
    multiLanguage: 'متعدد اللغات',
    multiLanguageDesc: 'دعم للغة العربية والإنجليزية',
    safe: 'آمن ومناسب',
    safeDesc: 'جميع المحتويات مراجعة وآمنة للأطفال',
    
    // Dashboard
    welcomeBack: 'مرحباً بك مرة أخرى',
    totalContent: 'إجمالي المحتوى',
    thisWeek: 'هذا الأسبوع',
    creditsRemaining: 'النقاط المتبقية',
    recentActivity: 'النشاط الحديث',
    
    // Credits
    creditsBalance: 'رصيد النقاط',
    purchaseCredits: 'شراء نقاط',
    creditPackages: 'باقات النقاط',
    
    // Settings
    settings: 'الإعدادات',
    personalInfo: 'المعلومات الشخصية',
    preferences: 'التفضيلات',
    privacy: 'الخصوصية',
    notifications: 'الإشعارات',
  },
  
  en: {
    // Navigation
    home: 'Home',
    dashboard: 'Dashboard',
    children: 'Children',
    generate: 'Generate',
    history: 'History',
    credits: 'Credits',
    profile: 'Profile',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',

    // Common
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    close: 'Close',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    
    // Forms
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    age: 'Age',
    language: 'Language',
    timezone: 'Timezone',
    
    // Content
    story: 'Story',
    worksheet: 'Worksheet',
    quiz: 'Quiz',
    exercise: 'Exercise',
    topic: 'Topic',
    difficulty: 'Difficulty',
    
    // Messages
    welcome: 'Welcome to Kiddos',
    loginSuccess: 'Login successful',
    logoutSuccess: 'Logout successful',
    registrationSuccess: 'Registration successful',
    saveSuccess: 'Saved successfully',
    deleteSuccess: 'Deleted successfully',
    error: 'An error occurred',
    tryAgain: 'Try again',
    
    // Validation
    required: 'This field is required',
    invalidEmail: 'Invalid email address',
    passwordTooShort: 'Password is too short',
    passwordsDoNotMatch: 'Passwords do not match',
    
    // Content types
    stories: 'Stories',
    worksheets: 'Worksheets',
    quizzes: 'Quizzes',
    exercises: 'Exercises',
    
    // Placeholders
    enterEmail: 'Enter email',
    enterPassword: 'Enter password',
    enterTopic: 'Enter topic',
    selectChild: 'Select child',
    selectLanguage: 'Select language',
    
    // Home page
    heroTitle: 'Educational Content Tailored for Your Children',
    heroSubtitle: 'AI-powered platform to create safe, age-appropriate educational content in Arabic and English',
    getStarted: 'Get Started',
    learnMore: 'Learn More',
    
    // Features
    features: 'Features',
    aiPowered: 'AI-Powered',
    aiPoweredDesc: 'Personalized educational content suitable for your child\'s age',
    multiLanguage: 'Multi-Language',
    multiLanguageDesc: 'Support for Arabic and English languages',
    safe: 'Safe & Appropriate',
    safeDesc: 'All content is reviewed and safe for children',
    
    // Dashboard
    welcomeBack: 'Welcome back',
    totalContent: 'Total Content',
    thisWeek: 'This Week',
    creditsRemaining: 'Credits Remaining',
    recentActivity: 'Recent Activity',
    
    // Credits
    creditsBalance: 'Credits Balance',
    purchaseCredits: 'Purchase Credits',
    creditPackages: 'Credit Packages',
    
    // Settings
    settings: 'Settings',
    personalInfo: 'Personal Information',
    preferences: 'Preferences',
    privacy: 'Privacy',
    notifications: 'Notifications',
  }
}

export const useLanguageStore = create(
  persist(
    (set, get) => ({
      // State
      language: 'ar',
      availableLanguages: [
        { code: 'ar', name: 'العربية', flag: '🇸🇦' },
        { code: 'en', name: 'English', flag: '🇺🇸' }
      ],

      // Actions
      setLanguage: (lang) => {
        set({ language: lang })
        
        // Update document attributes
        document.documentElement.lang = lang
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
        
        // Save to localStorage for persistence
        localStorage.setItem('kiddos-language', lang)
      },

      // Get translated text
      t: (key, fallback = key) => {
        const { language } = get()
        return translations[language]?.[key] || translations.en?.[key] || fallback
      },

      // Check if current language is RTL
      isRTL: () => {
        const { language } = get()
        return language === 'ar'
      },

      // Get current language info
      getCurrentLanguage: () => {
        const { language, availableLanguages } = get()
        return availableLanguages.find(lang => lang.code === language)
      }
    }),
    {
      name: 'language-storage',
      partialize: (state) => ({ language: state.language }),
    }
  )
)