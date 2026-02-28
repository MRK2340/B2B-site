import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Brain, Users, CheckCircle } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../components/ScrollReveal';
import { useCountUp } from '../hooks/useCountUp';

const metrics = [
  { icon: Users, value: 60, suffix: '%+', label: 'Weekly Active Usage', description: 'by Month 2' },
  { icon: TrendingUp, value: 15, suffix: '%+', label: 'Rules Assessment', description: 'Score Improvement' },
  { icon: Brain, value: 100, suffix: '%', label: 'Measurable Increase', description: 'in Self-Reported Confidence', isText: true },
  { icon: CheckCircle, value: 80, suffix: '%+', label: 'Officials Indicate', description: 'Intent to Continue' },
];

function MetricCard({ metric }) {
  const { count, ref } = useCountUp({ end: metric.value, duration: 2000, decimals: 0 });

  return (
    <motion.div
      ref={ref}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group text-center p-8 bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow duration-300 border border-iwhistle-blue/10"
      data-testid={`metric-card-${metric.label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-300">
        <metric.icon className="w-8 h-8 text-white" />
      </div>
      <div className="text-5xl font-bold text-iwhistle-deep mb-2">
        {metric.isText ? <span>Measurable</span> : <span>{count}{metric.suffix}</span>}
      </div>
      <div className="text-lg font-semibold text-iwhistle-blue mb-1">{metric.label}</div>
      <div className="text-gray-500">{metric.description}</div>
    </motion.div>
  );
}

export function SuccessMetrics() {
  return (
    <section data-testid="metrics-section" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto container-padding">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-iwhistle-light/20 text-iwhistle-deep rounded-full text-sm font-medium mb-4">
            SUCCESS METRICS
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-iwhistle-deep mb-6">
            Success Metrics & Reporting
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            We track pilot outcomes across four dimensions, providing clear,
            data-backed evidence of platform impact.
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
          {metrics.map((metric) => (
            <StaggerItem key={metric.label}>
              <MetricCard metric={metric} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        <ScrollReveal delay={0.4} className="mt-16">
          <div className="bg-gradient-to-r from-iwhistle-deep to-iwhistle-blue rounded-2xl p-8 text-white" data-testid="reporting-info">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Mid-Pilot Snapshot</h3>
                <p className="text-white/80 leading-relaxed">
                  Delivered at Week 6-8: Engagement trends, early knowledge gains,
                  usage patterns, and any recommended adjustments.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Final Impact Report</h3>
                <p className="text-white/80 leading-relaxed">
                  Delivered at Week 12-14: Comprehensive analysis across all four dimensions,
                  ROI summary, and conversion recommendation with proposed terms.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/20 text-center">
              <p className="text-white/90">
                <span className="font-semibold">Format:</span> Professional PDF report with visual dashboards,
                delivered via email with a live walkthrough session.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
