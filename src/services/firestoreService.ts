import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db, ADMIN_EMAIL } from '../lib/firebase';
import { Article, VanpediaTerm, CommunityIssue, ArticleComment, IssueAnswer } from '../types';
import { articlesData, vanpediaTermsData, initialIssuesData, initialCommentsData } from '../data/articlesData';
import { notifyAdminNewArticle, notifyAdminNewVanpedia, notifyAdminNewQuestion } from './emailService';
import { AuthUser } from '../context/AuthContext';

const ARTICLES_COLLECTION = 'articles';
const VANPEDIA_COLLECTION = 'vanpedia';
const QUESTIONS_COLLECTION = 'questions';
const COMMENTS_COLLECTION = 'comments';

// ==========================================
// ARTICLES SERVICE
// ==========================================

export async function fetchArticlesFromFirestore(isAdmin = false, authorId?: string): Promise<Article[]> {
  try {
    const colRef = collection(db, ARTICLES_COLLECTION);
    const snap = await getDocs(colRef);

    if (snap.empty) {
      return articlesData.map(a => ({ ...a, status: 'approved' as const }));
    }

    const firestoreArticles = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
      } as Article;
    });

    // Merge with static articles if not already present in Firestore
    const combinedMap = new Map<string, Article>();
    articlesData.forEach(a => combinedMap.set(a.slug, { ...a, status: 'approved' as const }));
    firestoreArticles.forEach(a => combinedMap.set(a.slug, a));

    const all = Array.from(combinedMap.values());

    if (isAdmin) {
      return all;
    }

    // Public view: only approved or user's own pending submissions
    return all.filter(a => a.status === 'approved' || (authorId && a.authorId === authorId));
  } catch (error) {
    console.warn('Firestore fetchArticles fallback to local:', error);
    return articlesData.map(a => ({ ...a, status: 'approved' as const }));
  }
}

export async function fetchArticleBySlug(slug: string, isAdmin = false, authorId?: string): Promise<Article | null> {
  try {
    const colRef = collection(db, ARTICLES_COLLECTION);
    const q = query(colRef, where('slug', '==', slug));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const docData = snap.docs[0].data();
      const article = { id: snap.docs[0].id, ...docData } as Article;
      if (article.status === 'approved' || isAdmin || (authorId && article.authorId === authorId)) {
        return article;
      }
      return null;
    }

    const local = articlesData.find(a => a.slug === slug);
    if (local) return { ...local, status: 'approved' as const };
    return null;
  } catch (error) {
    console.warn('Firestore fetchArticleBySlug fallback to local:', error);
    const local = articlesData.find(a => a.slug === slug);
    if (local) return { ...local, status: 'approved' as const };
    return null;
  }
}

export const fetchArticleBySlugFromFirestore = fetchArticleBySlug;

export async function createArticleInFirestore(
  articleData: any,
  authorEmailOrUser?: string | AuthUser,
  authorId?: string,
  isAdminApproved = false
): Promise<Article> {
  let userEmail = '';
  let uid = '';
  let isAuthorAdmin = isAdminApproved;

  if (typeof authorEmailOrUser === 'object' && authorEmailOrUser !== null) {
    userEmail = authorEmailOrUser.email || '';
    uid = authorEmailOrUser.uid || '';
    isAuthorAdmin = authorEmailOrUser.isAdmin || userEmail === ADMIN_EMAIL;
  } else if (typeof authorEmailOrUser === 'string') {
    userEmail = authorEmailOrUser;
    uid = authorId || '';
    isAuthorAdmin = isAdminApproved || userEmail === ADMIN_EMAIL;
  } else {
    uid = authorId || '';
    isAuthorAdmin = isAdminApproved;
  }

  const generatedSlug = (articleData.slug || articleData.titleEn || articleData.title?.en || articleData.titleId || articleData.title?.id || 'article')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');

  const status: 'approved' | 'pending' = isAuthorAdmin ? 'approved' : 'pending';

  const newArticle: Partial<Article> = {
    slug: generatedSlug,
    title: {
      en: articleData.titleEn || articleData.title?.en || articleData.titleId || articleData.title?.id || '',
      id: articleData.titleId || articleData.title?.id || articleData.titleEn || articleData.title?.en || '',
    },
    summary: {
      en: articleData.summaryEn || articleData.summary?.en || articleData.summaryId || articleData.summary?.id || '',
      id: articleData.summaryId || articleData.summary?.id || articleData.summaryEn || articleData.summary?.en || '',
    },
    content: {
      en: articleData.contentEn || articleData.content?.en || articleData.contentId || articleData.content?.id || '',
      id: articleData.contentId || articleData.content?.id || articleData.contentEn || articleData.content?.en || '',
    },
    category: articleData.category || 'Software Engineering',
    tags: Array.isArray(articleData.tags) && articleData.tags.length ? articleData.tags : ['Engineering'],
    readTime: articleData.readTime || '5 min read',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    author: {
      id: uid,
      name: articleData.author?.name || articleData.authorName || userEmail?.split('@')[0] || 'Contributor',
      avatar: articleData.author?.avatar || '',
      role: {
        en: isAuthorAdmin ? 'Lead Architect & Author' : 'Community Contributor',
        id: isAuthorAdmin ? 'Arsitek Sistem & Penulis Utama' : 'Kontributor Komunitas',
      },
    },
    authorEmail: userEmail,
    authorId: uid,
    status,
    verifiedAt: isAuthorAdmin ? new Date().toISOString() : undefined,
    verifiedBy: isAuthorAdmin ? ADMIN_EMAIL : undefined,
    views: 0,
    likes: 0,
    commentsCount: 0,
  };

  const docRef = await addDoc(collection(db, ARTICLES_COLLECTION), {
    ...newArticle,
    createdAt: new Date().toISOString(),
  });

  const created = { id: docRef.id, ...newArticle } as Article;

  // Send email notification to vanviolet.js@gmail.com if submission requires verification
  if (!isAuthorAdmin) {
    notifyAdminNewArticle({
      title: created.title.en || created.title.id,
      slug: created.slug,
      category: created.category,
      authorName: created.author?.name || 'Contributor',
      authorEmail: userEmail || 'No email provided',
      excerpt: created.summary.en || created.summary.id,
      date: created.date,
    }).catch(err => console.error('Email notify error:', err));
  }

  return created;
}

