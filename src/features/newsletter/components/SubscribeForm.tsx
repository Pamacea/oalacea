'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailIcon, SendIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';
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
      <Card className={cn('border-imperium-terminal/50 bg-imperium-terminal/5', className)}>
        <CardContent className="flex items-center gap-3 py-4">
          <CheckCircleIcon className="size-5 text-imperium-terminal" />
          <div>
            <p className="font-semibold text-imperium-terminal">Almost there!</p>
            <p className="text-sm text-muted-foreground">
              Check your inbox to confirm your subscription.
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
          <Button type="submit" disabled={isPending} size="icon">
            {isPending ? (
              <AlertCircleIcon className="size-4 animate-spin" />
            ) : (
              <SendIcon className="size-4" />
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
                <FormLabel className="text-sm font-normal text-muted-foreground">
                  I agree to receive emails
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </form>
      </Form>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MailIcon className="size-5 text-imperium-gold" />
          Subscribe to the Newsletter
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
                    <FormLabel>Email</FormLabel>
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
                    <FormLabel>First Name (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John"
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
                    <FormLabel>
                      I consent to receive the Oalacea newsletter
                    </FormLabel>
                    <FormDescription>
                      Get updates on new projects, blog posts, and 3D experiments.
                      Unsubscribe anytime.
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <AlertCircleIcon className="mr-2 size-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <SendIcon className="mr-2 size-4" />
                  Subscribe Now
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
