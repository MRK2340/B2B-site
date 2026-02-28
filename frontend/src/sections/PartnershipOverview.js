import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Play, Heart, Music, Trophy, BarChart3 } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../components/ScrollReveal';

const features = [
  {
    icon: Bot,
    title: 'AI-Powered Rules Engine',
    description: 'Instant, accurate basketball rules assistance across NFHS and NCAA rule sets, available 24/7 on any device.',
  },
  {
    icon: Play,
    title: 'Video Training Library',
    description: 'Game-situation breakdowns, mechanics walkthroughs, and crew communication modules built by experienced officials.',
  },
  {
    icon: Heart,
    title: 'Mental Wellness Programming',
    description: 'Resilience training, pre-game focus routines, and post-game processing tools from The Resilient Whistle curriculum.',
  },
  {
    icon: Music,
    title: 'The Official Sound',
    description: 'Our groundbreaking 12-track educational hip-hop/R&B album that transforms officiating wisdom into memorable content.',
  },
  {
    icon: Trophy,
    title: 'Gamified Community',
    description: 'Leaderboards, achievement badges, and peer engagement features that drive consistent usage and development.',
  },
  {
    icon: BarChart3,
    title: 'Measurable Results',
    description: 'Comprehensive reporting on engagement, knowledge growth, confidence, and retention signals.',
  },
];

export function PartnershipOverview() {
  return (
    <section id="partnership" data-testid="partnership-section" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto container-padding">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-iwhistle-blue/10 text-iwhistle-blue rounded-full text-sm font-medium mb-4">
            WHY PARTNER WITH US
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-iwhistle-deep mb-6">
            Why Partner with iWhistle?
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            We provide comprehensive officiating education that builds confidence,
            improves retention, and elevates the quality of your games.
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8" staggerDelay={0.1}>
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="group h-full p-6 lg:p-8 bg-white rounded-xl border border-iwhistle-blue/10 shadow-card hover:shadow-card-hover transition-shadow duration-300"
                data-testid={`feature-card-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-iwhistle-deep mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
