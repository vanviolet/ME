import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db, ADMIN_EMAIL } from '../lib/firebase';
import { Article, VanpediaTerm, CommunityIssue, ArticleComment, IssueAnswer, ContentReport } from '../types';
import { articlesData, vanpediaTermsData, initialIssuesData, initialCommentsData } from '../data/articlesData';
import { notifyAdminNewArticle, notifyAdminNewVanpedia, notifyAdminNewQuestion, notifyAdminContentReport, sendContactMessageEmail } from './emailService';
import { AuthUser } from '../context/AuthContext';

const ARTICLES_COLLECTION = 'articles';
const VANPEDIA_COLLECTION = 'vanpedia';
const QUESTIONS_COLLECTION = 'questions';
const COMMENTS_COLLECTION = 'comments';
const REPORTS_COLLECTION = 'reports';
const ARTICLE_LIKES_COLLECTION = 'article_likes';
const MESSAGES_COLLECTION = 'messages';

// Helper function to remove undefined values before Firestore writes
export function cleanUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefined(item)) as unknown as T;
  }
  const cleaned: any = {};
  for (const key of Object.keys(obj as Record<string, any>)) {
    const val = (obj as Record<string, any>)[key];
    if (val !== undefined) {
      if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
        cleaned[key] = cleanUndefined(val);
      } else {
        cleaned[key] = val;
      }
    }
  }
  return cleaned as T;
}

// ==========================================
// ARTICLES SERVICE
// ==========================================

export async function fetchArticlesFromFirestore(isAdmin = false, authorId?: string): Promise<Article[]> {
  try {
    const colRef = collection(db, ARTICLES_COLLECTION);
    const snap = await getDocs(colRef);

    if (snap.empty) {
      return [];
    }

    const firestoreArticles = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
      } as Article;
    });

    if (isAdmin) {
      return firestoreArticles;
    }

    // Filter view:
    // If visibility is public, show it immediately.
    // If visibility is private: only show if authorId === currentUserId or isAdmin
    return firestoreArticles.filter(a => {
      if (a.visibility === 'public') return true;
      const isOwner = Boolean(authorId && a.authorId === authorId);
      if (isOwner) return true;
      return a.status === 'approved';
    });
  } catch (error) {
    console.warn('Firestore fetchArticles error:', error);
    return [];
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
      const isOwner = Boolean(authorId && article.authorId === authorId);
      if (isAdmin || isOwner) {
        return article;
      }
      if (article.visibility === 'private') {
        return null;
      }
      if (article.status === 'approved') {
        return article;
      }
      return null;
    }
    return null;
  } catch (error) {
    console.warn('Firestore fetchArticleBySlug error:', error);
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
    visibility: articleData.visibility || 'public',
    isAiAssisted: Boolean(articleData.isAiAssisted ?? (articleData.aiModel ? true : false)),
    aiModel: articleData.aiModel || (articleData.isAiAssisted ? 'ChatGPT (GPT-4o)' : undefined),
    aiPromptUsed: articleData.aiPromptUsed,
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

  const docRef = await addDoc(collection(db, ARTICLES_COLLECTION), cleanUndefined({
    ...newArticle,
    createdAt: new Date().toISOString(),
  }));

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

export async function updateArticleInFirestore(
  articleId: string,
  updatedData: Partial<Article>
): Promise<void> {
  const docRef = doc(db, ARTICLES_COLLECTION, articleId);
  const now = new Date().toISOString();
  await updateDoc(docRef, cleanUndefined({
    ...updatedData,
    updatedAt: now,
  }));
}

export async function deleteArticleInFirestore(articleId: string): Promise<void> {
  const docRef = doc(db, ARTICLES_COLLECTION, articleId);
  await deleteDoc(docRef);
}

export async function deleteVanpediaTermInFirestore(termId: string): Promise<void> {
  const docRef = doc(db, VANPEDIA_COLLECTION, termId);
  await deleteDoc(docRef);
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
    isAiAssisted: Boolean(termData.isAiAssisted ?? (termData.aiModel ? true : false)),
    aiModel: termData.aiModel || (termData.isAiAssisted ? 'ChatGPT (GPT-4o)' : undefined),
    status,
    authorName: termData.authorName || userEmail?.split('@')[0] || 'Contributor',
    authorEmail: userEmail,
    authorId: uid,
    createdAt: new Date().toISOString(),
    verifiedAt: isAuthorAdmin ? new Date().toISOString() : undefined,
  };

  const docRef = await addDoc(collection(db, VANPEDIA_COLLECTION), cleanUndefined(newTerm));
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

    // Sort by createdAt descending
    return firestoreQuestions.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
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

  const initialVoter = uid || 'author';

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
    votes: 1,
    votedBy: [initialVoter],
    answersCount: 0,
    status: 'open',
    answers: [],
  };

  const docRef = await addDoc(collection(db, QUESTIONS_COLLECTION), cleanUndefined(newQuestion));
  const created = { id: docRef.id, ...newQuestion } as CommunityIssue;

  // Q&A requirement: notify admin vanviolet.js@gmail.com
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

