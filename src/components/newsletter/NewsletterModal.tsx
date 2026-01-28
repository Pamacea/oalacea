'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { XIcon, MailIcon, CheckCircleIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
          toast.success(
            result.message || 'Please check your email to confirm your subscription'
          );
          form.reset();

          setTimeout(() => {
            setIsSuccess(false);
            onOpenChange(false);
          }, 3000);
        } else {
          toast.error(result.error || 'Failed to subscribe');
        }
      } catch {
        toast.error('Something went wrong. Please try again.');
      }
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl border border-imperium-gold/20 bg-slate-900/95 p-6 shadow-2xl shadow-imperium-gold/10">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition-colors hover:text-white"
        >
          <XIcon className="size-5" />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-full bg-imperium-gold/10 p-3">
            <MailIcon className="size-6 text-imperium-gold" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Join the Newsletter</h2>
            <p className="text-sm text-slate-400">
              Stay updated with latest projects and 3D experiments
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center">
            <div className="mb-4 inline-flex size-16 items-center justify-center rounded-full bg-imperium-terminal/10">
              <CheckCircleIcon className="size-8 text-imperium-terminal" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Almost there!
            </h3>
            <p className="mt-2 text-slate-400">
              Check your inbox to confirm your subscription.
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="your@email.com"
                        type="email"
                        disabled={isPending}
                        className="bg-slate-800/50 border-slate-700 text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">First Name (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John"
                        disabled={isPending}
                        className="bg-slate-800/50 border-slate-700 text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-slate-300">
                        I consent to receive the Oalacea newsletter
                      </FormLabel>
                      <p className="text-xs text-slate-500">
                        Unsubscribe anytime. We respect your privacy.
                      </p>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-imperium-gold text-black hover:bg-imperium-gold/90"
                disabled={isPending}
              >
                {isPending ? 'Subscribing...' : 'Subscribe Now'}
              </Button>
            </form>
          </Form>
        )}

        <p className="mt-4 text-center text-xs text-slate-500">
          By subscribing, you agree to our Privacy Policy.
        </p>
      </div>
    </div>
  );
}

export default NewsletterModal;
