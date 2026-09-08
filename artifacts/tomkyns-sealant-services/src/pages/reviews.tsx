import { Link } from "wouter";
import { Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { Star } from "lucide-react";

const GOOGLE_REVIEWS = [
  { 
    id: 1,
    initial: "A", 
    color: "bg-[#7cb342]", 
    author: "A", 
    date: "2024-09-29", 
    text: "What a lovely friendly guy. Easy going and helpful. Would recommend" 
  },
  { 
    id: 2,
    initial: "H", 
    color: "bg-[#29b6f6]", 
    author: "Honesty", 
    date: "2024-09-05", 
    text: "What a lovely friendly guy. Called for a job. Gave me a ballpark and offered to come for a site visit to confirm prices. Would recommend!" 
  },
  { 
    id: 3,
    initial: "A", 
    color: "bg-[#00acc1]", 
    author: "Alfie hutchinson", 
    date: "2024-07-21", 
    text: "Excellent job, very happy. Jon was very professional, punctual and done an amazing job. Would highly recommend" 
  },
  { 
    id: 4,
    initial: "G", 
    color: "bg-[#00acc1]", 
    author: "Georgia Perry", 
    date: "2022-02-01", 
    text: "Excellent service & fantastic finish. Would definitely recommend" 
  },
  { 
    id: 5,
    initial: "C", 
    color: "bg-[#212121]", 
    author: "Charanjeev Rao", 
    date: "2021-09-20", 
    text: "Top guy, quick, clean, neat and importantly good attention to detail, definitely a mastic master at his work. Value for money, chazz!" 
  },
  { 
    id: 6,
    initial: "M", 
    color: "bg-[#1e88e5]", 
    author: "Monica Hudson", 
    date: "2021-06-08", 
    text: "Would highly recommend, did an excellent job!" 
  }
];

export default function ReviewsPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Top Bar */}
      <div className="bg-foreground text-white py-2 px-4 text-sm hidden md:block">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2"><Phone size={14} className="text-primary" /> 07596 095248</span>
            <span className="flex items-center gap-2"><Mail size={14} className="text-primary" /> jongildea@tomkynssealant.co.uk</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-primary" /> Mon-Fri 08:00-17:00
          </div>
        </div>
      </div>

      {/* Navbar (Sticky) */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <img src="/logo.png" alt="Tomkyns Sealant Services" className="h-12 w-auto object-contain cursor-pointer" />
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-8 font-medium text-foreground/80">
             <Link href="/" className="hover:text-primary transition-colors">Home</Link>
             <a href="/#services" className="hover:text-primary transition-colors">Services</a>
             <Link href="/reviews" className="text-primary transition-colors">Reviews</Link>
             <a href="/#quote" className="hover:text-primary transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-sm text-muted-foreground font-medium">Call Jon direct</span>
              <a href="tel:07596095248" className="text-foreground font-display font-bold text-lg hover:text-primary transition-colors">07596 095248</a>
            </div>
            <Button asChild size="lg" className="font-semibold shadow-sm" data-testid="button-nav-quote">
              <a href="/#quote">Get a Free Quote</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow bg-[#f9fafb]">
        {/* Charcoal Header Band */}
        <div className="bg-foreground text-white py-6 px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="!text-white text-2xl md:text-3xl font-display font-medium">Reviews</h1>
          </div>
        </div>

        {/* Reviews Content */}
        <section className="py-16 md:py-24">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold font-display uppercase tracking-wider text-foreground mb-4">Excellent</h2>
            
            <div className="flex justify-center items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="fill-[#fbbc04] text-[#fbbc04] h-8 w-8" />
              ))}
            </div>
            
            <p className="text-muted-foreground font-medium mb-4">
              Based on <span className="text-foreground font-bold">15 reviews</span>
            </p>
            
            <div className="flex justify-center items-center gap-2 mb-16" aria-label="Google">
              <FcGoogle className="h-9 w-9" />
              <span className="text-3xl font-semibold tracking-tight text-foreground">Google</span>
            </div>

            {/* Reviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
              {GOOGLE_REVIEWS.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-border/50 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm ${review.color}`}>
                        {review.initial}
                      </div>
                      <div>
                        <div className="font-bold text-foreground text-sm">{review.author}</div>
                        <div className="text-muted-foreground text-xs">{review.date}</div>
                      </div>
                    </div>
                    <FcGoogle className="h-6 w-6" />
                  </div>
                  
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="fill-[#fbbc04] text-[#fbbc04] h-4 w-4" />
                    ))}
                    <div className="bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center ml-1">
                      <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    </div>
                  </div>
                  
                  <p className="text-foreground/90 leading-relaxed text-sm flex-grow">
                    {review.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-16">
              <Button asChild size="lg" className="font-semibold text-lg h-14 px-8">
                <a href="https://www.google.com/search?q=tomkyns+sealant+services" target="_blank" rel="noopener noreferrer">
                  Read all Google Reviews
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-foreground text-white py-12 border-t-4 border-primary">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-sm shadow-md">
            <img src="/logo.png" alt="Tomkyns Sealant Services" className="h-10 w-auto object-contain" />
          </div>
          <div className="text-sm text-white/50 text-center md:text-right">
            &copy; {new Date().getFullYear()} Tomkyns Sealant Services. All rights reserved. <br/>
            Based at Common Farm, Tomkyns Lane, Upminster, RM14 1TP
          </div>
        </div>
      </footer>

      {/* Mobile Sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border p-3 flex gap-3 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <Button asChild className="flex-1 h-12 font-semibold" data-testid="button-mobile-quote">
          <a href="/#quote">Get Quote</a>
        </Button>
        <Button asChild variant="secondary" className="flex-1 h-12 font-semibold bg-foreground text-white hover:bg-foreground/90" data-testid="link-mobile-call">
          <a href="tel:07596095248">Call Jon</a>
        </Button>
      </div>
    </div>
  );
}
