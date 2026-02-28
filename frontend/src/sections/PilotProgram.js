import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Video, CheckCircle, ArrowRight } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../components/ScrollReveal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

const tracks = [
  {
    id: 'A',
    name: 'Youth & Recreational Leagues',
    icon: Users,
    features: [
      { icon: Calendar, text: 'Duration: Full season (3-4 months)' },
      { icon: Users, text: 'Participants: Up to 25 officials' },
      { icon: Video, text: 'Onboarding: 60-minute virtual kickoff' },
      { icon: CheckCircle, text: 'Weekly: 1 training module + 1 rules challenge' },
      { icon: CheckCircle, text: 'Mid-Pilot: Progress review at Week 8' },
      { icon: CheckCircle, text: 'Closeout: Full data report + ROI presentation' },
    ],
    price: '$8',
    originalPrice: '$15',
    savings: '47%',
  },
  {
    id: 'B',
    name: 'Officiating Camps & Clinics',
    icon: Video,
    features: [
      { icon: Calendar, text: 'Duration: Full camp cycle (3-4 months)' },
      { icon: Users, text: 'Participants: Up to 40 camp attendees' },
      { icon: Video, text: 'Pre-Camp: 4-week rules refresher' },
      { icon: CheckCircle, text: 'During Camp: Live integration and real-time lookups' },
      { icon: CheckCircle, text: 'Post-Camp: 8-week reinforcement track' },
      { icon: CheckCircle, text: 'Closeout: Comprehensive impact report' },
    ],
    price: '$12',
    originalPrice: '$20',
    savings: '40%',
  },
];

const scenarios = [
  { name: 'Small rec league', officials: 12, duration: '4 months', cost: '$384' },
  { name: 'Mid-size league', officials: 25, duration: '4 months', cost: '$800' },
  { name: 'Regional camp', officials: 40, duration: '3 months', cost: '$1,440' },
];

export function PilotProgram() {
  return (
    <section id="pilot" data-testid="pilot-section" className="section-padding bg-gray-50">
      <div className="max-w-7xl mx-auto container-padding">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-iwhistle-orange/10 text-iwhistle-orange rounded-full text-sm font-medium mb-4">
            PILOT PROGRAM
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-iwhistle-deep mb-6">
            Pilot Program Structure
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Experience measurable results before committing to a long-term partnership.
            Our pilot program runs for 3-4 months at significantly discounted rates.
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid lg:grid-cols-2 gap-8 mb-16" staggerDelay={0.15}>
          {tracks.map((track) => (
            <StaggerItem key={track.id}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
                className="h-full bg-white rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-shadow duration-300 border border-iwhistle-blue/10"
                data-testid={`track-card-${track.id}`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center">
                    <track.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-iwhistle-blue">Track {track.id}</span>
                    <h3 className="text-xl font-bold text-iwhistle-deep">{track.name}</h3>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {track.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <feature.icon className="w-5 h-5 text-iwhistle-blue mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{feature.text}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-6 border-t border-gray-100">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-iwhistle-deep">{track.price}</span>
                    <span className="text-gray-500">/official/month</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 line-through">{track.originalPrice}/official/month</span>
                    <span className="px-2 py-1 bg-iwhistle-orange/10 text-iwhistle-orange text-sm font-medium rounded">
                      Save {track.savings}
                    </span>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <ScrollReveal delay={0.2}>
          <div className="bg-white rounded-2xl p-8 shadow-card border border-iwhistle-blue/10" data-testid="investment-table">
            <h3 className="text-xl font-bold text-iwhistle-deep mb-6 text-center">
              Sample Investment Scenarios
            </h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-iwhistle-deep hover:bg-iwhistle-deep">
                    <TableHead className="text-white font-semibold">Scenario</TableHead>
                    <TableHead className="text-white font-semibold text-center">Officials</TableHead>
                    <TableHead className="text-white font-semibold text-center">Duration</TableHead>
                    <TableHead className="text-white font-semibold text-right">Total Pilot Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scenarios.map((scenario, index) => (
                    <TableRow key={scenario.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <TableCell className="font-medium text-iwhistle-deep">{scenario.name}</TableCell>
                      <TableCell className="text-center text-gray-600">{scenario.officials}</TableCell>
                      <TableCell className="text-center text-gray-600">{scenario.duration}</TableCell>
                      <TableCell className="text-right font-bold text-iwhistle-blue">{scenario.cost}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3} className="text-center mt-12">
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 btn-primary text-lg px-8 py-4"
            data-testid="pilot-cta"
          >
            Schedule a Discovery Call
            <ArrowRight className="w-5 h-5" />
          </motion.a>
        </ScrollReveal>
      </div>
    </section>
  );
}
