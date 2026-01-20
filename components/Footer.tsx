import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-zinc-900 pt-16 pb-8 border-t border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] bg-clip-text text-transparent">
                CarePlus
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed dark:text-gray-400">
              Providing accessible, high-quality healthcare services to everyone. Book appointments, consult online, and manage your health journey with ease.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"><Linkedin size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-500 hover:text-[var(--color-primary)] text-sm dark:text-gray-400">About Us</Link></li>
              <li><Link href="/doctors" className="text-gray-500 hover:text-[var(--color-primary)] text-sm dark:text-gray-400">Find a Doctor</Link></li>
              <li><Link href="/services" className="text-gray-500 hover:text-[var(--color-primary)] text-sm dark:text-gray-400">Services</Link></li>
              <li><Link href="/blog" className="text-gray-500 hover:text-[var(--color-primary)] text-sm dark:text-gray-400">Health Blog</Link></li>
              <li><Link href="/contact" className="text-gray-500 hover:text-[var(--color-primary)] text-sm dark:text-gray-400">Contact</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Our Services</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-gray-500 hover:text-[var(--color-primary)] text-sm dark:text-gray-400">General Consultation</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-[var(--color-primary)] text-sm dark:text-gray-400">Pediatrics</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-[var(--color-primary)] text-sm dark:text-gray-400">Dermatology</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-[var(--color-primary)] text-sm dark:text-gray-400">Cardiology</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-[var(--color-primary)] text-sm dark:text-gray-400">Psychiatry</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="text-[var(--color-primary)] shrink-0" size={18} />
                <span className="text-gray-500 text-sm dark:text-gray-400">123 Health Street, Medical District, NY 10001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-[var(--color-primary)] shrink-0" size={18} />
                <span className="text-gray-500 text-sm dark:text-gray-400">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-[var(--color-primary)] shrink-0" size={18} />
                <span className="text-gray-500 text-sm dark:text-gray-400">support@careplus.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm text-center md:text-left">
            © 2024 CarePlus. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-gray-400 hover:text-gray-600 text-sm">Privacy Policy</Link>
            <Link href="/terms" className="text-gray-400 hover:text-gray-600 text-sm">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
