'use client';

import { motion } from 'framer-motion';
import { Mail, Github, Twitter, Linkedin, Send } from 'lucide-react';
import { GlitchText } from '@/components/ui/imperium';
import { BrutalCard } from '@/components/navigation/BrutalBackground';
import { useState } from 'react';

export default function ContactPage() {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    await new Promise(r => setTimeout(r, 1500));
    setFormState('success');
    setTimeout(() => setFormState('idle'), 3000);
  };

  return (
    <div className="w-full max-w-4/5 mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12">
        <div className="inline-block border-2 border-imperium-gold bg-imperium-black-raise px-6 py-4 relative">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-imperium-gold shadow-[0_0_10px_rgba(212,175,55,0.6)]" />
          <h1 className="font-display text-4xl md:text-5xl uppercase tracking-widest text-imperium-gold">
            <GlitchText>Contact</GlitchText>
          </h1>
          <p className="font-terminal text-imperium-steel mt-2">
            {'>'} Transmission terminal // Establish connection
          </p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Contact Form */}
        <BrutalCard hovered className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-terminal text-xs text-imperium-gold block mb-2">
                {'>'} NAME
              </label>
              <input
                type="text"
                required
                placeholder="Enter your designation"
                className="w-full bg-imperium-black border border-imperium-steel-dark px-3 py-2 font-terminal text-imperium-bone placeholder:text-imperium-steel-dark focus:border-imperium-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="font-terminal text-xs text-imperium-gold block mb-2">
                {'>'} EMAIL
              </label>
              <input
                type="email"
                required
                placeholder="your@email.com"
                className="w-full bg-imperium-black border border-imperium-steel-dark px-3 py-2 font-terminal text-imperium-bone placeholder:text-imperium-steel-dark focus:border-imperium-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="font-terminal text-xs text-imperium-gold block mb-2">
                {'>'} MESSAGE
              </label>
              <textarea
                required
                rows={6}
                placeholder="Your transmission..."
                className="w-full bg-imperium-black border border-imperium-steel-dark px-3 py-2 font-terminal text-imperium-bone placeholder:text-imperium-steel-dark focus:border-imperium-gold focus:outline-none resize-none"
              />
            </div>

            <motion.button
              type="submit"
              disabled={formState !== 'idle'}
              className="w-full border-2 border-imperium-gold bg-imperium-gold/20 text-imperium-gold font-terminal px-4 py-3 uppercase hover:bg-imperium-gold/40 hover:text-imperium-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {formState === 'idle' && (
                <>
                  <Send className="h-4 w-4" />
                  {'>'} Transmit
                </>
              )}
              {formState === 'submitting' && (
                <>
                  <div className="w-4 h-4 border-2 border-imperium-gold border-t-transparent animate-spin" />
                  Sending...
                </>
              )}
              {formState === 'success' && (
                <>
                  <span className="text-imperium-black">✓</span>
                  Transmitted
                </>
              )}
            </motion.button>
          </form>
        </BrutalCard>

        {/* Contact Info */}
        <div className="space-y-6">
          {/* Email */}
          <BrutalCard hovered className="p-6 group">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-imperium-gold/20 border border-imperium-gold text-imperium-gold">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-sm uppercase tracking-wider text-imperium-gold">Email</h3>
                <p className="font-terminal text-xs text-imperium-steel">Direct channel</p>
              </div>
            </div>
            <a href="mailto:contact@oalacea.com" className="font-terminal text-imperium-bone hover:text-imperium-gold transition-colors block">
              contact@oalacea.com
            </a>
          </BrutalCard>

          {/* Social */}
          <BrutalCard hovered className="p-6 group">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-imperium-crimson/20 border border-imperium-crimson text-imperium-crimson">
                <Github className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-sm uppercase tracking-wider text-imperium-crimson">Social</h3>
                <p className="font-terminal text-xs text-imperium-steel">Connected channels</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-terminal text-sm text-imperium-steel hover:text-imperium-crimson transition-colors uppercase flex items-center gap-2 group"
              >
                <Github className="h-4 w-4" />
                <span className="group-hover:text-imperium-gold transition-colors">GitHub</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-terminal text-sm text-imperium-steel hover:text-imperium-crimson transition-colors uppercase flex items-center gap-2 group"
              >
                <Twitter className="h-4 w-4" />
                <span className="group-hover:text-imperium-gold transition-colors">Twitter</span>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-terminal text-sm text-imperium-steel hover:text-imperium-crimson transition-colors uppercase flex items-center gap-2 group"
              >
                <Linkedin className="h-4 w-4" />
                <span className="group-hover:text-imperium-gold transition-colors">LinkedIn</span>
              </a>
            </div>
          </BrutalCard>

          {/* Status */}
          <BrutalCard hovered className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-imperium-gold rounded-full animate-pulse" />
              <h3 className="font-display text-sm uppercase tracking-wider text-imperium-gold">Status</h3>
            </div>
            <div className="font-terminal text-sm text-imperium-steel space-y-1">
              <p>{'>'} System: Online</p>
              <p>{'>'} Response time: &lt; 24 cycles</p>
              <p>{'>'} Location: Segmentum</p>
            </div>
          </BrutalCard>
        </div>
      </div>
    </div>
  );
}
