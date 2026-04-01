"use client"

import { Button } from "@/components/ui/button"

export default function CTASection() {
  return (
    <section className="bg-gray-900 py-20 relative overflow-hidden">
      {/* Background parallax layers */}
      <div className="absolute inset-0 bg-parallax">
        <div className="absolute top-10 left-20 w-40 h-40 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-60 h-60 bg-gradient-to-r from-pink-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="bg-gray-800 rounded-3xl p-12 lg:p-20 relative overflow-hidden">
          {/* Inner background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-pink-900/10"></div>

          <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 scroll-animate">
                Start Your Design{" "}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Journey Today
                </span>
              </h2>
              <p className="text-gray-300 text-lg mb-8 scroll-animate">
                Join thousands of designers who have already experienced the power of AI-driven design. Start creating
                stunning visuals effortlessly.
              </p>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-lg font-semibold scroll-animate transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-purple-500/25">
                Get Started
              </Button>
            </div>
            <div className="relative flex justify-center lg:justify-end scroll-animate">
              {/* Enhanced CTA 3D element */}
              <div className="cta-3d floating-element parallax-element relative w-64 h-64 lg:w-80 lg:h-80">
                {/* Multiple glow layers */}
                <div className="absolute -inset-6 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-full blur-3xl opacity-15 animate-pulse"></div>
                <div className="absolute -inset-4 bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 rounded-full blur-2xl opacity-20"></div>

                {/* Main 3D structure */}
                <div className="relative w-full h-full bg-gradient-to-br from-purple-400 via-purple-500 to-pink-500 rounded-full shadow-2xl transform-gpu">
                  <div className="absolute inset-3 bg-gradient-to-tl from-purple-300 to-pink-300 rounded-full opacity-80"></div>
                  <div className="absolute inset-6 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-60"></div>
                  <div className="absolute inset-9 bg-gradient-to-tl from-white to-purple-100 rounded-full opacity-40"></div>

                  {/* Inner core with pulsing effect */}
                  <div className="absolute inset-12 bg-gradient-to-r from-white to-pink-100 rounded-full opacity-60 animate-pulse"></div>

                  {/* Floating elements */}
                  <div className="absolute top-8 left-8 w-2 h-2 bg-white rounded-full opacity-80 animate-ping"></div>
                  <div className="absolute bottom-12 right-10 w-3 h-3 bg-pink-200 rounded-full opacity-70 animate-bounce"></div>
                  <div className="absolute top-16 right-6 w-2 h-2 bg-purple-200 rounded-full opacity-60 animate-pulse"></div>
                </div>

                {/* Orbiting rings */}
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: "25s" }}>
                  <div className="absolute -top-2 left-1/2 w-4 h-4 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-60 transform -translate-x-1/2"></div>
                </div>
                <div
                  className="absolute inset-0 animate-spin"
                  style={{ animationDuration: "18s", animationDirection: "reverse" }}
                >
                  <div className="absolute bottom-2 right-6 w-3 h-3 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full opacity-50"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

