// TutorialStep - Individual tutorial step component with animations
'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { TutorialStepData } from './tutorialSteps';

interface TutorialStepCardProps {
  step: TutorialStepData;
  currentIndex: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSkip: () => void;
  isLastStep: boolean;
}

export function TutorialStepCard({
  step,
  currentIndex,
  totalSteps,
  onPrevious,
  onNext,
  onSkip,
  isLastStep,
}: TutorialStepCardProps) {
  const variants = {
    enter: {
      x: 50,
      opacity: 0,
      scale: 0.95,
    },
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: {
      x: -50,
      opacity: 0,
      scale: 0.95,
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 },
      }}
      className="relative"
    >
      <Card className="border-imperium-gold/30 bg-slate-950/95 backdrop-blur-md shadow-2xl">
        {/* Progress bar */}
        <div className="absolute left-0 top-0 h-1 bg-gradient-to-r from-imperium-gold to-imperium-crimson transition-all duration-500"
             style={{ width: `${((currentIndex + 1) / totalSteps) * 100}%` }} />

        <CardContent className="p-6">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="border-imperium-gold text-imperium-gold bg-imperium-gold/10"
              >
                {currentIndex + 1} / {totalSteps}
              </Badge>
              {step.keyHint && (
                <Badge className="bg-imperium-crimson text-white">
                  {step.keyHint}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSkip}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Title */}
          <motion.h2
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-3 text-xl font-bold text-white"
          >
            {step.title}
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 text-slate-300"
          >
            {step.description}
          </motion.p>

          {/* Navigation */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevious}
              disabled={currentIndex === 0}
              className={cn(
                'border-slate-700 text-slate-300',
                'hover:border-imperium-gold hover:text-imperium-gold',
                'disabled:opacity-30'
              )}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={isLastStep ? onSkip : onNext}
              className="bg-imperium-gold text-black hover:bg-imperium-gold/90"
            >
              {isLastStep ? (
                'Finish'
              ) : (
                <>
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