export async function updateArticleStatusInFirestore(
  articleId: string,
  newStatus: 'approved' | 'rejected',
  adminEmail: string
): Promise<void> {
  const docRef = doc(db, ARTICLES_COLLECTION, articleId);
  await updateDoc(docRef, {
    status: newStatus,
    verifiedAt: new Date().toISOString(),
    verifiedBy: adminEmail,
  });
}

// ==========================================
// VANPEDIA SERVICE
// ==========================================

export async function fetchVanpediaTermsFromFirestore(isAdmin = false, authorId?: string): Promise<VanpediaTerm[]> {
  try {
    const colRef = collection(db, VANPEDIA_COLLECTION);
    const snap = await getDocs(colRef);

    const firestoreTerms = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    })) as VanpediaTerm[];

    // Merge with static seed terms
    const termMap = new Map<string, VanpediaTerm>();
    vanpediaTermsData.forEach(t => termMap.set(t.slug, { ...t, status: 'approved' as const }));
    firestoreTerms.forEach(t => termMap.set(t.slug, t));

    const all = Array.from(termMap.values());
    if (isAdmin) return all;

    return all.filter(t => t.status === 'approved' || (authorId && t.authorId === authorId));
  } catch (error) {
    console.warn('Firestore fetchVanpediaTerms fallback to local:', error);
    return vanpediaTermsData.map(t => ({ ...t, status: 'approved' as const }));
  }
}

export async function fetchVanpediaTermBySlug(slug: string, isAdmin = false, authorId?: string): Promise<VanpediaTerm | null> {
  try {
    const colRef = collection(db, VANPEDIA_COLLECTION);
    const q = query(colRef, where('slug', '==', slug));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const term = { id: snap.docs[0].id, ...snap.docs[0].data() } as VanpediaTerm;
      if (term.status === 'approved' || isAdmin || (authorId && term.authorId === authorId)) {
        return term;
      }
      return null;
    }

    const local = vanpediaTermsData.find(t => t.slug === slug);
    if (local) return { ...local, status: 'approved' as const };
    return null;
  } catch (error) {
    console.warn('Firestore fetchVanpediaTermBySlug fallback:', error);
    const local = vanpediaTermsData.find(t => t.slug === slug);
    if (local) return { ...local, status: 'approved' as const };
    return null;
  }
}

export const fetchVanpediaTermBySlugFromFirestore = fetchVanpediaTermBySlug;

