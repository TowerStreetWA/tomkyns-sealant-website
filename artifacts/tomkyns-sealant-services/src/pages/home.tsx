import { useState, useRef } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Phone, Mail, MapPin, Clock, ShieldCheck, 
  CheckCircle2, ChevronRight, MessageSquareQuote, Plus, Minus, Star
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useCreateEnquiry } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import SocialLinks from "@/components/social-links";

// -- Data --
const SERVICES = [
  {
    title: "Domestic Sealant",
    desc: "Bathrooms, kitchens, showers and wet rooms finished with clean, precise sealant lines.",
    image: "/service-images/domestic-sealant.jpg",
  },
  {
    title: "Commercial Projects",
    desc: "Mastic application for new builds, offices, retail spaces and other commercial settings.",
    image: "/service-images/commercial-projects.jpg",
  },
  {
    title: "Exterior & Concrete",
    desc: "Sealant work for driveways, pavements, concrete joints, windows and doors.",
    image: "/service-images/exterior-concrete.jpg",
  },
  {
    title: "Cut-Out & Reseal",
    desc: "Careful removal of old, failing sealant followed by a clean replacement finish.",
    image: "/service-images/cut-out-reseal.jpg",
  },
  {
    title: "Colour Matching",
    desc: "Sealant colours selected to complement surrounding tiles, grout and building materials.",
    image: "/service-images/colour-matching.jpg",
  },
];

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
];

const FAQS = [
  { q: "What is mastic sealant?", a: "Mastic is a high-grade, flexible sealant used to waterproof joints, prevent drafts, and provide a neat finish between different surfaces like tiles, glass, and masonry." },
  { q: "How long does sealant last?", a: "Generally, high-quality sealant lasts between 5 to 10 years depending on the type of material, the environment (like high moisture in wet rooms), and general wear and tear." },
  { q: "When should I hire a professional?", a: "If your current sealant is peeling, discoloured or showing signs of mould, it may be time for a reseal. Professional preparation and application can help produce a cleaner, longer-lasting finish." },
  { q: "How do you price your work?", a: "Pricing depends on the scope of the project, materials required, and location. We provide honest, upfront quotes with no hidden fees and never recommend unnecessary work." },
  { q: "Is the work disruptive?", a: "Not at all. Disruption is kept to an absolute minimum. We work cleanly, efficiently, and leave your space immaculate." },
  { q: "How should I prepare the area?", a: "Jon will confirm any preparation needed for your project. Keeping the area clear and accessible helps the work begin promptly." },
  { q: "Do you work outside your listed areas?", a: "We cover a wide area across London, Essex, Kent, and Surrey. If you are further out, please contact us and we will see if we can accommodate your project." },
];

// -- Form Schema --
const quoteSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(5, "Phone number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  postcode: z.string().min(2, "Postcode is required"),
  details: z.string().min(10, "Please provide some details about your project"),
});

