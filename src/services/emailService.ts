/**
 * Free Email Notification Service
 * Sends automated email alerts to vanviolet.js@gmail.com
 * Powered by zero-cost, serverless form delivery (FormSubmit / Webhook)
 */

import { ADMIN_EMAIL } from '../lib/firebase';

interface ArticleNotifyPayload {
  title: string;
  slug: string;
  category: string;
  authorName: string;
  authorEmail: string;
  excerpt: string;
  date: string;
}

interface VanpediaNotifyPayload {
  term: string;
  slug: string;
  category: string;
  phonetic?: string;
  definition: string;
  authorName: string;
  authorEmail: string;
}

interface QuestionNotifyPayload {
  title: string;
  id: string;
  category: string;
  authorName: string;
  authorEmail: string;
  description: string;
  tags: string[];
}

export interface ReportNotifyPayload {
  contentType: 'article' | 'vanpedia' | 'question';
  contentSlug: string;
  contentTitle: string;
  reason: string;
  details: string;
  reporterName?: string;
  reporterEmail?: string;
  url?: string;
}

/**
 * Dispatch free notification email to vanviolet.js@gmail.com
 */
async function sendNotificationEmail(data: {
  subject: string;
  type: 'ARTICLE_VERIFICATION' | 'VANPEDIA_VERIFICATION' | 'QA_NOTIFICATION' | 'CONTENT_REPORT';
  payload: Record<string, string | number | boolean | string[]>;
}): Promise<boolean> {
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://muchamadirvan.com';
    
    const requestBody = {
      _subject: data.subject,
      _template: 'box',
      _captcha: 'false',
      destination: ADMIN_EMAIL,
      notification_type: data.type,
      app_url: origin,
      ...data.payload,
      timestamp: new Date().toISOString()
    };

    // Free AJAX email endpoint to vanviolet.js@gmail.com
    const response = await fetch(`https://formsubmit.co/ajax/${ADMIN_EMAIL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      console.warn('Email delivery response not OK:', response.status);
    }
    return true;
  } catch (error) {
    console.error('Email dispatch notification failed (non-blocking):', error);
    return false;
  }
}

/**
 * Notify vanviolet.js@gmail.com for pending Article submission (Requires verification)
 */
export async function notifyAdminNewArticle(payload: ArticleNotifyPayload): Promise<boolean> {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const verificationLink = `${origin}/admin?tab=articles&slug=${encodeURIComponent(payload.slug)}`;
  
  return sendNotificationEmail({
    subject: `[Muchamad Irvan Hub] [VERIFIKASI DIBUTUHKAN] Artikel Baru: "${payload.title}"`,
    type: 'ARTICLE_VERIFICATION',
    payload: {
      status: 'PENDING_VERIFICATION (Perlu Persetujuan vanviolet.js@gmail.com)',
      title: payload.title,
      slug: payload.slug,
      category: payload.category,
      author_name: payload.authorName,
      author_email: payload.authorEmail,
      excerpt: payload.excerpt,
      submission_date: payload.date,
      action_needed: 'Buka Admin Dashboard di web untuk menyetujui (Approve) atau menolak (Reject) artikel ini.',
      review_url: verificationLink
    }
  });
}

/**
 * Notify vanviolet.js@gmail.com for pending Vanpedia term (Requires verification)
 */
export async function notifyAdminNewVanpedia(payload: VanpediaNotifyPayload): Promise<boolean> {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const verificationLink = `${origin}/admin?tab=vanpedia&slug=${encodeURIComponent(payload.slug)}`;

  return sendNotificationEmail({
    subject: `[Vanpedia] [VERIFIKASI DIBUTUHKAN] Istilah Baru: "${payload.term}"`,
    type: 'VANPEDIA_VERIFICATION',
    payload: {
      status: 'PENDING_VERIFICATION (Perlu Persetujuan vanviolet.js@gmail.com)',
      term: payload.term,
      slug: payload.slug,
      category: payload.category,
      phonetic: payload.phonetic || '-',
      definition: payload.definition,
      author_name: payload.authorName,
      author_email: payload.authorEmail,
      action_needed: 'Buka Admin Dashboard di web untuk menyetujui (Approve) atau menolak (Reject) istilah ini.',
      review_url: verificationLink
    }
  });
}

/**
 * Notify vanviolet.js@gmail.com for new Q&A Question (Notification only, instantly published)
 */
export async function notifyAdminNewQuestion(payload: QuestionNotifyPayload): Promise<boolean> {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const questionLink = `${origin}/issues?id=${encodeURIComponent(payload.id)}`;

  return sendNotificationEmail({
    subject: `[Q&A Forum] Pertanyaan Komunitas Baru: "${payload.title}"`,
    type: 'QA_NOTIFICATION',
    payload: {
      status: 'PUBLISHED (Notifikasi Saja)',
      title: payload.title,
      category: payload.category,
      tags: payload.tags.join(', '),
      author_name: payload.authorName,
      author_email: payload.authorEmail,
      description: payload.description,
      question_url: questionLink
    }
  });
}

/**
 * Notify vanviolet.js@gmail.com when a reader/user reports an issue on an Article or Vanpedia term
 */
export async function notifyAdminContentReport(payload: ReportNotifyPayload): Promise<boolean> {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const contentPath = payload.contentType === 'article' 
    ? `/articles/${payload.contentSlug}`
    : `/vanpedia/${payload.contentSlug}`;
  const targetLink = `${origin}${contentPath}`;

  return sendNotificationEmail({
    subject: `[LAPORAN KONTEN] Laporan Ketidaksesuaian: ${payload.contentType.toUpperCase()} "${payload.contentTitle}"`,
    type: 'CONTENT_REPORT',
    payload: {
      status: 'USER_REPORT_SUBMITTED (Laporan Perlu Ditinjau)',
      content_type: payload.contentType,
      content_title: payload.contentTitle,
      content_slug: payload.contentSlug,
      report_reason: payload.reason,
      reporter_name: payload.reporterName || 'Anonymous Reader',
      reporter_email: payload.reporterEmail || 'Not specified',
      details_explanation: payload.details,
      content_link: targetLink,
      reported_at: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
    }
  });
}
