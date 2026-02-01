'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Mail, CheckCircle, Skull } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { ImperiumModal, ImperiumModalContent, ImperiumModalFooter, GlitchText, ChaoticOverlay, ScanlineBeam } from '@/components/ui/imperium';
import { ImperiumInput } from '@/components/ui/imperium/input';
import { ImperiumButton } from '@/components/ui/imperium/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { newsletterSchema, type NewsletterInput } from '@/lib/validations';
import { useUISound } from '@/hooks/use-ui-sound';

interface NewsletterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source?: '3d-terminal' | 'blog' | 'footer';
}

export function NewsletterModal({
  open,
  onOpenChange,
  source = 'blog',
}: NewsletterModalProps) {
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const { playClick, playSuccess, playError } = useUISound();

  const form = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: '',
      firstName: '',
      consent: false,
    },
  });

  const onSubmit = async (data: NewsletterInput) => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, source }),
        });

        const result = await response.json();

        if (result.success) {
          setIsSuccess(true);
          playSuccess();
          toast.success(
            result.message || 'Please check your email to confirm your subscription'
          );
          form.reset();

          setTimeout(() => {
            setIsSuccess(false);
            onOpenChange(false);
          }, 3000);
        } else {
          playError();
          toast.error(result.error || 'Failed to subscribe');
        }
      } catch {
        playError();
        toast.error('Something went wrong. Please try again.');
      }
    });
  };

  return (
    <ImperiumModal
      open={open}
      onOpenChange={onOpenChange}
      title="Subscribe to the Transmission"
      subtitle="Join the Oalacea data stream"
      size="sm"
      soundEffects
    >
      <ImperiumModalContent>
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 opacity-10">
          <Skull className="w-20 h-20 text-imperium-crimson" />
        </div>

        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ type: 'spring', damping: 10 }}
              className="mb-6 inline-flex size-20 items-center justify-center border-2 border-imperium-crimson bg-imperium-crimson/10"
            >
              <CheckCircle className="size-10 text-imperium-crimson" />
            </motion.div>
            <h3 className="font-display text-2xl uppercase tracking-widest text-imperium-bone mb-3">
              <GlitchText intensity="severe">
                Transmission Initiated
              </GlitchText>
            </h3>
            <p className="font-terminal text-imperium-steel">
              Confirm your data link via inbox transmission.
            </p>
          </motion.div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Email field with brutalist style */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-display text-sm uppercase tracking-wider text-imperium-bone flex items-center gap-2">
                      <span className="w-1 h-4 bg-imperium-crimson" />
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <ImperiumInput
                        placeholder="servant@imperium.terra"
                        type="email"
                        disabled={isPending}
                        variant="crimson"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* First name field */}
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-display text-sm uppercase tracking-wider text-imperium-bone flex items-center gap-2">
                      <span className="w-1 h-4 bg-imperium-crimson" />
                      Designation (Optional)
                    </FormLabel>
                    <FormControl>
                      <ImperiumInput
                        placeholder="Brother"
                        disabled={isPending}
                        variant="steel"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Consent checkbox */}
              <FormField
                control={form.control}
                name="consent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                        className="border-imperium-crimson data-[state=checked]:bg-imperium-crimson"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-terminal text-sm text-imperium-steel">
                        I consent to receive Oalacea transmissions
                      </FormLabel>
                      <p className="font-terminal text-xs text-imperium-steel-dark">
                        Unsubscribe at any time. For the Emperor.
                      </p>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit button with glitch effect */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ImperiumButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full uppercase tracking-widest"
                  disabled={isPending}
                  onClick={playClick}
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        ⚙
                      </motion.span>
                      Processing...
                    </span>
                  ) : (
                    <>
                      Initiate Transmission
                      <span className="text-imperium-gold ml-2">»</span>
                    </>
                  )}
                </ImperiumButton>
              </motion.div>
            </form>
          </Form>
        )}
      </ImperiumModalContent>

      <ImperiumModalFooter>
        <p className="font-terminal text-xs text-imperium-steel-dark text-center w-full">
          // Data processing in accordance with Imperial Protocol.//
        </p>
      </ImperiumModalFooter>
    </ImperiumModal>
  );
}

export default NewsletterModal;