export async function createVanpediaTermInFirestore(
  termData: any,
  authorEmailOrUser?: string | AuthUser,
  authorId?: string,
  isAdminApproved = false
): Promise<VanpediaTerm> {
  let userEmail = '';
  let uid = '';
  let isAuthorAdmin = isAdminApproved;

  if (typeof authorEmailOrUser === 'object' && authorEmailOrUser !== null) {
    userEmail = authorEmailOrUser.email || '';
    uid = authorEmailOrUser.uid || '';
    isAuthorAdmin = authorEmailOrUser.isAdmin || userEmail === ADMIN_EMAIL;
  } else if (typeof authorEmailOrUser === 'string') {
    userEmail = authorEmailOrUser;
    uid = authorId || '';
    isAuthorAdmin = isAdminApproved || userEmail === ADMIN_EMAIL;
  } else {
    uid = authorId || '';
    isAuthorAdmin = isAdminApproved;
  }

  const rawTerm = termData.term || termData.title?.en || termData.title?.id || termData.slug || 'term';
  const generatedSlug = (termData.slug || rawTerm)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');

  const status: 'approved' | 'pending' = isAuthorAdmin ? 'approved' : 'pending';

  const newTerm: Partial<VanpediaTerm> = {
    slug: generatedSlug,
    title: {
      en: termData.title?.en || termData.term || termData.titleEn || '',
      id: termData.title?.id || termData.term || termData.titleId || '',
    },
    category: termData.category || 'Learning (AI)',
    phonetic: termData.phonetic || '',
    definition: {
      en: termData.definition?.en || termData.definitionEn || termData.definitionId || '',
      id: termData.definition?.id || termData.definitionId || termData.definitionEn || '',
    },
    formula: termData.formula || '',
    examples: termData.examples || {
      en: termData.examplesEn || ['Real-world application.'],
      id: termData.examplesId || termData.examplesEn || ['Contoh penerapan istilah.'],
    },
    status,
    authorName: termData.authorName || userEmail?.split('@')[0] || 'Contributor',
    authorEmail: userEmail,
    authorId: uid,
    createdAt: new Date().toISOString(),
    verifiedAt: isAuthorAdmin ? new Date().toISOString() : undefined,
  };

  const docRef = await addDoc(collection(db, VANPEDIA_COLLECTION), newTerm);
  const created = { id: docRef.id, ...newTerm } as VanpediaTerm;

  // Send email notification to vanviolet.js@gmail.com for verification
  if (!isAuthorAdmin) {
    notifyAdminNewVanpedia({
      term: rawTerm,
      slug: generatedSlug,
      category: termData.category || 'General',
      phonetic: termData.phonetic,
      definition: created.definition.en || created.definition.id,
      authorName: created.authorName || 'Contributor',
      authorEmail: userEmail || 'No email provided',
    }).catch(err => console.error('Email notify error:', err));
  }

  return created;
}

export async function updateVanpediaStatusInFirestore(
  termId: string,
  newStatus: 'approved' | 'rejected',
  adminEmail: string
): Promise<void> {
  const docRef = doc(db, VANPEDIA_COLLECTION, termId);
  await updateDoc(docRef, {
    status: newStatus,
    verifiedAt: new Date().toISOString(),
    verifiedBy: adminEmail,
  });
}

// ==========================================
// Q&A / ISSUES FORUM SERVICE
// ==========================================

export async function fetchQuestionsFromFirestore(): Promise<CommunityIssue[]> {
  try {
    const colRef = collection(db, QUESTIONS_COLLECTION);
    const snap = await getDocs(colRef);

    if (snap.empty) {
      return initialIssuesData;
    }

    const firestoreQuestions = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    })) as CommunityIssue[];

    const questionMap = new Map<string, CommunityIssue>();
    initialIssuesData.forEach(q => questionMap.set(q.id, q));
    firestoreQuestions.forEach(q => questionMap.set(q.id, q));

    return Array.from(questionMap.values());
  } catch (error) {
    console.warn('Firestore fetchQuestions fallback to local:', error);
    return initialIssuesData;
  }
}

export async function createQuestionInFirestore(
  questionData: any,
  authorEmailOrUser?: string | AuthUser,
  authorId?: string
): Promise<CommunityIssue> {
  let userEmail = '';
  let uid = '';
  let displayName = '';
  let photoURL = '';

  if (typeof authorEmailOrUser === 'object' && authorEmailOrUser !== null) {
    userEmail = authorEmailOrUser.email || '';
    uid = authorEmailOrUser.uid || '';
    displayName = authorEmailOrUser.displayName || '';
    photoURL = authorEmailOrUser.photoURL || '';
  } else if (typeof authorEmailOrUser === 'string') {
    userEmail = authorEmailOrUser;
    uid = authorId || '';
  } else {
    uid = authorId || '';
  }

  const newQuestion: Partial<CommunityIssue> = {
    title: questionData.title,
    description: questionData.description,
    category: questionData.category || 'General',
    tags: Array.isArray(questionData.tags) ? questionData.tags : ['General'],
    authorName: questionData.authorName || displayName || userEmail?.split('@')[0] || 'Community Member',
    authorAvatar: questionData.authorAvatar || photoURL || '',
    authorId: uid,
    authorEmail: userEmail,
    createdAt: new Date().toISOString(),
    votes: questionData.votes || 1,
    answersCount: 0,
    status: 'open',
    answers: [],
  };

  const docRef = await addDoc(collection(db, QUESTIONS_COLLECTION), newQuestion);
  const created = { id: docRef.id, ...newQuestion } as CommunityIssue;

  // Q&A requirement: "kaalau Q&A hanya notifikasi" (Only notification to vanviolet.js@gmail.com, immediately live)
  notifyAdminNewQuestion({
    title: created.title,
    id: created.id,
    category: created.category,
    authorName: created.authorName,
    authorEmail: userEmail || 'No email provided',
    description: created.description,
    tags: created.tags,
  }).catch(err => console.error('Q&A email notify error:', err));

  return created;
}

