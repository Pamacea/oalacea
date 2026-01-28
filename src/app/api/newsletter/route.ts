import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { newsletterSchema } from '@/lib/validations';
import { randomBytes } from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Rate limiting for newsletter subscriptions
const subscriptionAttempts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_ATTEMPTS_PER_WINDOW = 3;

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const record = subscriptionAttempts.get(email);

  if (!record || now > record.resetTime) {
    subscriptionAttempts.set(email, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= MAX_ATTEMPTS_PER_WINDOW) {
    return false;
  }

  record.count++;
  return true;
}

function generateVerifyToken(): string {
  return randomBytes(32).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = newsletterSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, firstName, consent } = validationResult.data;

    if (!consent) {
      return NextResponse.json(
        { success: false, error: 'Consent is required' },
        { status: 400 }
      );
    }

    if (!checkRateLimit(email)) {
      return NextResponse.json(
        { success: false, error: 'Too many subscription attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existingSubscriber) {
      if (existingSubscriber.unsubscribed) {
        await prisma.newsletterSubscriber.update({
          where: { email },
          data: {
            unsubscribed: false,
            unsubscribedAt: null,
            verified: false,
            verifyToken: generateVerifyToken(),
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Subscription reactivated. Please check your email to confirm.',
        });
      }

      if (existingSubscriber.verified) {
        return NextResponse.json(
          { success: false, error: 'You are already subscribed' },
          { status: 409 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'A confirmation email has already been sent. Please check your inbox.',
      });
    }

    const verifyToken = generateVerifyToken();

    await prisma.newsletterSubscriber.create({
      data: {
        email,
        firstName: firstName || null,
        consent: true,
        consentDate: new Date(),
        verified: false,
        verifyToken,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://oalacea.com';
    const confirmUrl = `${baseUrl}/api/newsletter/verify?token=${verifyToken}`;

    // Send confirmation email (requires Resend or similar)
    // For now, we'll return the URL in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Confirmation URL:', confirmUrl);
    }

    return NextResponse.json({
      success: true,
      message: 'Please check your email to confirm your subscription',
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process subscription' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { success: false, error: 'Email is required' },
      { status: 400 }
    );
  }

  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { email },
    select: { verified: true, unsubscribed: true },
  });

  if (!subscriber) {
    return NextResponse.json({ subscribed: false });
  }

  return NextResponse.json({
    subscribed: true,
    verified: subscriber.verified,
    unsubscribed: subscriber.unsubscribed,
  });
}
