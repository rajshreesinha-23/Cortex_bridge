'use client';

import React from 'react';
import { Eye, Headphones, Brain, BookOpen, ArrowRight, Zap, Users, Globe } from 'lucide-react';
import Footer from './components/Footer';

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-green-50 to-white">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-green-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-green-600">
            Cortex <span className="text-green-400">Bridge</span>
          </div>
          <div className="hidden md:flex gap-8">
            <a href="#features" className="text-gray-600 hover:text-green-600 transition">Features</a>
            <a href="#benefits" className="text-gray-600 hover:text-green-600 transition">Benefits</a>
            <a href="#cta" className="text-gray-600 hover:text-green-600 transition">Get Started</a>
          </div>
          <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
            The Future of Learning is Here
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            NeuroLens AI — <span className="text-green-600">Adaptive Multimodal</span> Learning for Every Brain
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            One lesson becomes many formats instantly. Your brain, your learning style, your pace. Experience education like never before.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition font-semibold text-lg flex items-center justify-center gap-2">
              Explore Learning <ArrowRight size={20} />
            </button>
            <button className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-lg hover:bg-green-50 transition font-semibold text-lg">
              Watch Demo
            </button>
          </div>

          {/* Hero Image */}
          <div className="bg-gradient-to-b from-green-100 to-green-50 rounded-2xl p-12 border border-green-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-green-100 hover:shadow-md transition">
                  <div className="w-12 h-12 bg-green-100 rounded-lg mb-4"></div>
                  <div className="h-3 bg-green-100 rounded mb-2"></div>
                  <div className="h-2 bg-green-50 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-green-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Adaptive for Every Learning Style</h2>
            <p className="text-lg text-gray-600">Real-time content transformation tailored to your needs</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-8 border border-green-200 hover:shadow-lg transition">
              <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Eye className="text-green-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Blind Students</h3>
              <p className="text-gray-600 mb-4">Audio-first learning with advanced screen reader mode integration for seamless content navigation.</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  High-quality audio descriptions
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Full keyboard navigation
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-8 border border-green-200 hover:shadow-lg transition">
              <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Headphones className="text-green-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Hearing Impaired</h3>
              <p className="text-gray-600 mb-4">Live captions and expressive sign language avatars for inclusive communication.</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Real-time accurate captions
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Sign language avatars
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-8 border border-green-200 hover:shadow-lg transition">
              <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Brain className="text-green-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">ADHD Learners</h3>
              <p className="text-gray-600 mb-4">Focus mode with chunked content delivery and interactive engagement features.</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Distraction-free interface
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Micro-learning modules
                </li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl p-8 border border-green-200 hover:shadow-lg transition">
              <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <BookOpen className="text-green-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Dyslexic Learners</h3>
              <p className="text-gray-600 mb-4">Specialized fonts, simplified layouts, and read-aloud functionality.</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  OpenDyslexic font support
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Natural voice narration
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Instant Transformation</h3>
              <p className="text-gray-600">Same content, infinite adaptations. Your learning, your way.</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Inclusive by Design</h3>
              <p className="text-gray-600">Every mind matters. Learn at your own pace with your own needs.</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Global Access</h3>
              <p className="text-gray-600">Quality education accessible to everyone, everywhere.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-20 px-6 bg-gradient-to-r from-green-600 to-green-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Learning?</h2>
          <p className="text-xl text-green-50 mb-8">
            Join thousands of learners experiencing education designed for every brain.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-green-600 px-8 py-4 rounded-lg hover:bg-green-50 transition font-semibold text-lg">
              Start Learning Free
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-green-700 transition font-semibold text-lg">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      <Footer/>
    </div>
  );
}