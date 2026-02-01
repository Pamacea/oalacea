'use client';

import { motion } from 'framer-motion';
import { Code2, Hammer, Cpu, Sword, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { GlitchText } from '@/components/ui/imperium';
import { BrutalCard } from '@/components/navigation/BrutalBackground';

const skills = [
  { name: 'Next.js', level: 90, icon: Code2 },
  { name: 'React', level: 85, icon: Cpu },
  { name: 'TypeScript', level: 80, icon: Sword },
  { name: 'Three.js', level: 75, icon: Hammer },
  { name: 'Prisma', level: 70, icon: Hammer },
  { name: 'Tailwind CSS', level: 85, icon: Sword },
];

const stats = [
  { label: 'Projects', value: '12+', icon: Hammer },
  { label: 'Articles', value: '25+', icon: Sword },
  { label: 'Commits', value: '500+', icon: Hammer },
  { label: 'Coffee', value: '∞', icon: Cpu },
];

export default function AboutPage() {
  return (
    <div className="w-full max-w-4/5 mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12">
        <div className="inline-block border-2 border-imperium-crimson bg-imperium-black-raise px-6 py-4 relative">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-imperium-crimson shadow-[0_0_10px_rgba(154,17,21,0.6)]" />
          <h1 className="font-display text-4xl md:text-5xl uppercase tracking-widest text-imperium-crimson">
            <GlitchText>About</GlitchText>
          </h1>
          <p className="font-terminal text-imperium-steel mt-2">
            {'>'} Servant of the Omnissiah // Astra Militarum
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Profile */}
        <BrutalCard hovered className="p-6 lg:col-span-2">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-imperium-crimson/20 border border-imperium-crimson">
              <Sword className="h-6 w-6 text-imperium-crimson" />
            </div>
            <div>
              <h2 className="font-display text-xl uppercase tracking-wider text-imperium-bone">
                Oalacea
              </h2>
              <p className="font-terminal text-sm text-imperium-steel">
                Full-stack Battle Brother // Code Servant
              </p>
            </div>
          </div>

          <div className="font-terminal text-imperium-steel space-y-3">
            <p>
              <span className="text-imperium-gold">{'>'}</span> forged in the fires of the Salamanders, this platform serves as my digital forge and knowledge repository.
            </p>
            <p>
              <span className="text-imperium-crimson">{'>'}</span> combining brutalist Warhammer 40K aesthetics with cutting-edge web technologies.
            </p>
            <p>
              <span className="text-imperium-teal">{'>'}</span> every line of code is written for the Emperor.
            </p>
            <p>
              <span className="text-imperium-bone">{'>'}</span> the heresy of bugs is purged with extreme prejudice.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="border-2 border-imperium-steel-dark bg-imperium-black/50 p-3 text-center"
              >
                <stat.icon className="h-4 w-4 mx-auto text-imperium-gold mb-1" />
                <div className="font-terminal text-xs text-imperium-steel">{stat.label}</div>
                <div className="font-display text-lg text-imperium-bone">{stat.value}</div>
              </motion.div>
            ))}
          </div>
        </BrutalCard>

        {/* Skills */}
        <BrutalCard hovered className="p-6">
          <h3 className="font-display text-sm uppercase tracking-wider text-imperium-gold mb-4 flex items-center gap-2">
            <Hammer className="h-4 w-4" />
            Arsenal
          </h3>
          <div className="space-y-3">
            {skills.map((skill, i) => (
              <div key={skill.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <skill.icon className="h-4 w-4 text-imperium-steel" />
                    <span className="font-terminal text-sm text-imperium-bone">{skill.name}</span>
                  </div>
                  <span className="font-terminal text-xs text-imperium-crimson">
                    {skill.level}%
                  </span>
                </div>
                <div className="h-2 border-2 border-imperium-steel-dark bg-imperium-black relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="h-full bg-gradient-to-r from-imperium-crimson via-imperium-gold to-imperium-teal"
                  />
                </div>
              </div>
            ))}
          </div>
        </BrutalCard>

        {/* Timeline */}
        <BrutalCard hovered className="p-6">
          <h3 className="font-display text-sm uppercase tracking-wider text-imperium-crimson mb-4 flex items-center gap-2">
            <Sword className="h-4 w-4" />
            Crusade Timeline
          </h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-full bg-imperium-steel-dark absolute left-0" />
                <div className="w-3 h-3 bg-imperium-crimson rounded-full border border-imperium-crimson shrink-0" />
                <div className="w-2 h-2 bg-imperium-crimson rounded-full -z-10" />
              </div>
              <div className="font-terminal text-sm">
                <span className="text-imperium-crimson">M2024</span>
                <p className="text-imperium-steel">Founded the Chapter</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-full bg-imperium-steel-dark absolute left-0" />
                <div className="w-3 h-3 bg-imperium-gold rounded-full border border-imperium-gold shrink-0" />
              </div>
              <div className="font-terminal text-sm">
                <span className="text-imperium-gold">M2025</span>
                <p className="text-imperium-steel">First campaign launched</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-full bg-imperium-steel-dark absolute left-0" />
                <div className="w-3 h-3 bg-imperium-teal rounded-full border border-imperium-teal shrink-0" />
              </div>
              <div className="font-terminal text-sm">
                <span className="text-imperium-teal">M2026</span>
                <p className="text-imperium-steel">Forge expanded to new territories</p>
              </div>
            </div>
          </div>
        </BrutalCard>
      </div>

      {/* CTA */}
      <div className="mt-12 flex flex-wrap gap-4 justify-center">
        <Link href="/projets">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="border-2 border-imperium-gold bg-imperium-gold/20 text-imperium-gold px-6 py-3 font-terminal uppercase hover:bg-imperium-gold/40 hover:text-imperium-black transition-all cursor-pointer"
          >
            {'>'} View Projects
            <ArrowRight className="h-4 w-4 ml-2" />
          </motion.div>
        </Link>
        <Link href="/blogs">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="border-2 border-imperium-crimson bg-imperium-crimson/20 text-imperium-crimson px-6 py-3 font-terminal uppercase hover:bg-imperium-crimson/40 hover:text-imperium-black transition-all cursor-pointer"
          >
            {'>'} Read Archives
            <ArrowRight className="h-4 w-4 ml-2" />
          </motion.div>
        </Link>
      </div>
    </div>
  );
}
