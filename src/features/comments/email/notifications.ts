import { sendEmail } from '@/services/email';

interface Comment {
  id: string;
  authorName: string;
  authorEmail?: string | null;
  content: string;
  parentId?: string | null;
  parentComment?: {
    authorEmail?: string | null;
    authorName: string;
    content: string;
  } | null;
}

interface Post {
  slug: string;
  title: string;
}

interface Project {
  slug: string;
  title: string;
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Send notification email to admin when a new comment awaits moderation
 */
export async function sendCommentNotificationEmail(
  comment: Comment,
  post: Post | null,
  project: Project | null
) {
  const adminEmail = process.env.ADMIN_EMAIL;
  console.log('[Comment Notification] Preparing admin notification:', {
    hasAdminEmail: !!adminEmail,
    adminEmail: adminEmail?.slice(0, 3) + '***' + adminEmail?.slice(adminEmail.indexOf('@')),
    commentId: comment.id,
    postTitle: post?.title,
    projectTitle: project?.title,
  });

  if (!adminEmail) {
    console.error('[Comment Notification] ADMIN_EMAIL not set, skipping admin notification');
    return;
  }

  const contentType = post ? 'blog post' : 'project';
  const contentTitle = post?.title || project?.title;
  const contentSlug = post?.slug || project?.slug;
  const contentUrl = `${appUrl}/${post ? 'blog' : 'portfolio'}/${contentSlug}`;
  const moderationUrl = `${appUrl}/admin/comments`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #8b1014; color: #fff; padding: 20px; text-align: center; }
          .content { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-top: 20px; }
          .blockquote { background: #fff; border-left: 4px solid #8b1014; padding: 15px; margin: 15px 0; font-style: italic; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          .btn { display: inline-block; background: #8b1014; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 5px; }
          .btn-secondary { background: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Comment Awaiting Moderation</h2>
          </div>
          <div class="content">
            <p><strong>Author:</strong> ${comment.authorName}</p>
            <p><strong>Email:</strong> ${comment.authorEmail || 'Not provided'}</p>
            <p><strong>On:</strong> ${contentTitle} (${contentType})</p>
            <p><strong>Comment:</strong></p>
            <div class="blockquote">${comment.content.replace(/\n/g, '<br>')}</div>
            <p>
              <a href="${contentUrl}#comments" class="btn">View on site</a>
              <a href="${moderationUrl}" class="btn btn-secondary">Moderate</a>
            </p>
          </div>
          <div class="footer">
            <p>You received this email because you are the administrator of this site.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: adminEmail,
    subject: `New comment on "${contentTitle}"`,
    html,
  });
}

/**
 * Send notification email to parent comment author when someone replies
 */
export async function sendReplyNotificationEmail(
  reply: Comment,
  parentComment: {
    authorEmail?: string | null;
    authorName: string;
    content: string;
  },
  post: Post | null,
  project: Project | null
) {
  if (!parentComment.authorEmail) {
    console.warn('Parent comment has no email, skipping reply notification');
    return;
  }

  // Don't send notification if replying to yourself
  if (reply.authorEmail === parentComment.authorEmail) {
    return;
  }

  const contentTitle = post?.title || project?.title;
  const contentSlug = post?.slug || project?.slug;
  const contentUrl = `${appUrl}/${post ? 'blog' : 'portfolio'}/${contentSlug}`;
  const unsubscribeUrl = `${appUrl}/unsubscribe?email=${encodeURIComponent(parentComment.authorEmail)}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #8b1014; color: #fff; padding: 20px; text-align: center; }
          .content { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-top: 20px; }
          .blockquote { background: #fff; border-left: 4px solid #ddd; padding: 15px; margin: 15px 0; }
          .blockquote-reply { border-left-color: #8b1014; background: #fff8f8; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          .btn { display: inline-block; background: #8b1014; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Someone Replied to Your Comment</h2>
          </div>
          <div class="content">
            <p><strong>On:</strong> ${contentTitle}</p>
            <p><strong>Your comment:</strong></p>
            <div class="blockquote">${parentComment.content.replace(/\n/g, '<br>')}</div>
            <p><strong>${reply.authorName} replied:</strong></p>
            <div class="blockquote blockquote-reply">${reply.content.replace(/\n/g, '<br>')}</div>
            <p><a href="${contentUrl}#comments" class="btn">View on site</a></p>
          </div>
          <div class="footer">
            <p>You received this because you commented on this post.</p>
            <p><a href="${unsubscribeUrl}">Unsubscribe from reply notifications</a></p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: parentComment.authorEmail,
    subject: `Reply to your comment on "${contentTitle}"`,
    html,
  });
}
