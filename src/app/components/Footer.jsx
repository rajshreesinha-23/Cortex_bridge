import React from 'react'

const Footer = () => {
  return (
    <div>{/* Footer */}
      <footer className="bg-gray-50 border-t border-green-100 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-xl font-bold text-green-600 mb-4">Cortex Bridge</div>
              <p className="text-gray-600 text-sm">Empowering every learner with AI-driven adaptive education.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-green-600">Features</a></li>
                <li><a href="#" className="hover:text-green-600">Pricing</a></li>
                <li><a href="#" className="hover:text-green-600">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-green-600">About</a></li>
                <li><a href="#" className="hover:text-green-600">Blog</a></li>
                <li><a href="#" className="hover:text-green-600">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-green-600">Privacy</a></li>
                <li><a href="#" className="hover:text-green-600">Terms</a></li>
                <li><a href="#" className="hover:text-green-600">Accessibility</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-green-100 pt-8 text-center text-gray-600 text-sm">
            <p>&copy; 2026 Cortex Bridge. All rights reserved. Powered by NeuroLens AI.</p>
          </div>
        </div>
      </footer></div>
  )
}

export default Footer