import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, token } = body;

    if (!email && !token) {
      return NextResponse.json(
        { success: false, error: 'Email or token is required' },
        { status: 400 }
      );
    }

    let subscriber;

    if (token) {
      subscriber = await prisma.newsletterSubscriber.findUnique({
        where: { verifyToken: token },
      });
    } else {
      subscriber = await prisma.newsletterSubscriber.findUnique({
        where: { email },
      });
    }

    if (!subscriber) {
      return NextResponse.json(
        { success: false, error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        unsubscribed: true,
        unsubscribedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'You have been unsubscribed from the newsletter',
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return new NextResponse('Missing unsubscribe token', { status: 400 });
  }

  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { verifyToken: token },
  });

  if (!subscriber) {
    return new NextResponse('Invalid unsubscribe link', { status: 404 });
  }

  await prisma.newsletterSubscriber.update({
    where: { id: subscriber.id },
    data: {
      unsubscribed: true,
      unsubscribedAt: new Date(),
    },
  });

  return new NextResponse(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Unsubscribed</title>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          background: #0a0a0a;
          color: #fff;
        }
        .container {
          text-align: center;
          padding: 2rem;
        }
        h1 { color: #d4af37; }
        p { color: #94a3b8; }
        a { color: #d4af37; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>You've been unsubscribed</h1>
        <p>You will no longer receive emails from Oalacea.</p>
        <p><a href="/">Return to home</a></p>
      </div>
    </body>
    </html>
  `, {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  });
}
