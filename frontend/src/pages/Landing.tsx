import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Brain, 
  Target, 
  Users, 
  Zap, 
  CheckCircle, 
  Calendar,
  TrendingUp,
  Heart,
  Clock,
  Sparkles 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950/20 to-gray-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Subtle animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" style={{ animation: 'pulse 4s ease-in-out infinite' }} />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl" style={{ animation: 'pulse 6s ease-in-out infinite' }} />
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <Brain className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              StudySync
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              className="text-gray-300 hover:text-white"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
            <Button 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={() => navigate('/signup')}
            >
              Get Started Free
            </Button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 text-center">
          <div className="max-w-3xl mx-auto">
            {/* Problem Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-900/30 border border-purple-700/30 mb-6">
              <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
              <span className="text-sm text-purple-300">For ADHD, Dyslexia & Executive Function Challenges</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="text-white">Your AI Accountability Buddy for</span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Consistent, Focused Learning
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              <span className="font-semibold text-white">92% of students use AI tutors,</span> but 
              <span className="font-semibold text-red-400"> 70% still struggle with consistency.</span>
              <br />
              StudySync isn't another AI tutor—it's your daily accountability partner 
              that understands neurodivergent minds.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-6"
                onClick={() => navigate('/auth')}
              >
                Start Your 7-Day Free Trial
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-purple-700 text-purple-300 hover:bg-purple-900/30 text-lg px-8 py-6"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              >
                See How It Works
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-1 text-green-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1 text-blue-400" />
                <span>Join 500+ neurodivergent learners</span>
              </div>
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-1 text-yellow-400" />
                <span>60% see results in first week</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Problem Statement Section */}
      <div className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            The Real Problem AI Tutors Don't Solve
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            AI tutors are great at answering questions. But for neurodivergent learners, 
            the challenge isn't content—it's consistency, focus, and motivation.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <div className="w-12 h-12 bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Time Blindness</h3>
            <p className="text-gray-400">
              ADHD makes it hard to track time. "Study for exam" feels impossible when 
              you can't break it down or estimate how long tasks take.
            </p>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <div className="w-12 h-12 bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Accountability</h3>
            <p className="text-gray-400">
              Without external structure, it's easy to procrastinate. Study apps don't 
              check in on you or celebrate small wins.
            </p>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <div className="w-12 h-12 bg-yellow-900/30 rounded-lg flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Emotional Support</h3>
            <p className="text-gray-400">
              Bad days happen. AI tutors don't understand when you're overwhelmed 
              or need gentle encouragement instead of more information.
            </p>
          </Card>
        </div>
      </div>

      {/* Solution Section */}
      <div id="how-it-works" className="py-24 px-6 bg-purple-950/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              How StudySync Actually Helps You Study
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We're not another AI tutor. We're your accountability system that 
              understands how neurodivergent minds work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Feature List */}
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Calendar className="w-5 h-5 text-purple-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-white mb-1">Daily Check-ins That Actually Care</h3>
                  <p className="text-gray-400">
                    Morning energy check, evening reflection. Our AI adapts to your mood—gentle 
                    on low-energy days, celebratory when you're crushing it.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-10 h-10 bg-pink-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Brain className="w-5 h-5 text-pink-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-white mb-1">Task Breakdown for ADHD Minds</h3>
                  <p className="text-gray-400">
                    "Study for exam" becomes 5 manageable 25-minute tasks. We handle the 
                    executive function so you can focus on learning.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-10 h-10 bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-white mb-1">Study Rooms Without Judgment</h3>
                  <p className="text-gray-400">
                    Join anonymous study sessions with others who get it. No cameras, 
                    no pressure—just knowing you're not alone.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-10 h-10 bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-white mb-1">Celebrate Progress, Not Perfection</h3>
                  <p className="text-gray-400">
                    Streaks for showing up, badges for trying. We celebrate the 15-minute 
                    study session as much as the 2-hour marathon.
                  </p>
                </div>
              </div>
            </div>

            {/* Demo Card */}
            <div className="relative">
              <Card className="bg-gray-900 border-gray-800 p-8">
                <div className="space-y-4">
                  {/* Morning Check-in Example */}
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-sm text-purple-400 mb-2">Morning Check-in</p>
                    <p className="text-white mb-3">How's your energy today? (1-10)</p>
                    <div className="flex space-x-2 mb-3">
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <button 
                          key={n}
                          className={`w-8 h-8 rounded-full text-xs ${
                            n === 6 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-gray-700 text-gray-400'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-800/30">
                      <p className="text-sm text-purple-300">
                        "Energy at 6—that's perfectly workable! Let's start with something 
                        manageable today. Even 15 minutes counts. You've got this! 💜"
                      </p>
                    </div>
                  </div>

                  {/* Task Breakdown Example */}
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-sm text-pink-400 mb-2">Task Breakdown</p>
                    <p className="text-gray-400 mb-3">Original: "Study for biology exam"</p>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                        <span className="text-gray-300">Review chapter summary (15 min)</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-4 h-4 mr-2 rounded-full border-2 border-gray-600" />
                        <span className="text-gray-300">Make flashcards for key terms (20 min)</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-4 h-4 mr-2 rounded-full border-2 border-gray-600" />
                        <span className="text-gray-300">Practice quiz questions (25 min)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* Decorative gradient */}
              <div className="absolute -z-10 -top-4 -right-4 w-full h-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg blur-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Differentiators Section */}
      <div className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Why StudySync Works for Neurodivergent Learners
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Built by and for people with ADHD, dyslexia, and executive function challenges. 
            Every feature is designed with neurodiversity in mind.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-purple-900/20 to-purple-900/10 border-purple-800/30 p-6">
            <h3 className="font-semibold text-white mb-2">Dark Mode Default</h3>
            <p className="text-sm text-gray-400">
              Reduces eye strain and sensory overload. Light mode is the option, not the default.
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-pink-900/20 to-pink-900/10 border-pink-800/30 p-6">
            <h3 className="font-semibold text-white mb-2">No Shame, Only Support</h3>
            <p className="text-sm text-gray-400">
              Missed a day? That's okay. We'll help you start fresh without guilt trips.
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-900/10 border-blue-800/30 p-6">
            <h3 className="font-semibold text-white mb-2">Clear, Simple UI</h3>
            <p className="text-sm text-gray-400">
              No overwhelming options. Every screen has one clear action to take next.
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/20 to-green-900/10 border-green-800/30 p-6">
            <h3 className="font-semibold text-white mb-2">Flexible Timing</h3>
            <p className="text-sm text-gray-400">
              15-minute or 2-hour sessions? Both are wins. Work with your brain, not against it.
            </p>
          </Card>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="py-24 px-6 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-12">
            Real Students, Real Results
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-center mb-4">
                {[1,2,3,4,5].map(i => (
                  <Zap key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4 italic">
                "I've tried every study app. StudySync is the first one that actually 
                checks if I showed up. My 12-day streak is my longest ever!"
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-semibold">Sarah K.</span> • ADHD • College Junior
              </p>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-center mb-4">
                {[1,2,3,4,5].map(i => (
                  <Zap key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4 italic">
                "The task breakdown is life-changing. 'Write essay' used to paralyze 
                me. Now I just follow the steps StudySync creates."
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-semibold">Marcus T.</span> • Dyslexia • High School Senior
              </p>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-center mb-4">
                {[1,2,3,4,5].map(i => (
                  <Zap key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4 italic">
                "Study rooms make me feel less alone. Knowing others are working 
                too helps me focus, even on bad brain days."
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-semibold">Alex R.</span> • Anxiety • Remote Learner
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-300">
            Start free. Upgrade when you're ready. Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <Card className="bg-gray-900/50 border-gray-800 p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
              <p className="text-gray-400">Perfect for trying StudySync</p>
            </div>
            <div className="text-4xl font-bold text-white mb-6">
              $0<span className="text-lg text-gray-400">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-3 text-green-400" />
                <span className="text-gray-300">1 daily check-in</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-3 text-green-400" />
                <span className="text-gray-300">Basic task breakdown</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-3 text-green-400" />
                <span className="text-gray-300">Join study rooms</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-3 text-green-400" />
                <span className="text-gray-300">Basic progress tracking</span>
              </li>
            </ul>
            <Button 
              className="w-full"
              variant="outline"
              onClick={() => navigate('/auth')}
            >
              Start Free
            </Button>
          </Card>

          {/* Pro Tier */}
          <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-700/50 p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm px-4 py-1 rounded-full">
                Most Popular
              </span>
            </div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <p className="text-gray-400">For serious learners</p>
            </div>
            <div className="text-4xl font-bold text-white mb-6">
              $15<span className="text-lg text-gray-400">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-3 text-green-400" />
                <span className="text-gray-300">Unlimited check-ins</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-3 text-green-400" />
                <span className="text-gray-300">Advanced AI task breakdown</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-3 text-green-400" />
                <span className="text-gray-300">Create private study rooms</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-3 text-green-400" />
                <span className="text-gray-300">Buddy matching</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-3 text-green-400" />
                <span className="text-gray-300">Detailed analytics</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-3 text-green-400" />
                <span className="text-gray-300">Priority support</span>
              </li>
            </ul>
            <Button 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={() => navigate('/auth')}
            >
              Start 7-Day Free Trial
            </Button>
          </Card>
        </div>

        <p className="text-center text-gray-500 mt-8">
          Students with .edu email get 20% off. Cancel or change plans anytime.
        </p>
      </div>

      {/* Final CTA Section */}
      <div className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-12 border border-purple-700/30">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Finally Build Consistent Study Habits?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of neurodivergent learners who've discovered that the problem 
            was never their ability—it was the lack of the right support system.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-6"
              onClick={() => navigate('/auth')}
            >
              Start Your Free Trial
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-purple-700 text-purple-300 hover:bg-purple-900/30 text-lg px-8 py-6"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            No credit card required • 7-day free trial • Cancel anytime
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Brain className="w-6 h-6 text-purple-400" />
              <span className="text-lg font-semibold text-gray-300">StudySync</span>
              <span className="text-sm text-gray-500">© 2024</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white">Privacy</a>
              <a href="#" className="hover:text-white">Terms</a>
              <a href="#" className="hover:text-white">Support</a>
              <a href="mailto:hello@studysync.ai" className="hover:text-white">hello@studysync.ai</a>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-500">
            Built with 💜 for neurodivergent learners everywhere
          </div>
        </div>
      </footer>
    </div>
  )
}