export async function upvoteQuestionInFirestore(questionId: string, userId = 'anon'): Promise<number> {
  try {
    const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
    await updateDoc(docRef, {
      votes: increment(1),
      upvotedBy: arrayUnion(userId),
    });
    return 1;
  } catch (error) {
    console.warn('Upvote error, handled locally:', error);
    return 1;
  }
}

export async function addAnswerInFirestore(
  questionId: string,
  answerOrContent: string | IssueAnswer,
  user?: AuthUser | null
): Promise<IssueAnswer> {
  let newAnswer: IssueAnswer;

  if (typeof answerOrContent === 'object' && answerOrContent !== null) {
    newAnswer = answerOrContent;
  } else {
    newAnswer = {
      id: `ans-${Date.now()}`,
      authorName: user?.displayName || 'Community Member',
      authorAvatar: user?.photoURL || '',
      authorId: user?.uid || '',
      authorEmail: user?.email || '',
      content: String(answerOrContent),
      createdAt: new Date().toISOString(),
      votes: 0,
      isAccepted: false,
    };
  }

  try {
    const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
    await updateDoc(docRef, {
      answers: arrayUnion(newAnswer),
      answersCount: increment(1),
    });
  } catch (error) {
    console.warn('Firestore addAnswer fallback:', error);
  }

  return newAnswer;
}

export async function acceptAnswerInFirestore(questionId: string, answerId: string): Promise<void> {
  try {
    const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      const updatedAnswers = (data.answers || []).map((ans: any) => ({
        ...ans,
        isAccepted: ans.id === answerId,
      }));
      await updateDoc(docRef, {
        status: 'solved',
        solvedAnswerId: answerId,
        answers: updatedAnswers,
      });
    }
  } catch (error) {
    console.warn('Firestore acceptAnswer fallback:', error);
  }
}

export const markAnswerAcceptedInFirestore = acceptAnswerInFirestore;

// ==========================================
// ARTICLE COMMENTS SERVICE
// ==========================================

export async function fetchCommentsForArticle(articleSlug: string): Promise<ArticleComment[]> {
  try {
    const colRef = collection(db, COMMENTS_COLLECTION);
    const q = query(colRef, where('articleSlug', '==', articleSlug));
    const snap = await getDocs(q);

    const firestoreComments = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    })) as ArticleComment[];

    // Fallback/Seed from initialCommentsData
    const local = initialCommentsData.filter(c => c.articleSlug === articleSlug);
    const commentMap = new Map<string, ArticleComment>();
    local.forEach(c => commentMap.set(c.id, c));
    firestoreComments.forEach(c => commentMap.set(c.id, c));

    return Array.from(commentMap.values());
  } catch (error) {
    return initialCommentsData.filter(c => c.articleSlug === articleSlug);
  }
}

export async function addArticleCommentInFirestore(
  articleSlugOrComment: string | ArticleComment,
  commentData?: { content: string; authorName: string },
  user?: AuthUser | null
): Promise<ArticleComment> {
  let newComment: ArticleComment;

  if (typeof articleSlugOrComment === 'object') {
    newComment = articleSlugOrComment;
  } else {
    newComment = {
      id: `com-${Date.now()}`,
      articleSlug: articleSlugOrComment,
      authorName: user?.displayName || commentData?.authorName || 'Guest Reader',
      authorAvatar: user?.photoURL || '',
      authorId: user?.uid || '',
      authorEmail: user?.email || '',
      content: commentData?.content || '',
      createdAt: new Date().toISOString(),
      likes: 0,
    };
  }

  try {
    await addDoc(collection(db, COMMENTS_COLLECTION), {
      ...newComment,
    });
  } catch (error) {
    console.warn('Firestore addComment fallback:', error);
  }

  return newComment;
}
