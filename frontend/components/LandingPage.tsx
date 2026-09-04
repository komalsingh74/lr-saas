'use client';
import React, { useState, useEffect, FC, ReactNode } from 'react';
import {
  FileText,
  ShieldCheck,
  BarChart3,
  Truck,
  Clock,
  Star,
  CheckCircle2,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  X,
  Menu,
  Download,
  Play,
  QrCode,
  Printer,
  TrendingUp,
  Stamp,
  Users,
  MapPinned,
  Timer,
  XCircle,
  ChevronDown,
  Building2,
  MessageCircle,
} from 'lucide-react';

import Link from "next/link";

// ==================== Type Definitions ====================

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

interface StepCardProps {
  number: string;
  title: string;
  description: string;
  icon: ReactNode;
}

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  isFeatured: boolean;
}

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  rating: number;
  image: string;
}

interface FaqItemProps {
  question: string;
  answer: string;
}

interface NavItem {
  label: string;
  href: string;
}

// ==================== Component Definitions ====================

const FeatureCard: FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="bg-white p-7 rounded-lg border border-[#E4DCC8] hover:border-[#1C6B4A]/40 transition-colors duration-300">
    <div className="w-11 h-11 rounded-full border-2 border-[#152238] flex items-center justify-center mb-5 text-[#152238]">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-[#152238] mb-2 tracking-tight">{title}</h3>
    <p className="text-[#5B6472] text-sm leading-relaxed">{description}</p>
  </div>
);

const StepCard: FC<StepCardProps> = ({ number, title, description, icon }) => (
  <div className="text-center relative z-10 animate-on-scroll opacity-0 translate-y-10 transition-all duration-700">
    <div className="w-16 h-16 bg-[#F6F1E4] border-2 border-[#152238] text-[#152238] rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-black">
      {number}
    </div>
    <div className="bg-white p-6 rounded-lg border border-[#E4DCC8]">
      <div className="w-11 h-11 bg-[#1C6B4A]/10 rounded-full flex items-center justify-center mx-auto mb-3 text-[#1C6B4A]">
        {icon}
      </div>
      <h3 className="text-base font-bold text-[#152238] mb-2">{title}</h3>
      <p className="text-sm text-[#5B6472]">{description}</p>
    </div>
  </div>
);

const PricingCard: FC<PricingCardProps> = ({ title, price, description, features, buttonText, isFeatured }) => (
  <div className={`relative p-8 rounded-lg bg-white transition-all duration-300 ${isFeatured
    ? 'border-2 border-[#1C6B4A]'
    : 'border border-[#E4DCC8]'
    }`}
    style={{
      backgroundImage: isFeatured
        ? 'none'
        : undefined,
    }}
  >
    {isFeatured && (
      <div className="absolute -top-3 left-8 bg-[#1C6B4A] text-white px-3 py-1 rounded text-[11px] font-bold tracking-wide uppercase">
        Zyada Popular
      </div>
    )}
    <h3 className="text-xl font-black text-[#152238] tracking-tight">{title}</h3>
    <p className="text-[#5B6472] text-sm mt-1 mb-6">{description}</p>
    <div className="mb-6 pb-6 border-b border-dashed border-[#E4DCC8]">
      <span className="text-4xl font-black text-[#152238] tracking-tight">{price}</span>
      <span className="text-sm font-semibold text-[#5B6472]"> /month</span>
    </div>
    <ul className="space-y-3 mb-8 text-[#152238] text-sm">
      {features.map((feature: string) => (
        <li key={feature} className="flex items-center gap-2.5">
          <CheckCircle2 size={17} className="text-[#1C6B4A] flex-shrink-0" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <button className={`w-full py-3.5 rounded-md text-sm font-bold transition-colors ${isFeatured
      ? 'bg-[#152238] text-white hover:bg-[#1C6B4A]'
      : 'bg-[#F6F1E4] text-[#152238] hover:bg-[#EDE5D0]'
      }`}>
      {buttonText}
    </button>
  </div>
);

const TestimonialCard: FC<TestimonialCardProps> = ({ name, role, content, rating, image }) => (
  <div className="bg-white p-6 rounded-lg border border-[#E4DCC8] relative">
    <span className="absolute top-4 right-5 text-4xl font-black text-[#1C6B4A]/15 leading-none select-none">&rdquo;</span>
    <div className="flex items-center gap-3 mb-4">
      <img src={image} alt={name} className="w-11 h-11 rounded-full object-cover border border-[#E4DCC8]" />
      <div>
        <h4 className="font-bold text-[#152238] text-sm">{name}</h4>
        <p className="text-xs text-[#5B6472]">{role}</p>
      </div>
    </div>
    <div className="flex gap-0.5 mb-3">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} size={13} fill="#D98324" className="text-[#D98324]" />
      ))}
    </div>
    <p className="text-[#152238]/80 text-sm leading-relaxed">{content}</p>
  </div>
);