export async function toggleQuestionVoteInFirestore(
  questionId: string,
  userId = 'anon'
): Promise<{ votes: number; hasVoted: boolean }> {
  try {
    const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      let votedBy: string[] = Array.isArray(data.votedBy)
        ? [...data.votedBy]
        : Array.isArray(data.upvotedBy)
        ? [...data.upvotedBy]
        : [];
      let currentVotes: number = typeof data.votes === 'number' ? data.votes : votedBy.length;

      const alreadyVoted = votedBy.includes(userId);

      if (alreadyVoted) {
        votedBy = votedBy.filter(id => id !== userId);
        currentVotes = Math.max(0, currentVotes - 1);
      } else {
        votedBy.push(userId);
        currentVotes += 1;
      }

      await updateDoc(docRef, {
        votes: currentVotes,
        votedBy,
        upvotedBy: votedBy,
      });

      return { votes: currentVotes, hasVoted: !alreadyVoted };
    }
  } catch (error) {
    console.warn('toggleQuestionVoteInFirestore error:', error);
  }
  return { votes: 1, hasVoted: true };
}

export const upvoteQuestionInFirestore = toggleQuestionVoteInFirestore;

export async function addAnswerInFirestore(
  questionId: string,
  answerOrContent: string | IssueAnswer,
  user?: AuthUser | null
): Promise<IssueAnswer> {
  let newAnswer: IssueAnswer;

  if (typeof answerOrContent === 'object' && answerOrContent !== null) {
    newAnswer = {
      ...answerOrContent,
      votedBy: answerOrContent.votedBy || [],
    };
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
      votedBy: [],
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

export async function toggleAnswerVoteInFirestore(
  questionId: string,
  answerId: string,
  userId: string
): Promise<{ votes: number; hasVoted: boolean; answers: IssueAnswer[] }> {
  try {
    const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      const currentAnswers: IssueAnswer[] = Array.isArray(data.answers) ? [...data.answers] : [];
      let targetAnswerVotes = 0;
      let targetHasVoted = false;

      const updatedAnswers = currentAnswers.map(ans => {
        if (ans.id === answerId) {
          let votedBy: string[] = Array.isArray(ans.votedBy) ? [...ans.votedBy] : [];
          let currentVotes = typeof ans.votes === 'number' ? ans.votes : votedBy.length;
          const alreadyVoted = votedBy.includes(userId);

          if (alreadyVoted) {
            votedBy = votedBy.filter(id => id !== userId);
            currentVotes = Math.max(0, currentVotes - 1);
            targetHasVoted = false;
          } else {
            votedBy.push(userId);
            currentVotes += 1;
            targetHasVoted = true;
          }
          targetAnswerVotes = currentVotes;
          return {
            ...ans,
            votes: currentVotes,
            votedBy,
          };
        }
        return ans;
      });

      await updateDoc(docRef, { answers: updatedAnswers });
      return { votes: targetAnswerVotes, hasVoted: targetHasVoted, answers: updatedAnswers };
    }
  } catch (error) {
    console.warn('toggleAnswerVoteInFirestore error:', error);
  }
  return { votes: 0, hasVoted: false, answers: [] };
}

export async function acceptAnswerInFirestore(
  questionId: string,
  answerId: string,
  currentUserId?: string,
  currentUserEmail?: string,
  isAdminUser = false
): Promise<{ success: boolean; status: 'open' | 'solved'; solvedAnswerId?: string; message?: string }> {
  try {
    const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      const isQuestionAuthor =
        isAdminUser ||
        (currentUserId && data.authorId && currentUserId === data.authorId) ||
        (currentUserEmail && data.authorEmail && currentUserEmail.toLowerCase() === data.authorEmail.toLowerCase());

      if (!isQuestionAuthor) {
        return {
          success: false,
          status: data.status || 'open',
          message: 'Hanya pembuat pertanyaan atau administrator yang dapat menandai solusi.',
        };
      }

      const isCurrentlyAccepted = data.solvedAnswerId === answerId;
      const newStatus: 'open' | 'solved' = isCurrentlyAccepted ? 'open' : 'solved';
      const newSolvedId = isCurrentlyAccepted ? null : answerId;

      const updatedAnswers = (data.answers || []).map((ans: any) => ({
        ...ans,
        isAccepted: isCurrentlyAccepted ? false : ans.id === answerId,
      }));

      await updateDoc(docRef, {
        status: newStatus,
        solvedAnswerId: newSolvedId,
        answers: updatedAnswers,
      });

      return { success: true, status: newStatus, solvedAnswerId: newSolvedId || undefined };
    }
  } catch (error) {
    console.warn('Firestore acceptAnswer fallback:', error);
  }
  return { success: false, status: 'open' };
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

    // Sort by createdAt descending (newest first)
    return Array.from(commentMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    return initialCommentsData.filter(c => c.articleSlug === articleSlug);
  }
}

