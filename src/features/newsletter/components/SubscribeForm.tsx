'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { newsletterSchema, type NewsletterInput } from '@/lib/validations';
import { cn } from '@/lib/utils';

interface SubscribeFormProps {
  className?: string;
  variant?: 'default' | 'compact' | 'inline';
  onSuccess?: () => void;
}

export function SubscribeForm({
  className,
  variant = 'default',
  onSuccess,
}: SubscribeFormProps) {
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
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success) {
          setIsSuccess(true);
          toast.success(
            result.message || 'Please check your email to confirm your subscription'
          );
          form.reset();
          onSuccess?.();

          setTimeout(() => setIsSuccess(false), 5000);
        } else {
          toast.error(result.error || 'Failed to subscribe');
        }
      } catch {
        toast.error('Something went wrong. Please try again.');
      }
    });
  };

  if (isSuccess) {
    return (
      <Card variant="crimson" className={cn(className)}>
        <CardContent className="flex items-center gap-3 border-2 border-imperium-gold/30 bg-imperium-gold/5 py-4">
          <CheckCircle className="size-5 text-imperium-gold" />
          <div>
            <p className="font-display uppercase tracking-wider text-imperium-bone">Transmission Received</p>
            <p className="font-terminal text-sm text-imperium-steel-dark">
              {'>'} Check your inbox to confirm the uplink.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn('flex gap-2', className)}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    placeholder="your@email.com"
                    type="email"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isPending} size="icon" variant="crimson">
            {isPending ? (
              <AlertCircle className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </form>
      </Form>
    );
  }

  if (variant === 'inline') {
    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn('flex flex-wrap items-end gap-3', className)}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex-1 min-w-[200px]">
                <FormControl>
                  <Input
                    placeholder="your@email.com"
                    type="email"
                    disabled={isPending}
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
              <FormItem className="flex-1 min-w-[150px]">
                <FormControl>
                  <Input
                    placeholder="First name"
                    disabled={isPending}
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
              <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                  />
                </FormControl>
                <FormLabel className="font-terminal text-sm font-normal text-imperium-steel-dark">
                  I agree to receive transmissions
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isPending} variant="crimson">
            {isPending ? 'Uplinking...' : 'Transmit'}
          </Button>
        </form>
      </Form>
    );
  }

  return (
    <Card variant="steel" className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display uppercase tracking-wider">
          <Mail className="size-5 text-imperium-gold" />
          [ Establish Uplink ]
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-display text-imperium-bone">Email Frequency</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="your@email.com"
                        type="email"
                        disabled={isPending}
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
                    <FormLabel className="font-display text-imperium-bone">Designation (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Battle Brother"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                    <FormLabel className="font-display text-imperium-bone">
                      I consent to receive Imperial transmissions
                    </FormLabel>
                    <FormDescription className="font-terminal text-imperium-steel-dark">
                      {'>'} Receive updates on crusades, scripture, and holy experiments.
                      Unsubscribe at any time via the Administratum.
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full font-terminal uppercase"
              disabled={isPending}
              variant="crimson"
            >
              {isPending ? (
                <>
                  <AlertCircle className="mr-2 size-4 animate-spin" />
                  Establishing Uplink...
                </>
              ) : (
                <>
                  <Send className="mr-2 size-4" />
                  Initiate Transmission
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default SubscribeForm;