const FaqAccordionItem: FC<FaqItemProps & { isOpen: boolean; onToggle: () => void }> = ({ question, answer, isOpen, onToggle }) => (
  <div className="border-b border-[#E4DCC8] py-5">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-4 text-left"
    >
      <span className="text-base font-bold text-[#152238]">{question}</span>
      <ChevronDown
        size={18}
        className={`flex-shrink-0 text-[#5B6472] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>
    <div className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'}`}>
      <div className="overflow-hidden">
        <p className="text-sm text-[#5B6472] leading-relaxed pr-8">{answer}</p>
      </div>
    </div>
  </div>
);

const ShareIcon: FC<{ size?: number }> = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);

// ==================== Main Landing Page Component ====================

const LandingPage: FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const handleScroll = (): void => {
      const sections = document.querySelectorAll('.animate-on-scroll');
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight - 100;
        if (isVisible) {
          section.classList.add('opacity-100', 'translate-y-0');
          section.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string): void => {
    e.preventDefault();
    setIsMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navItems: NavItem[] = [
    { label: 'Features', href: '#features' },
    { label: 'Solutions', href: '#solutions' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Support', href: '#support' },
  ];

  const trustedCompanies: string[] = ['Transport Co.', 'Freight India', 'Speed Cargo', 'LogiX', 'TransFast', 'MoveEasy'];

  const features: FeatureCardProps[] = [
    {
      icon: <Clock size={20} />,
      title: "Save Hours Every Day",
      description: "Instantly generate digital LRs. No more handwriting, calculations, or searching through old books.",
    },
    {
      icon: <ShieldCheck size={20} />,
      title: "Secure Digital Records",
      description: "Your data is safely stored on the cloud. Generate PDFs, share on WhatsApp, and never lose a record again.",
    },
    {
      icon: <BarChart3 size={20} />,
      title: "Real-time Analytics",
      description: "Track revenue, pending payments, and shipment status from a single professional dashboard.",
    },
    {
      icon: <QrCode size={20} />,
      title: "QR Code Integration",
      description: "Generate QR codes for each LR for instant tracking and verification.",
    },
    {
      icon: <Printer size={20} />,
      title: "Print & Share Anywhere",
      description: "One-click print or share LRs via WhatsApp, email, or SMS.",
    },
    {
      icon: <TrendingUp size={20} />,
      title: "Business Growth Insights",
      description: "Analytics that help you understand your business performance and growth opportunities.",
    }
  ];

  const steps: StepCardProps[] = [
    {
      number: "01",
      title: "Create LR",
      description: "Fill in shipment details - consignor, consignee, goods, freight charges",
      icon: <FileText size={22} />
    },
    {
      number: "02",
      title: "Generate Digital LR",
      description: "System generates professional PDF with unique LR number and QR code",
      icon: <Download size={22} />
    },
    {
      number: "03",
      title: "Share & Track",
      description: "Share instantly via WhatsApp or print. Track status",
      icon: <ShareIcon size={22} />
    }
  ];

  const starterPlan: PricingCardProps = {
    title: "Starter Fleet",
    price: "₹499",
    description: "Perfect for small operators managing 1-5 trucks",
    features: ['Up to 100 LRs/Month', 'WhatsApp Sharing', 'Basic Reports', 'Email Support', '7-day history'],
    buttonText: "Start Free Trial",
    isFeatured: false
  };

  const proPlan: PricingCardProps = {
    title: "Pro Transporter",
    price: "₹999",
    description: "For growing logistics businesses with larger fleets",
    features: ['Unlimited LRs', 'WhatsApp & SMS Alerts', 'Multi-user Access (Up to 5)', 'Priority Support', '30-day history', 'Advanced Analytics'],
    buttonText: "Get Pro Now",
    isFeatured: true
  };

  const stats: { icon: ReactNode; value: string; label: string }[] = [
    { icon: <FileText size={20} />, value: "12,000+", label: "LRs Generated" },
    { icon: <Users size={20} />, value: "500+", label: "Transporters Onboard" },
    { icon: <MapPinned size={20} />, value: "18", label: "Cities Covered" },
    { icon: <Timer size={20} />, value: "96 sec", label: "Avg. LR Generation" },
  ];

  const oldWayPoints: string[] = [
    "Register mein haath se likhna, ghante barbaad",
    "Carbon copy fatt jaaye ya masla ho to record gone",
    "Purana LR dhoondna matlab poora register palatna",
    "WhatsApp pe bhejne ke liye pehle scan karna padta hai",
    "Calculation galti se freight amount galat ho jaata hai",
  ];

  const newWayPoints: string[] = [
    "Form bharo, LR 2 minute mein taiyaar",
    "Cloud pe safe — kabhi gum nahi hoga",
    "Kisi bhi purane LR ko search se turant nikaalo",
    "Ek tap mein seedha WhatsApp pe PDF share karo",
    "Auto-calculation, koi galti ki gunjaish nahi",
  ];

  const faqs: FaqItemProps[] = [
    {
      question: "Kya mera data safe rahega?",
      answer: "Haan, aapka pura data encrypted cloud storage mein rehta hai. Sirf aap aur aapki team hi access kar sakte hain, aur regular backups liye jaate hain.",
    },
    {
      question: "Kya main purane register ka data import kar sakta hoon?",
      answer: "Haan, onboarding ke time hum aapke purane records ko digitize karne mein madad karte hain, taaki aap zero se shuru na karo.",
    },
    {
      question: "LR WhatsApp pe kaise share hota hai?",
      answer: "LR generate hote hi ek click mein PDF ban jaata hai, jise aap seedha WhatsApp, email ya SMS se consignor/consignee ko bhej sakte ho.",
    },
    {
      question: "Kya multiple staff members ek saath use kar sakte hain?",
      answer: "Pro Transporter plan mein up to 5 users ko alag-alag logins mil sakte hain, taaki aapki poori team ek saath kaam kar sake.",
    },
    {
      question: "Agar internet na ho to?",
      answer: "Aap offline bhi LR draft kar sakte ho — jaise hi connection wapas aata hai, woh apne aap sync ho jaata hai.",
    },
  ];

  const testimonials: TestimonialCardProps[] = [
    {
      name: "Rajesh Gupta",
      role: "Owner, Gupta Transport",
      content: "SinghLogistics has completely transformed how we manage our LRs. No more lost paperwork and instant sharing with clients!",
      rating: 5,
      image: "https://i.pravatar.cc/100?img=1"
    },
    {
      name: "Priya Sharma",
      role: "Operations Manager, FastTrack Cargo",
      content: "The analytics feature is a game-changer. We can now track pending payments and shipment status in real-time.",
      rating: 5,
      image: "https://i.pravatar.cc/100?img=2"
    },
    {
      name: "Amit Patel",
      role: "Fleet Owner, Patel Logistics",
      content: "Customer support is excellent. They helped us onboard our entire team within a day. Highly recommended!",
      rating: 5,
      image: "https://i.pravatar.cc/100?img=3"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F6F1E4] text-[#152238] font-sans scroll-smooth">

      {/* 1. Navbar */}
      <nav className="bg-[#F6F1E4]/95 backdrop-blur-md sticky top-0 z-50 border-b border-[#E4DCC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
  <div className="">
    <img
      src="/logo2.png"
      alt="Singh Logistics Logo"
      className="w-30 h-20 object-contain"
    />
  </div>

  {/* <div>
    <span className="text-xl font-black tracking-tight">
      Shree<span className="text-[#1C6B4A]">Logistics</span>
    </span>
    <p className="text-[10px] font-bold text-[#5B6472] tracking-wide uppercase -mt-0.5">
      LR Management · Agra
    </p>
  </div> */}
</div>
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item: NavItem) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="text-sm font-semibold text-[#152238]/70 hover:text-[#1C6B4A] transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link href="/login" className="hidden sm:block text-sm font-semibold text-[#152238]/70 hover:text-[#1C6B4A] transition">
                Log In
              </Link>
              <Link href="/register" className="bg-[#1C6B4A] text-white px-5 py-2.5 rounded-md text-sm font-bold hover:bg-[#154F37] transition-colors">
                Register For Demo
              </Link>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 hover:bg-[#EDE5D0] rounded-md transition"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-[#F6F1E4] border-t border-[#E4DCC8]">
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item: NavItem) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="block py-2 text-[#152238]/70 hover:text-[#1C6B4A]"
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-3 border-t border-[#E4DCC8]">
                <a href="#" className="block py-2 text-[#152238]/70 hover:text-[#1C6B4A]">Log In</a>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* 2. Hero Section */}
      <header className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid lg:grid-cols-2 gap-14 items-center">

            {/* Hero Text */}
            <div className="space-y-7 animate-on-scroll opacity-0 translate-y-10 transition-all duration-700">
              <div className="inline-flex items-center gap-2 bg-white text-[#1C6B4A] px-4 py-1.5 rounded-full text-xs font-bold border border-[#1C6B4A]/30">
                <MapPin size={13} />
                Modernizing Agra&rsquo;s Logistics Industry
              </div>

              <h1 className="text-4xl md:text-[52px] font-black leading-[1.08] tracking-tight text-[#152238]">
                LR banana ab hua
                <span className="block text-[#1C6B4A]">2 minute ka kaam.</span>
              </h1>

              <p className="text-base text-[#152238]/80 max-w-lg leading-relaxed">
                Register, carbon copy aur calculator ki tension khatam. LR banao, PDF download karo,
                seedha WhatsApp pe bhejo — sab kuch instantly. Built for the modern Indian transporter,
                from Agra&rsquo;s transport nagar to the whole GT Road corridor.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                <Link href="/register" className="w-full sm:w-auto bg-[#1C6B4A] text-white px-8 py-3.5 rounded-md text-base font-bold hover:bg-[#154F37] transition-colors flex items-center justify-center gap-2">
                  Get Started for Free
                  <ArrowRight size={17} />
                </Link>
                {/* <button className="w-full sm:w-auto bg-white border border-[#152238]/20 text-[#152238] px-7 py-3.5 rounded-md text-base font-bold hover:border-[#152238]/40 transition-colors flex items-center justify-center gap-2">
                  <Play size={16} />
                  Watch Demo
                </button> */}
              </div>
            </div>

            {/* Hero Visual - facsimile Lorry Receipt */}
            <div className="relative animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-200">
              <div className="relative bg-white rounded-md shadow-[0_4px_0_#E4DCC8] border border-[#E4DCC8] overflow-hidden rotate-1">
                {/* perforated top edge */}
                <div className="h-3 w-full bg-[repeating-linear-gradient(to_right,#F6F1E4_0,#F6F1E4_8px,transparent_8px,transparent_16px)] bg-[#152238]" />

                <div className="p-6">
                  <div className="flex items-start justify-between border-b border-dashed border-[#E4DCC8] pb-4 mb-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#5B6472] font-bold">Lorry Receipt</p>
                      <p className="font-mono text-sm font-bold text-[#152238]">LR-AGR-04821</p>
                    </div>
                    <div className="text-right">
                      <QrCode size={36} className="text-[#152238]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                    <div>
                      <p className="text-[#5B6472] font-semibold mb-0.5">Consignor</p>
                      <p className="text-[#152238] font-bold">Agra Iron Traders</p>
                    </div>
                    <div>
                      <p className="text-[#5B6472] font-semibold mb-0.5">Consignee</p>
                      <p className="text-[#152238] font-bold">Kanpur Steel Co.</p>
                    </div>
                    <div>
                      <p className="text-[#5B6472] font-semibold mb-0.5">Vehicle No.</p>
                      <p className="text-[#152238] font-bold">UP 80 GT 4521</p>
                    </div>
                    <div>
                      <p className="text-[#5B6472] font-semibold mb-0.5">Freight</p>
                      <p className="text-[#152238] font-bold">₹ 18,500</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-dashed border-[#E4DCC8] pt-4">
                    <span className="text-[10px] text-[#5B6472]">Generated via SinghLogistics</span>
                    <div className="flex items-center gap-1 text-[#1C6B4A] rotate-[-8deg] border-2 border-[#1C6B4A] rounded-full px-3 py-1">
                      <Stamp size={13} />
                      <span className="text-[11px] font-black tracking-wide">VERIFIED</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-[#152238] text-white text-xs font-bold px-4 py-2 rounded-md">
                Generated in 96 seconds
              </div>
            </div>
          </div>
        </div>
      </header>

        <section className="py-10 border-y border-[#E4DCC8] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold text-[#5B6472] uppercase tracking-[0.2em] mb-7">
            Shuru karo sirf 2 step mein
          </p>
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-4 bg-[#F6F1E4] rounded-lg border border-[#E4DCC8] p-5">
              <div className="w-11 h-11 rounded-full bg-[#152238] flex items-center justify-center flex-shrink-0">
                <Building2 className="text-white" size={19} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#5B6472] mb-0.5">Step 1</p>
                <p className="text-sm font-bold text-[#152238]">Apni company create karo</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-[#F6F1E4] rounded-lg border border-[#E4DCC8] p-5">
              <div className="w-11 h-11 rounded-full bg-[#1C6B4A] flex items-center justify-center flex-shrink-0">
                <FileText className="text-white" size={19} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#5B6472] mb-0.5">Step 2</p>
                <p className="text-sm font-bold text-[#152238]">Pehla LR generate karo</p>
              </div>
            </div>
          </div>
          <div className="text-center mt-7">
            <Link href="/register" className="bg-[#152238] text-white px-7 py-3 rounded-md text-sm font-bold hover:bg-[#1C6B4A] transition-colors inline-flex items-center gap-2">
              Company Create Karo
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* 3b. Stats Strip */}
      {/* <section className="bg-[#152238] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center text-center px-4">
                <div className="text-[#D98324] mb-2">{stat.icon}</div>
                <p className="text-2xl md:text-3xl font-black text-white tracking-tight">{stat.value}</p>
                <p className="text-xs text-white/60 font-semibold mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* 4. Features Section */}
      <section id="features" className="py-16 bg-[#F6F1E4] scroll-mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-10 transition-all duration-700">
            <div className="inline-flex items-center gap-2 bg-white text-[#1C6B4A] px-4 py-1.5 rounded-full text-xs font-bold border border-[#1C6B4A]/30 mb-4">
              Why Transporters Love Us
            </div>
            <h2 className="text-3xl md:text-[44px] font-black tracking-tight text-[#152238] mb-4">
              Everything you need to streamline operations
            </h2>
            <p className="text-base text-[#152238]/70 max-w-2xl mx-auto">
              Say goodbye to manual LR books and missing records. Complete digital transformation for your logistics business.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature: FeatureCardProps, index: number) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* 4b. Old Way vs New Way Comparison */}
      <section className="py-16 bg-white border-y border-[#E4DCC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-[44px] font-black tracking-tight text-[#152238] mb-4">
              Purana register vs Digital LR
            </h2>
            <p className="text-base text-[#152238]/70 max-w-2xl mx-auto">
              Ek nazar mein dekho ki kaagaz ka register chodne se aapko kya milta hai
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Old way */}
            <div className="bg-[#F6F1E4] rounded-lg border border-[#E4DCC8] p-7">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#5B6472]">Purani Tareeka</span>
              </div>
              <ul className="space-y-4">
                {oldWayPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <XCircle size={18} className="text-[#B23A2F] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#152238]/80">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* New way */}
            <div className="bg-[#152238] rounded-lg p-7 relative">
              <div className="absolute -top-3 right-7 bg-[#1C6B4A] text-white px-3 py-1 rounded text-[11px] font-bold tracking-wide uppercase">
                SinghLogistics
              </div>
              <div className="flex items-center gap-2 mb-5">
                <span className="text-[10px] uppercase tracking-widest font-bold text-white/50">Nayi Tareeka</span>
              </div>
              <ul className="space-y-4">
                {newWayPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-[#3E9E77] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-white/85">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section id="solutions" className="py-16 bg-white border-y border-[#E4DCC8] scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-10 transition-all duration-700">
            <h2 className="text-3xl md:text-[44px] font-black tracking-tight text-[#152238] mb-4">
              How SinghLogistics works
            </h2>
            <p className="text-base text-[#152238]/70 max-w-2xl mx-auto">
              Teen simple steps mein apna LR management digitize karo
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-0.5 bg-[repeating-linear-gradient(to_right,#D98324_0,#D98324_10px,transparent_10px,transparent_18px)]" />
            {steps.map((step: StepCardProps, index: number) => (
              <StepCard key={index} {...step} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. Pricing Section */}
      <section id="pricing" className="py-16 bg-[#F6F1E4] scroll-mt-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-on-scroll opacity-0 translate-y-10 transition-all duration-700">
            <h2 className="text-3xl md:text-[44px] font-black tracking-tight text-[#152238] mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-base text-[#152238]/70 max-w-2xl mx-auto">
              Choose a plan that scales with your fleet size. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <PricingCard {...starterPlan} />
            <PricingCard {...proPlan} />
          </div>

          <div className="text-center mt-10">
            <p className="text-sm text-[#5B6472]">
              * Enterprise plans available for large fleets. <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className="text-[#1C6B4A] font-bold hover:underline">Contact sales</a>
            </p>
          </div>
        </div>
      </section>

      {/* 7. Testimonials Section */}
      {/* <section className="py-24 bg-white border-y border-[#E4DCC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#D98324]/10 text-[#B96A16] px-4 py-1.5 rounded-full text-xs font-bold mb-4">
              <Star size={13} fill="currentColor" />
              Trusted by 500+ Transporters
            </div>
            <h2 className="text-3xl md:text-[44px] font-black tracking-tight text-[#152238] mb-4">
              What our clients say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial: TestimonialCardProps, index: number) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section> */}

      {/* 7b. FAQ Section */}
      <section id="support" className="py-12 pt-3 bg-[#F6F1E4] scroll-mt-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-[44px] font-black tracking-tight text-[#152238] mb-4">
              Common sawaal
            </h2>
            <p className="text-base text-[#152238]/70">
              Aur kuch puchna hai? WhatsApp pe seedha message karo.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-[#E4DCC8] px-6">
            {faqs.map((faq, i) => (
              <FaqAccordionItem
                key={i}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 7c. Contact Section */}
   <section id="contact" className="py-24 bg-white border-y border-[#E4DCC8] scroll-mt-24">
  <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-14">
      <div className="inline-flex items-center gap-2 bg-[#F6F1E4] text-[#1C6B4A] px-4 py-1.5 rounded-full text-xs font-bold border border-[#1C6B4A]/30 mb-4">
        Sampark Karein
      </div>
      <h2 className="text-3xl md:text-[44px] font-black tracking-tight text-[#152238] mb-4">
        Hume contact karo
      </h2>
      <p className="text-base text-[#152238]/70 max-w-2xl mx-auto">
        Koi sawaal ho ya demo chahiye ho, seedha call ya email karo — hum jald reply karenge.
      </p>
    </div>

    {/* --- Grid ko 3 columns kar diya hai (Phone, WhatsApp, Email) --- */}
    <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      
      {/* 1. Phone */}
      {/* <a
        href="tel:+917453873443"
        className="flex items-center gap-4 bg-[#F6F1E4] rounded-lg border border-[#E4DCC8] p-6 hover:border-[#1C6B4A]/40 transition-colors"
      >
        <div className="w-12 h-12 rounded-full bg-[#152238] flex items-center justify-center flex-shrink-0">
          <Phone className="text-white" size={19} />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#5B6472] mb-0.5">Call Us</p>
          <p className="text-base font-bold text-[#152238]">+91 74538 73443</p>
        </div>
      </a> */}

      {/* 2. WhatsApp (NEW) */}
      <a
        href="https://wa.me/917900826210" 
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 bg-[#F6F1E4] rounded-lg border border-[#E4DCC8] p-6 hover:border-[#25D366]/40 transition-colors"
      >
        <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
          <MessageCircle className="text-white" size={19} />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#5B6472] mb-0.5">WhatsApp</p>
          <p className="text-base font-bold text-[#152238]">+91 79008 26210</p>
        </div>
      </a>

      {/* 3. Email */}
      <a
        href="mailto:ks23732003@gmail.com"
        className="flex items-center gap-4 bg-[#F6F1E4] rounded-lg border border-[#E4DCC8] p-6 hover:border-[#1C6B4A]/40 transition-colors"
      >
        <div className="w-12 h-12 rounded-full bg-[#1C6B4A] flex items-center justify-center flex-shrink-0">
          <Mail className="text-white" size={19} />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#5B6472] mb-0.5">Email Us</p>
          <p className="text-base font-bold text-[#152238] break-all">ks23732003@gmail.com</p>
        </div>
      </a>
    </div>

    <div className="text-center mt-10">
      <div className="inline-flex items-center gap-2 text-sm text-[#5B6472]">
        <MapPin size={15} />
        <span>Agra, Uttar Pradesh, India</span>
      </div>
    </div>
  </div>
</section>

      {/* 8. CTA Section */}
      <section className="relative overflow-hidden bg-[#152238]">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 border-2 border-[#D98324] text-[#D98324] rounded-full px-4 py-1.5 mb-6 rotate-[-2deg]">
            <Stamp size={14} />
            <span className="text-xs font-black tracking-wide">AGRA TRUSTED</span>
          </div>
          <h2 className="text-3xl md:text-[44px] font-black text-white mb-5 leading-tight">
            Ready to digitize your logistics business?
          </h2>
          <p className="text-base text-white/70 mb-9 max-w-xl mx-auto">
            Forward-thinking transporters who have already simplified their LR management.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="bg-white text-[#152238] px-8 py-4 rounded-md text-base font-bold hover:bg-[#F6F1E4] transition-colors flex items-center gap-2">
              Create Your First LR Free
              <ArrowRight size={17} />
            </Link>
            <Link href="/register" className="bg-transparent text-white px-8 py-4 rounded-md text-base font-bold border border-white/30 hover:bg-white/10 transition-colors">
              Register For Demo
            </Link>
          </div>
          <p className="text-white/50 text-xs mt-6">No credit card required • 14-day free trial</p>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="bg-[#0F1A2C] text-[#8B93A3] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2 ">
                 <img
      src="/logo2.png"
      alt="Singh Logistics Logo"
      className="w-30 h-20 object-contain bg-yellow-50 rounded-md p-1"
    />
              </div>
              <p className="text-sm text-[#8B93A3] mb-4">
                Modernizing Indian logistics with digital LR management solutions, built in Agra.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" onClick={(e) => handleNavClick(e, '#features')} className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" onClick={(e) => handleNavClick(e, '#pricing')} className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Press</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Mail size={14} />
                  <span>ks23732003@gmail.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={14} />
                  <span>+91 74538 73443</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin size={14} />
                  <span>Agra, Uttar Pradesh, India</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center text-sm">
            <p>© 2026 singhWebTech. All rights reserved. Made in Agra, India.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;