export async function addArticleCommentInFirestore(
  articleSlugOrComment: string | ArticleComment,
  commentData?: { content: string; authorName: string; replyToId?: string; replyToName?: string },
  user?: AuthUser | null
): Promise<ArticleComment> {
  let newComment: ArticleComment;

  if (typeof articleSlugOrComment === 'object') {
    newComment = {
      ...articleSlugOrComment,
      likedBy: articleSlugOrComment.likedBy || [],
      likes: articleSlugOrComment.likes || 0,
    };
  } else {
    newComment = {
      id: `com-${Date.now()}`,
      articleSlug: articleSlugOrComment,
      authorName: user?.displayName || commentData?.authorName || 'Guest Reader',
      authorAvatar: user?.photoURL || '',
      authorId: user?.uid || '',
      authorEmail: user?.email || '',
      content: commentData?.content || '',
      replyToId: commentData?.replyToId,
      replyToName: commentData?.replyToName,
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
    };
  }

  try {
    const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), cleanUndefined({
      ...newComment,
    }));
    newComment.id = docRef.id;
  } catch (error) {
    console.warn('Firestore addComment fallback:', error);
  }

  return newComment;
}

export async function toggleCommentLikeInFirestore(
  commentId: string,
  userIdOrAnon: string
): Promise<{ likes: number; hasLiked: boolean }> {
  try {
    const docRef = doc(db, COMMENTS_COLLECTION, commentId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      let likedBy: string[] = Array.isArray(data.likedBy) ? [...data.likedBy] : [];
      let currentLikes = typeof data.likes === 'number' ? data.likes : likedBy.length;
      const alreadyLiked = likedBy.includes(userIdOrAnon);

      if (alreadyLiked) {
        likedBy = likedBy.filter(id => id !== userIdOrAnon);
        currentLikes = Math.max(0, currentLikes - 1);
      } else {
        likedBy.push(userIdOrAnon);
        currentLikes += 1;
      }

      await updateDoc(docRef, {
        likes: currentLikes,
        likedBy,
      });

      return { likes: currentLikes, hasLiked: !alreadyLiked };
    }
  } catch (error) {
    console.warn('toggleCommentLikeInFirestore error:', error);
  }
  return { likes: 0, hasLiked: false };
}

// ==========================================
// ARTICLE LIKES SERVICE (DATABASE PERSISTED)
// ==========================================

export async function fetchArticleLikeStats(
  slug: string,
  userIdOrAnon: string
): Promise<{ likes: number; hasLiked: boolean }> {
  const localKey = `article_likes_store_${slug}`;
  let localData: { likes: number; likedBy: string[] } | null = null;
  try {
    const saved = localStorage.getItem(localKey);
    if (saved) localData = JSON.parse(saved);
  } catch (e) {
    // Ignore JSON errors
  }

  try {
    const docRef = doc(db, ARTICLE_LIKES_COLLECTION, slug);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      const likedBy: string[] = Array.isArray(data.likedBy) ? data.likedBy : [];
      const likes: number = typeof data.likes === 'number' ? data.likes : likedBy.length;
      const res = {
        likes: Math.max(likes, likedBy.length),
        hasLiked: likedBy.includes(userIdOrAnon),
      };
      try {
        localStorage.setItem(localKey, JSON.stringify({ likes: res.likes, likedBy }));
      } catch (e) {}
      return res;
    }

    if (localData) {
      return {
        likes: localData.likes,
        hasLiked: localData.likedBy.includes(userIdOrAnon),
      };
    }

    const local = articlesData.find(a => a.slug === slug);
    const baseLikes = local?.likes || 0;
    return { likes: baseLikes, hasLiked: false };
  } catch (error) {
    console.warn('fetchArticleLikeStats offline/fallback mode:', error);
    if (localData) {
      return {
        likes: localData.likes,
        hasLiked: localData.likedBy.includes(userIdOrAnon),
      };
    }
    const local = articlesData.find(a => a.slug === slug);
    return { likes: local?.likes || 0, hasLiked: false };
  }
}

