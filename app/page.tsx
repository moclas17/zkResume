import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Lock, CheckCircle, ArrowRight, Users, Award } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">zkResume Snapshots</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900">
              How it works
            </Link>
            <Link href="#privacy" className="text-gray-600 hover:text-gray-900">
              Privacy
            </Link>
            <Button variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Prove your work experience <span className="text-blue-600">without revealing your data</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Generate an anonymous verifiable credential from your professional experience, without exposing where
                you worked or sensitive information.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link href="/upload">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                View Demo
              </Button>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>100% private</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No data storage</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Verifiable</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10">
              <Image
                src="/placeholder.svg?height=500&width=500"
                alt="Privacy and professional credentials illustration"
                width={500}
                height={500}
                className="w-full max-w-md mx-auto"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-3xl -z-10" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How it works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A simple and secure process to create your anonymous professional credential
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">1. Share your experience</h3>
                <p className="text-gray-600">
                  Enter your role, years of experience, industry and key achievements. Your data is never stored.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">2. Private processing</h3>
                <p className="text-gray-600">
                  Your information is processed in a confidential environment that generates a proof without revealing
                  the original data.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">3. Verifiable credential</h3>
                <p className="text-gray-600">
                  Receive a digital credential that proves your experience without exposing sensitive information.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section id="privacy" className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Your privacy is our priority</h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              We use confidential computing technology to process your information without anyone, not even us, being
              able to access your personal data.
            </p>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">✓ No storage</h3>
                <p className="text-gray-600">Your data is processed and immediately deleted. We don't keep records.</p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">✓ Secure processing</h3>
                <p className="text-gray-600">
                  We use secure enclaves that guarantee no one can access your information.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">✓ Optional verification</h3>
                <p className="text-gray-600">
                  You can choose whether to allow former employers to validate your information.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">✓ Full control</h3>
                <p className="text-gray-600">You decide when and with whom to share your anonymous credential.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold">zkResume Snapshots</span>
              </div>
              <p className="text-gray-400 text-sm">Anonymous and verifiable professional credentials.</p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Product</h4>
              <div className="space-y-2 text-sm">
                <Link href="#" className="block text-gray-400 hover:text-white">
                  How it works
                </Link>
                <Link href="#" className="block text-gray-400 hover:text-white">
                  Use cases
                </Link>
                <Link href="#" className="block text-gray-400 hover:text-white">
                  Pricing
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Resources</h4>
              <div className="space-y-2 text-sm">
                <Link href="#" className="block text-gray-400 hover:text-white">
                  Documentation
                </Link>
                <Link href="#" className="block text-gray-400 hover:text-white">
                  GitHub
                </Link>
                <Link href="#" className="block text-gray-400 hover:text-white">
                  Blog
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Legal</h4>
              <div className="space-y-2 text-sm">
                <Link href="#" className="block text-gray-400 hover:text-white">
                  Privacy Policy
                </Link>
                <Link href="#" className="block text-gray-400 hover:text-white">
                  Terms of Service
                </Link>
                <Link href="#" className="block text-gray-400 hover:text-white">
                  Contact
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 zkResume Snapshots. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
