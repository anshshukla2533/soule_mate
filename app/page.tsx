import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-200/30 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-200/30 blur-[150px] rounded-full" />

      <div className="max-w-5xl w-full glass rounded-[3rem] p-8 md:p-16 text-center space-y-12 relative z-10 border-white/50 backdrop-blur-2xl">
        <div className="space-y-6">
          <div className="inline-block px-4 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold uppercase tracking-widest animate-bounce">
            Find Your Soulmate
          </div>
          <h1 className="text-7xl md:text-9xl font-black text-love leading-tight drop-shadow-sm">
            Matchmate
          </h1>
          <p className="text-2xl md:text-3xl text-gray-700 font-semibold max-w-3xl mx-auto leading-relaxed">
            Where <span className="text-rose-600">Personality</span> Meets <span className="text-pink-600">Passion</span>.
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium">
            Connect with someone special through shared interests and meaningful challenges.
            Our intelligent matching engine finds the heart that beats in sync with yours.
          </p>
        </div>

        <div className="flex gap-6 justify-center flex-wrap">
          <Link
            href="/register"
            className="group relative px-10 py-5 love-gradient text-white rounded-2xl font-bold text-xl transition-all shadow-2xl hover:shadow-rose-400/50 transform hover:-translate-y-1 active:scale-95 overflow-hidden"
          >
            <span className="relative z-10">Start Your Journey 💕</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </Link>
          <Link
            href="/login"
            className="px-10 py-5 bg-white border-2 border-rose-100 text-rose-600 rounded-2xl font-bold text-xl hover:bg-rose-50 transition-all shadow-xl hover:shadow-rose-200/50 transform hover:-translate-y-1 active:scale-95"
          >
            Welcome Back
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {[
            { emoji: '💝', title: 'Curated Matches', desc: 'Precise personality-based pairing that goes beyond surface levels.' },
            { emoji: '✨', title: 'Shared Quests', desc: 'Bond over exciting tasks designed to bring you closer together.' },
            { emoji: '🔒', title: 'Safe & Secure', desc: 'Your privacy is our priority. Connect with confidence and peace of mind.' }
          ].map((feature, i) => (
            <div key={i} className="group p-8 bg-white/40 rounded-[2rem] border border-white/60 hover:bg-white/60 transition-all duration-500 card-hover">
              <div className="text-5xl mb-6 transform group-hover:scale-125 transition-transform duration-500">{feature.emoji}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