export async function toggleArticleLikeInFirestore(
  slug: string,
  userIdOrAnon: string
): Promise<{ likes: number; hasLiked: boolean }> {
  const localKey = `article_likes_store_${slug}`;
  let localData: { likes: number; likedBy: string[] } = { likes: 0, likedBy: [] };
  try {
    const saved = localStorage.getItem(localKey);
    if (saved) localData = JSON.parse(saved);
  } catch (e) {}

  try {
    const docRef = doc(db, ARTICLE_LIKES_COLLECTION, slug);
    const snap = await getDoc(docRef);

    let likedBy: string[] = [];
    let currentLikes = 0;

    if (snap.exists()) {
      const data = snap.data();
      likedBy = Array.isArray(data.likedBy) ? [...data.likedBy] : [];
      currentLikes = typeof data.likes === 'number' ? data.likes : likedBy.length;
    } else {
      const local = articlesData.find(a => a.slug === slug);
      currentLikes = localData.likes || local?.likes || 0;
      likedBy = localData.likedBy || [];
    }

    const alreadyLiked = likedBy.includes(userIdOrAnon);

    if (alreadyLiked) {
      likedBy = likedBy.filter(id => id !== userIdOrAnon);
      currentLikes = Math.max(0, currentLikes - 1);
    } else {
      likedBy.push(userIdOrAnon);
      currentLikes += 1;
    }

    try {
      localStorage.setItem(localKey, JSON.stringify({ likes: currentLikes, likedBy }));
    } catch (e) {}

    // Async setDoc without blocking or throwing if offline
    setDoc(
      docRef,
      {
        slug,
        likes: currentLikes,
        likedBy,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    ).catch(err => {
      console.warn('Firestore article like sync offline/background:', err);
    });

    return { likes: currentLikes, hasLiked: !alreadyLiked };
  } catch (error) {
    console.warn('toggleArticleLikeInFirestore offline/fallback mode:', error);
    const alreadyLiked = localData.likedBy.includes(userIdOrAnon);
    let likedBy = [...localData.likedBy];
    const defaultLikes = articlesData.find(a => a.slug === slug)?.likes || 0;
    let currentLikes = typeof localData.likes === 'number' ? localData.likes : defaultLikes;

    if (alreadyLiked) {
      likedBy = likedBy.filter(id => id !== userIdOrAnon);
      currentLikes = Math.max(0, currentLikes - 1);
    } else {
      likedBy.push(userIdOrAnon);
      currentLikes += 1;
    }
    try {
      localStorage.setItem(localKey, JSON.stringify({ likes: currentLikes, likedBy }));
    } catch (e) {}
    return { likes: currentLikes, hasLiked: !alreadyLiked };
  }
}

// ==========================================
// CONTENT REPORTS SERVICE (ERRORS & IRREGULARITIES)
// ==========================================

export async function submitContentReportInFirestore(reportData: {
  contentType: 'article' | 'vanpedia' | 'question';
  contentSlug: string;
  contentTitle: string;
  reason: 'incorrect_info' | 'math_error' | 'typo' | 'copyright' | 'inappropriate' | 'other';
  reasonLabel?: string;
  details: string;
  reporterName?: string;
  reporterEmail?: string;
  reporterId?: string;
}): Promise<ContentReport> {
  const newReport: Omit<ContentReport, 'id'> = {
    ...reportData,
    reporterEmail: reportData.reporterEmail || 'anonymous@vanviolet.my.id',
    createdAt: new Date().toISOString(),
    status: 'pending',
  };

  let createdReport: ContentReport;

  try {
    const docRef = await addDoc(collection(db, REPORTS_COLLECTION), newReport);
    createdReport = { id: docRef.id, ...newReport };
  } catch (error) {
    console.warn('Firestore report write fallback:', error);
    createdReport = { id: `rep-${Date.now()}`, ...newReport };
  }

  // Dispatch email notification to vanviolet.js@gmail.com
  notifyAdminContentReport({
    contentType: reportData.contentType,
    contentSlug: reportData.contentSlug,
    contentTitle: reportData.contentTitle,
    reason: reportData.reasonLabel || reportData.reason,
    details: reportData.details,
    reporterName: reportData.reporterName || 'Anonymous Reader',
    reporterEmail: reportData.reporterEmail || 'anonymous@vanviolet.my.id',
  }).catch(err => console.error('Email report notify error:', err));

  return createdReport;
}

// ==========================================
// CONTACT MESSAGES SERVICE
// ==========================================

export interface ContactMessageRecord {
  id?: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  userId?: string;
  isLoggedIn?: boolean;
  createdAt?: string;
}

export async function submitContactMessageInFirestore(data: {
  name: string;
  email: string;
  topic: string;
  message: string;
  user?: AuthUser | null;
}): Promise<{ success: boolean; id: string }> {
  const payload: ContactMessageRecord = {
    name: data.name.trim(),
    email: data.email.trim(),
    topic: data.topic,
    message: data.message.trim(),
    userId: data.user?.uid || undefined,
    isLoggedIn: Boolean(data.user),
    createdAt: new Date().toISOString(),
  };

  let msgId = `msg-${Date.now()}`;

  try {
    const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), payload);
    msgId = docRef.id;
  } catch (e) {
    console.warn('Firestore message write fallback:', e);
  }

  // Automatically dispatch email notification to vanviolet.js@gmail.com
  const emailSent = await sendContactMessageEmail({
    name: payload.name,
    email: payload.email,
    topic: payload.topic,
    message: payload.message,
    userId: payload.userId,
    isLoggedIn: payload.isLoggedIn,
  });

  return { success: true, id: msgId };
}