export default function HomePage() {
  const { toast } = useToast();
  const quoteRef = useRef<HTMLDivElement>(null);
  const createEnquiry = useCreateEnquiry();
  const assetBase = import.meta.env.BASE_URL;

  const form = useForm<z.infer<typeof quoteSchema>>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      postcode: "",
      details: "",
    },
  });

  const onSubmit = (data: z.infer<typeof quoteSchema>) => {
    createEnquiry.mutate(
      { data },
      {
        onSuccess: () => {
          toast({
            title: "Request Sent",
            description: "Thanks for reaching out! Jon will be in touch shortly.",
          });
          form.reset();
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Something went wrong. Please try calling us directly.",
          });
        },
      }
    );
  };

  const scrollToQuote = () => {
    quoteRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Top Bar */}
      <div className="bg-foreground text-white py-2 px-4 text-sm hidden md:block border-b-4 border-primary">
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
             <Link href="/" className="text-primary transition-colors">Home</Link>
             <a href="#services" onClick={(e) => {
               e.preventDefault();
               document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
             }} className="hover:text-primary transition-colors cursor-pointer">Services</a>
             <Link href="/reviews" className="hover:text-primary transition-colors">Reviews</Link>
              <Link href="/business-portal" className="hover:text-primary transition-colors">Business Portal</Link>
             <a href="#quote" onClick={(e) => {
               e.preventDefault();
               scrollToQuote();
             }} className="hover:text-primary transition-colors cursor-pointer">Contact</a>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-sm text-muted-foreground font-medium">Call Jon direct</span>
              <a href="tel:07596095248" className="text-foreground font-display font-bold text-lg hover:text-primary transition-colors">07596 095248</a>
            </div>
            <Button onClick={scrollToQuote} size="lg" className="font-semibold shadow-sm" data-testid="button-nav-quote">
              Get a Free Quote
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden bg-background">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
          <div className="max-w-6xl mx-auto px-4 relative z-10 flex flex-col xl:flex-row items-center gap-12 xl:gap-16">
            <div className="flex-1 text-center xl:text-left">
              <Badge variant="outline" className="mb-6 border-primary/20 text-primary bg-primary/5 px-3 py-1 text-sm font-medium">
                Premium Mastic Specialist
              </Badge>
              <h1 className="text-5xl md:text-6xl xl:text-7xl font-display font-bold text-foreground leading-[1.1] tracking-tight mb-6">
                High-End <span className="text-primary">Sealant Application</span> You Can Trust.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto xl:mx-0 leading-relaxed">
                Clean, precise, and reliable mastic work using quality materials. Honest advice, zero unnecessary work, and a finish that stands the test of time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center xl:justify-start">
                <Button size="lg" onClick={scrollToQuote} className="text-base h-14 px-8" data-testid="button-hero-quote">
                  Request a Quote <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 border-2 border-foreground bg-white text-base text-foreground hover:bg-foreground hover:text-white"
                >
                  <a href="tel:07596095248">Call 07596 095248</a>
                </Button>
              </div>
              
              <div className="mt-12 flex flex-wrap items-center justify-center xl:justify-start gap-x-8 gap-y-4 text-sm font-medium text-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" /> Domestic
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" /> Commercial
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" /> Free Quotes
                </div>
              </div>
            </div>
            
            <div className="flex-1 w-full max-w-3xl xl:max-w-lg relative">
              <div className="relative h-[400px] sm:h-[440px] xl:h-auto xl:aspect-[16/9] rounded-2xl bg-foreground text-white overflow-hidden flex flex-col justify-end shadow-2xl">
                <img
                  src={`${assetBase}hero-careful-mastic-fallback.jpg`}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <video
                  className="hero-motion-video absolute inset-0 h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={`${assetBase}hero-careful-mastic-fallback.jpg`}
                  aria-hidden="true"
                  tabIndex={-1}
                >
                  <source src={`${assetBase}hero-careful-mastic.mp4`} type="video/mp4" />
                </video>
                <div className="hero-panel-scrim absolute inset-0" aria-hidden="true" />
                <div className="absolute top-0 right-0 p-8 opacity-10 text-white">
                  <ShieldCheck size={200} />
                </div>
                <div className="relative z-10 p-6 sm:p-10 xl:p-8">
                  <h3 className="!text-white text-3xl sm:text-4xl xl:text-3xl font-display font-bold mb-4">Careful British Workmanship.</h3>
                  <p className="text-white/80 text-lg">
                    High-end mastic application with honest advice, careful preparation and a clean finish for every project.
                  </p>
                  <div className="mt-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center font-bold text-lg">
                      JG
                    </div>
                    <div>
                      <div className="font-bold">Jon</div>
                      <div className="text-sm text-white/60">Owner & Operator</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="py-24 bg-white border-y border-border">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Specialist Services</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Applying mastic is a craft. We deliver clean, durable finishes across domestic and commercial applications.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
              {SERVICES.map((srv, i) => (
                <article
                  key={srv.title}
                  className={`group relative min-h-[300px] overflow-hidden rounded-xl border border-white/10 bg-foreground shadow-md ${
                    i < 3 ? "lg:col-span-2" : "lg:col-span-3"
                  }`}
                >
                  <img
                    src={srv.image}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/65 to-foreground/5" />
                  <div className="relative z-10 flex min-h-[300px] flex-col justify-end p-7 text-white">
                    <h3 className="font-display text-2xl font-bold text-white">{srv.title}</h3>
                    <p className="mt-3 max-w-md leading-relaxed text-white/80">{srv.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="py-24 bg-foreground text-white relative">
          {/* Subtle accent border top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
          
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold font-display uppercase tracking-wider text-white mb-4">Excellent</h2>
            
            <div className="flex justify-center items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="fill-[#fbbc04] text-[#fbbc04] h-8 w-8" />
              ))}
            </div>
            
            <p className="text-white/70 font-medium mb-4">
              Based on <span className="text-white font-bold">15 reviews</span>
            </p>
            
            <div className="flex justify-center items-center gap-2 mb-16" aria-label="Google">
              <FcGoogle className="h-9 w-9 bg-white rounded-full p-1 shadow-sm" />
              <span className="text-3xl font-semibold tracking-tight text-white">Google</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-12">
              {GOOGLE_REVIEWS.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-xl shadow-lg border border-border/10 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
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
            
            <Button asChild size="lg" className="font-semibold text-base h-14 px-8" variant="secondary">
              <Link href="/reviews">View All Google Reviews</Link>
            </Button>
          </div>
        </section>

        {/* Two Column: Form & Info */}
        <section className="py-24 bg-background" ref={quoteRef} id="quote">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              
              {/* Left: Info */}
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Get a Free Quote</h2>
                <p className="text-lg text-muted-foreground mb-12">
                  Ready to secure a perfect finish? Fill out the form with some details about your project, and Jon will get back to you promptly to discuss pricing and scheduling.
                </p>

                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="mt-1 bg-primary/10 p-3 rounded-full text-primary shrink-0 h-12 w-12 flex items-center justify-center">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Areas Covered</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        Upminster, Hornchurch, Romford, Rainham, Brentwood, Basildon, Grays, Southend, East London, Havering, Redbridge, Barking, Dartford, Sevenoaks, Maidstone, Guildford, Woking, Reigate.
                        <br/><span className="text-sm font-medium text-foreground mt-2 block">Wider London, Essex, Kent & Surrey.</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="mt-1 bg-primary/10 p-3 rounded-full text-primary shrink-0 h-12 w-12 flex items-center justify-center">
                      <Clock size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Operating Hours</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        Monday - Friday: 08:00 - 17:00<br/>
                        Weekends: Closed
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="mt-1 bg-primary/10 p-3 rounded-full text-primary shrink-0 h-12 w-12 flex items-center justify-center">
                      <Phone size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Contact Jon</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        <a href="tel:07596095248" className="hover:text-primary font-medium block">07596 095248</a>
                        <a href="mailto:jongildea@tomkynssealant.co.uk" className="hover:text-primary font-medium block">jongildea@tomkynssealant.co.uk</a>
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">Common Farm, Tomkyns Lane, Upminster, RM14 1TP</p>
                       <div className="mt-5">
                         <SocialLinks />
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Form */}
              <div className="bg-white p-8 rounded-2xl border border-border shadow-lg">
                <h3 className="font-display text-2xl font-bold mb-6">Request Callback</h3>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} data-testid="input-enquiry-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="07123 456789" {...field} data-testid="input-enquiry-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="john@example.com" type="email" {...field} data-testid="input-enquiry-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="postcode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Postcode</FormLabel>
                          <FormControl>
                            <Input placeholder="RM14 1TP" {...field} data-testid="input-enquiry-postcode" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="details"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Details</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="E.g. I need my en-suite bathroom resealed..." 
                              className="min-h-[120px] resize-none" 
                              {...field} 
                              data-testid="textarea-enquiry-details"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-lg mt-2" 
                      disabled={createEnquiry.isPending}
                      data-testid="button-submit-enquiry"
                    >
                      {createEnquiry.isPending ? "Sending..." : "Send Request"}
                    </Button>
                  </form>
                </Form>
              </div>

            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-24 bg-white border-t border-border">
          <div className="max-w-3xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Common Questions</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((faq, i) => (
                <AccordionItem value={`item-${i}`} key={i}>
                  <AccordionTrigger className="text-left font-semibold text-lg">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-foreground text-white py-12 border-t-4 border-primary">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-sm shadow-md">
            <img src="/logo.png" alt="Tomkyns Sealant Services" className="h-10 w-auto object-contain" />
          </div>
           <SocialLinks dark />
          <div className="text-sm text-white/50 text-center md:text-right">
            &copy; {new Date().getFullYear()} Tomkyns Sealant Services. All rights reserved. <br/>
            Based at Common Farm, Tomkyns Lane, Upminster, RM14 1TP
          </div>
        </div>
      </footer>

      {/* Mobile Sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border p-3 flex gap-3 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <Button onClick={scrollToQuote} className="flex-1 h-12 font-semibold" data-testid="button-mobile-quote">
          Get Quote
        </Button>
        <Button asChild variant="secondary" className="flex-1 h-12 font-semibold bg-foreground text-white hover:bg-foreground/90" data-testid="link-mobile-call">
          <a href="tel:07596095248">Call Jon</a>
        </Button>
      </div>
    </div>
  );
}
