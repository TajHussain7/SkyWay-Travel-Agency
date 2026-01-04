import { useEffect, useState } from "react";

const BookingSuccessAnimation = ({ isVisible, onAnimationComplete }) => {
  const [phase, setPhase] = useState(0); // 0: initial, 1: flying, 2: success popup, 3: fade out

  useEffect(() => {
    if (isVisible) {
      setPhase(1);

      // Phase 2: Show success popup after airplane completes one loop
      const successTimer = setTimeout(() => {
        setPhase(2);
      }, 2000);

      // Phase 3: Fade out and complete
      const completeTimer = setTimeout(() => {
        setPhase(3);
        setTimeout(() => {
          onAnimationComplete();
        }, 500);
      }, 4500);

      return () => {
        clearTimeout(successTimer);
        clearTimeout(completeTimer);
      };
    } else {
      setPhase(0);
    }
  }, [isVisible, onAnimationComplete]);

  if (!isVisible) return null;

  return (
    <>
      {/* Transparent overlay - allows seeing the page behind */}
      <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
        {/* Flying Airplane - moves across the actual screen */}
        <div className={`airplane-wrapper ${phase >= 1 ? "animate-fly" : ""}`}>
          {/* Airplane with Skyway branding colors */}
          <svg viewBox="0 0 120 50" className="airplane-svg">
            <defs>
              <linearGradient
                id="skyway-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" style={{ stopColor: "#667eea" }} />
                <stop offset="100%" style={{ stopColor: "#764ba2" }} />
              </linearGradient>
              <linearGradient
                id="skyway-body"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" style={{ stopColor: "#ffffff" }} />
                <stop offset="100%" style={{ stopColor: "#f0f4ff" }} />
              </linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Main Body */}
            <ellipse
              cx="60"
              cy="25"
              rx="45"
              ry="10"
              fill="url(#skyway-body)"
              stroke="#667eea"
              strokeWidth="1"
            />

            {/* Cockpit Window */}
            <ellipse
              cx="95"
              cy="25"
              rx="10"
              ry="7"
              fill="#667eea"
              opacity="0.3"
            />
            <ellipse
              cx="97"
              cy="25"
              rx="6"
              ry="5"
              fill="#60a5fa"
              opacity="0.8"
            />

            {/* Top Wing */}
            <path
              d="M45 25 L20 8 L55 20 Z"
              fill="url(#skyway-gradient)"
              filter="url(#glow)"
            />

            {/* Bottom Wing */}
            <path
              d="M45 25 L20 42 L55 30 Z"
              fill="url(#skyway-gradient)"
              filter="url(#glow)"
            />

            {/* Tail Fin */}
            <path d="M18 25 L5 10 L22 22 Z" fill="url(#skyway-gradient)" />
            <path d="M18 25 L5 40 L22 28 Z" fill="url(#skyway-gradient)" />

            {/* Vertical Stabilizer */}
            <path d="M15 25 L10 12 L20 25 Z" fill="#667eea" />

            {/* Engine Exhaust Glow */}
            <ellipse
              cx="8"
              cy="25"
              rx="6"
              ry="4"
              fill="#fbbf24"
              opacity="0.9"
              filter="url(#glow)"
            >
              <animate
                attributeName="opacity"
                values="0.7;1;0.7"
                dur="0.2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="rx"
                values="6;8;6"
                dur="0.3s"
                repeatCount="indefinite"
              />
            </ellipse>

            {/* Windows */}
            <circle cx="75" cy="25" r="2.5" fill="#667eea" opacity="0.5" />
            <circle cx="65" cy="25" r="2.5" fill="#667eea" opacity="0.5" />
            <circle cx="55" cy="25" r="2.5" fill="#667eea" opacity="0.5" />
            <circle cx="45" cy="25" r="2.5" fill="#667eea" opacity="0.5" />

            {/* Skyway Text on body */}
            <text
              x="60"
              y="28"
              textAnchor="middle"
              fill="#667eea"
              fontSize="6"
              fontWeight="bold"
              fontFamily="Arial"
            >
              SKYWAY
            </text>
          </svg>

          {/* Contrails */}
          <div className="contrail-trail"></div>
          <div className="contrail-trail contrail-2"></div>
        </div>
      </div>

      {/* Success Popup Modal */}
      {phase >= 2 && (
        <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
          {/* Semi-transparent backdrop */}
          <div
            className={`absolute inset-0 bg-black transition-opacity duration-300 ${
              phase === 3 ? "opacity-0" : "opacity-40"
            }`}
          />

          {/* Popup Card */}
          <div
            className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-500 ${
              phase === 3
                ? "opacity-0 scale-95"
                : "opacity-100 scale-100 animate-popup-enter"
            }`}
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-center">
              {/* Animated checkmark circle */}
              <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg animate-success-bounce">
                <svg
                  className="w-12 h-12 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                    className="animate-check-draw"
                  />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 text-center">
              {/* Skyway Logo/Brand */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-lg flex items-center justify-center">
                  <i className="fas fa-plane text-white text-lg"></i>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                  SKYWAY
                </span>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Booking Confirmed!
              </h2>
              <p className="text-gray-600 mb-4">
                Your flight has been successfully booked. Get ready for your
                journey!
              </p>

              {/* Decorative plane icon */}
              <div className="flex items-center justify-center gap-3 text-primary mb-4">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary"></div>
                <i className="fas fa-plane text-xl"></i>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary"></div>
              </div>

              {/* Redirect indicator */}
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <div className="loading-spinner"></div>
                <span className="text-sm">
                  Redirecting to your dashboard...
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .airplane-wrapper {
          position: absolute;
          width: 120px;
          height: 50px;
          z-index: 102;
          opacity: 0;
        }
        
        .airplane-svg {
          width: 120px;
          height: 50px;
          filter: drop-shadow(0 4px 12px rgba(102, 126, 234, 0.4));
        }
        
        .airplane-wrapper.animate-fly {
          animation: smooth-fly 2s ease-in-out forwards;
        }
        
        @keyframes smooth-fly {
          0% {
            left: -150px;
            top: 60%;
            transform: rotate(-10deg) scale(0.8);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          30% {
            left: 30%;
            top: 30%;
            transform: rotate(-5deg) scale(1);
          }
          50% {
            left: 50%;
            top: 50%;
            transform: rotate(5deg) scale(1.1);
          }
          70% {
            left: 70%;
            top: 25%;
            transform: rotate(-8deg) scale(1);
          }
          90% {
            opacity: 1;
          }
          100% {
            left: calc(100% + 150px);
            top: 40%;
            transform: rotate(-5deg) scale(0.9);
            opacity: 0;
          }
        }
        
        .contrail-trail {
          position: absolute;
          right: 112px;
          top: 22px;
          width: 80px;
          height: 3px;
          background: linear-gradient(to left, rgba(102, 126, 234, 0.6), transparent);
          border-radius: 2px;
          animation: trail-flow 0.4s ease-out infinite;
        }
        
        .contrail-2 {
          top: 28px;
          width: 60px;
          animation-delay: 0.1s;
        }
        
        @keyframes trail-flow {
          0% {
            opacity: 0.8;
            width: 80px;
          }
          100% {
            opacity: 0;
            width: 120px;
          }
        }
        
        .animate-popup-enter {
          animation: popup-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        @keyframes popup-enter {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-success-bounce {
          animation: success-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
        
        @keyframes success-bounce {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }
        
        .animate-check-draw {
          stroke-dasharray: 24;
          stroke-dashoffset: 24;
          animation: draw-check 0.4s ease-out 0.3s forwards;
        }
        
        @keyframes draw-check {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #e5e7eb;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        /* Primary color classes for the popup */
        .from-primary {
          --tw-gradient-from: #667eea;
        }
        .to-primary-dark {
          --tw-gradient-to: #5a67d8;
        }
        .text-primary {
          color: #667eea;
        }
        .bg-gradient-to-r {
          background-image: linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to));
        }
      `}</style>
    </>
  );
};

export default BookingSuccessAnimation;