export async function fetchContentReportsFromFirestore(): Promise<ContentReport[]> {
  try {
    const colRef = collection(db, REPORTS_COLLECTION);
    const snap = await getDocs(colRef);

    const reports = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    })) as ContentReport[];

    // Sort descending by date
    return reports.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.warn('fetchContentReportsFromFirestore error:', error);
    return [];
  }
}

export async function updateContentReportStatusInFirestore(
  reportId: string,
  newStatus: 'resolved' | 'dismissed',
  adminEmail: string
): Promise<void> {
  const docRef = doc(db, REPORTS_COLLECTION, reportId);
  await updateDoc(docRef, {
    status: newStatus,
    resolvedAt: new Date().toISOString(),
    resolvedBy: adminEmail,
  });
}

// ==========================================
// SEEDING SERVICE (INITIAL DATA TO FIRESTORE)
// ==========================================

export interface SeedResult {
  articlesInserted: number;
  vanpediaInserted: number;
  errors: string[];
}

export async function seedArticlesToFirestore(adminUser?: AuthUser | null): Promise<{ inserted: number; errors: string[] }> {
  let inserted = 0;
  const errors: string[] = [];

  for (const article of articlesData) {
    try {
      const docRef = doc(db, ARTICLES_COLLECTION, article.slug);
      await setDoc(docRef, {
        ...article,
        status: 'approved',
        authorId: adminUser?.uid || 'admin-seed',
        authorEmail: adminUser?.email || ADMIN_EMAIL,
        author: {
          id: adminUser?.uid || 'author-irvan',
          name: adminUser?.displayName || 'Muchamad Irvan',
          avatar: adminUser?.photoURL || '/images/favicon.png',
        },
        seededAt: serverTimestamp(),
      }, { merge: true });
      inserted++;
    } catch (e: any) {
      console.error(`Failed to seed article "${article.slug}":`, e);
      errors.push(`Article ${article.slug}: ${e.message}`);
    }
  }

  return { inserted, errors };
}

export async function seedVanpediaToFirestore(adminUser?: AuthUser | null): Promise<{ inserted: number; errors: string[] }> {
  let inserted = 0;
  const errors: string[] = [];

  for (const term of vanpediaTermsData) {
    try {
      const docRef = doc(db, VANPEDIA_COLLECTION, term.slug);
      await setDoc(docRef, {
        ...term,
        status: 'approved',
        authorId: adminUser?.uid || 'admin-seed',
        authorEmail: adminUser?.email || ADMIN_EMAIL,
        author: {
          id: adminUser?.uid || 'author-irvan',
          name: adminUser?.displayName || 'Muchamad Irvan',
          avatar: adminUser?.photoURL || '/images/favicon.png',
        },
        seededAt: serverTimestamp(),
      }, { merge: true });
      inserted++;
    } catch (e: any) {
      console.error(`Failed to seed vanpedia "${term.slug}":`, e);
      errors.push(`Vanpedia ${term.slug}: ${e.message}`);
    }
  }

  return { inserted, errors };
}

export async function seedAllToFirestore(adminUser?: AuthUser | null): Promise<SeedResult> {
  const [artRes, vanRes] = await Promise.all([
    seedArticlesToFirestore(adminUser),
    seedVanpediaToFirestore(adminUser),
  ]);

  return {
    articlesInserted: artRes.inserted,
    vanpediaInserted: vanRes.inserted,
    errors: [...artRes.errors, ...vanRes.errors],
  };
}
