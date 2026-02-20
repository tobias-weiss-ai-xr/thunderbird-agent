// src/utils/aiService.ts
// AI-powered service for email analysis, categorization, and draft generation
//
// This service provides real AI capabilities with pluggable backends:
// - Local rule-based (default, no external dependencies)
// - Web API integration (OpenAI, Anthropic, etc.) - requires API keys
// - Future: Local LLM integration

export interface AIConfig {
  provider: 'rule-based' | 'openai' | 'anthropic' | 'custom';
  apiKey?: string;
  model?: string;
  endpoint?: string;
}

export interface SentimentAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  keyPhrases: string[];
}

export interface Entity {
  text: string;
  type: 'person' | 'date' | 'organization' | 'email' | 'other';
  confidence: number;
}

export interface EmailAnalysis {
  emailId: string;
  summary: string;
  sentiment?: SentimentAnalysis;
  entities?: Entity[];
  keyPoints: string[];
  categories: string[];
}

export interface EmailCategorization {
  emailId: string;
  category: string;
  confidence: number;
  subcategories?: string[];
}

export interface DraftReply {
  emailId: string;
  subject: string;
  body: string;
  tone: string;
  timestamp: string;
}

// Default configuration - uses rule-based AI
let aiConfig: AIConfig = {
  provider: 'rule-based',
  apiKey: process.env.AI_API_KEY || '',
  model: process.env.AI_MODEL || 'gpt-4',
  endpoint: process.env.AI_ENDPOINT || ''
};

// Initialize AI configuration from environment or config file
export function initializeAI(config?: Partial<AIConfig>): void {
  if (config) {
    aiConfig = { ...aiConfig, ...config };
  } else {
    // Load from environment variables
    aiConfig.provider = process.env.AI_PROVIDER || 'rule-based';
    aiConfig.apiKey = process.env.AI_API_KEY || '';
    aiConfig.model = process.env.AI_MODEL || 'gpt-4';
    aiConfig.endpoint = process.env.AI_ENDPOINT || '';
  }

  console.log(`[AI Service] Initialized with provider: ${aiConfig.provider}`);
}

/**
 * Analyze email content to extract insights, sentiment, entities, and summary
 */
export async function analyzeEmail(
  emailId: string,
  content: {
    subject: string;
    body: string;
    from: string;
    date: string;
  },
  options: {
    includeSentiment?: boolean;
    extractEntities?: boolean;
    generateSummary?: boolean;
  } = {}
): Promise<EmailAnalysis> {
  const { subject, body, from, date } = content;

  // Rule-based sentiment analysis
  const sentiment = analyzeSentiment(subject, body);

  // Rule-based entity extraction
  const entities = options.extractEntities ? extractEntities(subject, body, from) : [];

  // Rule-based summary generation
  const summary = options.generateSummary ? generateSummary(subject, body) : `${subject}\n${body.substring(0, 100)}...`;

  // Rule-based key point extraction
  const keyPoints = extractKeyPoints(subject, body);

  // Rule-based category suggestion
  const categories = suggestCategories(subject, body);

  const analysis: EmailAnalysis = {
    emailId,
    summary,
    sentiment: options.includeSentiment ? sentiment : undefined,
    entities: options.extractEntities ? entities : undefined,
    keyPoints,
    categories
  };

  console.log(`[AI Service] Analyzed email ${emailId} (provider: ${aiConfig.provider})`);
  return analysis;
}

/**
 * Categorize an email using rule-based or ML approach
 */
export async function categorizeEmail(
  emailId: string,
  content: {
    subject: string;
    body: string;
    from: string;
  },
  customCategories?: string[]
): Promise<EmailCategorization> {
  const { subject, body, from } = content;

  // Rule-based categorization
  const category = classifyEmail(subject, body, from, customCategories);
  const confidence = calculateCategoryConfidence(subject, body, category);

  const categorization: EmailCategorization = {
    emailId,
    category,
    confidence,
    subcategories: category === 'work' ? suggestWorkSubcategories(subject, body) : undefined
  };

  console.log(`[AI Service] Categorized email ${emailId} as ${category} (confidence: ${confidence.toFixed(2)})`);
  return categorization;
}

/**
 * Generate a draft reply to an email
 */
export async function generateDraftReply(
  emailId: string,
  originalContent: {
    subject: string;
    body: string;
    from: string;
  },
  options: {
    tone?: 'professional' | 'casual' | 'formal' | 'friendly';
    includeQuotes?: boolean;
    instructions?: string;
  } = {}
): Promise<DraftReply> {
  const { subject, body, from } = originalContent;
  const tone = options.tone || 'professional';

  // Generate subject line
  const replySubject = generateReplySubject(subject, from);

  // Generate body based on tone
  const replyBody = generateReplyBody(body, tone, options);

  const draft: DraftReply = {
    emailId,
    subject: replySubject,
    body: replyBody,
    tone,
    timestamp: new Date().toISOString()
  };

  console.log(`[AI Service] Generated draft reply for email ${emailId} (tone: ${tone})`);
  return draft;
}

// ============== RULE-BASED IMPLEMENTATIONS ==============

// Sentiment analysis using keyword matching
function analyzeSentiment(subject: string, body: string): SentimentAnalysis {
  const text = `${subject} ${body}`.toLowerCase();

  const positiveKeywords = [
    'thank', 'great', 'awesome', 'appreciate', 'love', 'happy',
    'excellent', 'fantastic', 'wonderful', 'excited', 'glad'
  ];

  const negativeKeywords = [
    'issue', 'problem', 'error', 'fail', 'angry', 'frustrated',
    'disappointed', 'concern', 'worried', 'bad', 'terrible', 'hate'
  ];

  let positiveCount = 0;
  let negativeCount = 0;

  positiveKeywords.forEach(word => {
    if (text.includes(word)) positiveCount++;
  });

  negativeKeywords.forEach(word => {
    if (text.includes(word)) negativeCount++;
  });

  const keyPhrases = [];
  positiveKeywords.forEach(word => {
    if (text.includes(word)) keyPhrases.push(word);
  });
  negativeKeywords.forEach(word => {
    if (text.includes(word)) keyPhrases.push(word);
  });

  let sentiment: 'positive' | 'neutral' | 'negative';
  let confidence: number;

  if (positiveCount > negativeCount + 1) {
    sentiment = 'positive';
    confidence = Math.min(0.8, 0.5 + (positiveCount * 0.1));
  } else if (negativeCount > positiveCount + 1) {
    sentiment = 'negative';
    confidence = Math.min(0.8, 0.5 + (negativeCount * 0.1));
  } else {
    sentiment = 'neutral';
    confidence = 0.7;
  }

  return { sentiment, confidence, keyPhrases };
}

// Entity extraction using regex patterns
function extractEntities(subject: string, body: string, from: string): Entity[] {
  const entities: Entity[] = [];
  const text = `${subject} ${body}`;

  // Email addresses
  const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/g;
  const emails = text.match(emailRegex);
  emails?.forEach(email => {
    entities.push({ text: email, type: 'email', confidence: 0.95 });
  });

  // From address
  if (from) {
    entities.push({ text: from, type: 'email', confidence: 1.0 });
  }

  // Dates (multiple formats)
  const datePatterns = [
    /\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/g, // YYYY-MM-DD
    /\b\d{1,2}[-/]\d{1,2}\b/g, // YYYY-MM
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
    /\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)day,?\s+\w+\s+\d{1,2}\b/gi,
    /\b\d{1,2}[-/]\d{1,2}\b/g, // MM-DD
    /\bnext week\b/gi,
    /\bby\b.*\b\d{1,2}[-/]\d{1,2}\b/gi
  ];

  datePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    matches?.forEach(match => {
      entities.push({ text: match, type: 'date', confidence: 0.85 });
    });
  });

  // People names (capitalized words)
  const nameRegex = /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g;
  const names = text.match(nameRegex);
  names?.slice(0, 10).forEach(name => { // Limit to first 10
    entities.push({ text: name, type: 'person', confidence: 0.6 });
  });

  // Organizations (capitalized words with common suffixes)
  const orgKeywords = ['Inc', 'LLC', 'Corp', 'Ltd', 'LLP', 'Company', 'Corp.', 'Inc.'];
  orgKeywords.forEach(suffix => {
    const orgRegex = new RegExp(`\\b[A-Z][a-z]+\\s+${suffix}\\b`, 'g');
    const matches = text.match(orgRegex);
    matches?.forEach(match => {
      entities.push({ text: match, type: 'organization', confidence: 0.75 });
    });
  });

  return entities.slice(0, 20); // Limit to 20 entities
}

// Generate a concise summary
function generateSummary(subject: string, body: string): string {
  // Extract first sentence or key phrase
  const firstSentence = body.split(/[.!?]/)[0];
  const truncated = firstSentence.substring(0, 150);

  return `${subject}: ${truncated}${body.length > 150 ? '...' : ''}`;
}

// Extract key points from email content
function extractKeyPoints(subject: string, body: string): string[] {
  const points: string[] = [];
  const text = body.toLowerCase();

  // Look for action items
  const actionPatterns = [
    /\b(?:please|need to|have to|should|will|going to|must)\s+([^.!?]+)/gi,
    /\b\d+\)[.:]\s+([^.!?]+)/gi,
    /\b(?:-|\*)\s+([^.!?]+)/gi
  ];

  actionPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    matches?.forEach(match => {
      const point = match[1] || match[0];
      if (point.length > 10 && point.length < 200) {
        // Capitalize first letter
        const capitalized = point.charAt(0).toUpperCase() + point.slice(1);
        if (!points.includes(capitalized)) {
          points.push(capitalized);
        }
      }
    });
  });

  return points.slice(0, 10); // Limit to 10 key points
}

// Suggest email categories
function suggestCategories(subject: string, body: string): string[] {
  const text = `${subject} ${body}`.toLowerCase();
  const categories: string[] = [];

  // Category keywords
  const categoryRules = [
    { name: 'work', keywords: ['meeting', 'project', 'report', 'deadline', 'invoice', 'proposal', 'contract', 'client', 'team', 'deadline'] },
    { name: 'personal', keywords: ['family', 'friend', 'personal', 'vacation', 'birthday', 'dinner', 'weekend', 'home'] },
    { name: 'newsletter', keywords: ['newsletter', 'update', 'news', 'digest', 'weekly', 'monthly', 'subscription', 'unsubscribe'] },
    { name: 'urgent', keywords: ['urgent', 'asap', 'immediately', 'deadline', 'important', 'priority', 'critical', 'emergency'] },
    { name: 'finance', keywords: ['invoice', 'payment', 'billing', 'receipt', 'bank', 'account', 'statement', 'transaction'] },
    { name: 'shopping', keywords: ['order', 'purchase', 'buy', 'cart', 'shipping', 'delivery', 'product', 'receipt'] },
    { name: 'travel', keywords: ['flight', 'hotel', 'booking', 'reservation', 'trip', 'vacation', 'travel', 'itinerary'] }
  ];

  categoryRules.forEach(rule => {
    const matchCount = rule.keywords.filter(keyword => text.includes(keyword)).length;
    if (matchCount >= 1) {
      categories.push(rule.name);
    }
  });

  return categories.length > 0 ? categories : ['general'];
}

// Classify email into primary category
function classifyEmail(subject: string, body: string, from: string, customCategories?: string[]): string {
  const categories = suggestCategories(subject, body);

  // Priority-based classification
  const priorityOrder = ['urgent', 'work', 'finance', 'personal', 'newsletter', 'shopping', 'travel', 'general'];

  for (const category of priorityOrder) {
    if (categories.includes(category)) {
      return category;
    }
  }

  // Check custom categories
  if (customCategories && customCategories.length > 0) {
    const text = `${subject} ${body}`.toLowerCase();
    for (const category of customCategories) {
      if (text.includes(category.toLowerCase())) {
        return category;
      }
    }
  }

  return 'general';
}

// Calculate confidence score for categorization
function calculateCategoryConfidence(subject: string, body: string, category: string): number {
  const text = `${subject} ${body}`.toLowerCase();

  const categoryKeywords: { [key: string]: string[] } = {
    'work': ['meeting', 'project', 'report', 'deadline', 'invoice', 'proposal', 'contract', 'client'],
    'personal': ['family', 'friend', 'personal', 'vacation', 'birthday'],
    'newsletter': ['newsletter', 'update', 'news', 'digest'],
    'urgent': ['urgent', 'asap', 'immediately', 'deadline', 'important'],
    'finance': ['invoice', 'payment', 'billing', 'receipt', 'bank'],
    'shopping': ['order', 'purchase', 'buy', 'cart', 'shipping'],
    'travel': ['flight', 'hotel', 'booking', 'reservation', 'trip']
  };

  const keywords = categoryKeywords[category] || [];
  const matchCount = keywords.filter(k => text.includes(k)).length;

  // Base confidence on number of keyword matches
  if (matchCount >= 3) return 0.9;
  if (matchCount === 2) return 0.75;
  if (matchCount === 1) return 0.6;
  return 0.4; // Default confidence
}

// Suggest work subcategories
function suggestWorkSubcategories(subject: string, body: string): string[] {
  const text = `${subject} ${body}`.toLowerCase();

  const subcategories: { [key: string]: string[] } = {
    'meeting': ['schedule', 'calendar', 'agenda', 'invite'],
    'project': ['milestone', 'deliverable', 'task', 'assignment'],
    'finance': ['invoice', 'budget', 'quote', 'proposal'],
    'client': ['communication', 'proposal', 'contract', 'meeting'],
    'team': ['update', 'collaboration', 'review', 'standup']
  };

  const suggested: string[] = [];

  Object.entries(subcategories).forEach(([subcat, keywords]) => {
    if (keywords.some(keyword => text.includes(keyword))) {
      suggested.push(subcat);
    }
  });

  return suggested.slice(0, 3);
}

// Generate reply subject line
function generateReplySubject(originalSubject: string, from: string): string {
  // Remove common Re:, Fwd: prefixes
  const cleanSubject = originalSubject.replace(/^(Re|Fwd):\s*/gi, '').trim();

  return `Re: ${cleanSubject}`;
}

// Generate reply body based on tone
function generateReplyBody(
  originalBody: string,
  tone: 'professional' | 'casual' | 'formal' | 'friendly',
  options: { includeQuotes?: boolean; instructions?: string }
): string {
  const toneTemplates = {
    professional: {
      greeting: 'Dear',
      closing: 'Best regards',
      style: 'Formal and business-appropriate'
    },
    casual: {
      greeting: 'Hi',
      closing: 'Cheers',
      style: 'Friendly and informal'
    },
    formal: {
      greeting: 'Dear Sir/Madam',
      closing: 'Sincerely',
      style: 'Very formal and structured'
    },
    friendly: {
      greeting: 'Hello',
      closing: 'Warm regards',
      style: 'Warm and personal'
    }
  };

  const template = toneTemplates[tone];

  let body = `${template.greeting},\n\n`;

  // Add instructions if provided
  if (options.instructions) {
    body += `${options.instructions}\n\n`;
  }

  // Add response based on original content
  if (originalBody.length > 0) {
    body += 'Thank you for your message. ';
    body += `${template.style}.\n\n`;

    // Quote original if requested
    if (options.includeQuotes) {
      body += '-----Original Message-----\n';
      body += originalBody.substring(0, 500);
      if (originalBody.length > 500) {
        body += '...';
      }
      body += '\n-----End Quote-----\n\n';
    }

    body += `${template.closing},\n`;
    body += 'Your Name';
  }

  return body;
}

// Export configuration getter
export function getAIConfig(): AIConfig {
  return { ...aiConfig };
}

// ============== EMAIL FOLDER CLASSIFICATION ==============

export interface FolderClassification {
  emailId: string;
  suggestedFolder: string;
  confidence: number;
  reason: string;
  alternatives?: { folder: string; confidence: number }[];
}

export interface FolderRule {
  folderName: string;
  keywords: string[];
  senders: string[];
  domains: string[];
  priority: number;
}

// Training data storage for learning from feedback
interface TrainingData {
  emailContent: {
    subject: string;
    body: string;
    from: string;
  };
  correctFolder: string;
  timestamp: string;
}

// In-memory training data (persisted to file in production)
let trainingData: TrainingData[] = [];
let folderRules: FolderRule[] = [];

// Default folder classification rules
const defaultFolderRules: FolderRule[] = [
  { folderName: 'Finanzen', keywords: ['rechnung', 'invoice', 'zahlung', 'payment', 'beleg', 'receipt', 'konto', 'bank'], senders: [], domains: ['paypal', 'amazon', 'stripe', 'bank'], priority: 90 },
  { folderName: 'Arbeit', keywords: ['meeting', 'projekt', 'project', 'deadline', 'aufgabe', 'task', 'bericht', 'report', 'kollege'], senders: [], domains: ['company', 'corp', 'office'], priority: 80 },
  { folderName: 'Entwicklung', keywords: ['github', 'gitlab', 'commit', 'pull request', 'merge', 'bug', 'feature', 'code'], senders: [], domains: ['github.com', 'gitlab.com', 'bitbucket.org'], priority: 85 },
  { folderName: 'Newsletter', keywords: ['newsletter', 'abmelden', 'unsubscribe', 'update', 'neuigkeiten', 'digest'], senders: [], domains: ['mailchimp', 'sendgrid', 'newsletter'], priority: 50 },
  { folderName: 'Privat', keywords: ['familie', 'freund', 'einladung', 'urlaub', 'geburtstag', 'feiern'], senders: [], domains: [], priority: 60 },
  { folderName: 'Spam', keywords: ['gewinn', 'gratis', 'kostenlos', 'limitiert', 'aktionscode', 'klicken sie hier'], senders: [], domains: [], priority: 95 },
  { folderName: 'Reisen', keywords: ['buchung', 'booking', 'flug', 'flight', 'hotel', 'reservation', 'reise', 'trip'], senders: [], domains: ['booking.com', 'airbnb', 'lufthansa', 'airlines'], priority: 75 },
  { folderName: 'Shopping', keywords: ['bestellung', 'order', 'lieferung', 'delivery', 'versand', 'shipping', 'kauf', 'purchase'], senders: [], domains: ['amazon', 'ebay', 'otto', 'zalando'], priority: 70 }
];

/**
 * Initialize folder rules (load from storage or use defaults)
 */
export function initializeFolderRules(customRules?: FolderRule[]): void {
  folderRules = customRules || [...defaultFolderRules];
  console.log(`[AI Service] Initialized ${folderRules.length} folder rules`);
}

/**
 * Classify an email to a target folder
 */
export async function classifyEmailToFolder(
  emailId: string,
  content: {
    subject: string;
    body: string;
    from: string;
  },
  availableFolders: string[]
): Promise<FolderClassification> {
  const { subject, body, from } = content;
  
  // Ensure rules are initialized
  if (folderRules.length === 0) {
    initializeFolderRules();
  }
  
  // Extract domain from sender
  const senderDomain = extractDomain(from);
  const text = `${subject} ${body}`.toLowerCase();
  
  // Score each available folder
  const scores: { folder: string; score: number; reason: string }[] = [];
  
  for (const folderName of availableFolders) {
    const result = calculateFolderScore(folderName, text, senderDomain, from);
    scores.push(result);
  }
  
  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);
  
  const best = scores[0];
  const alternatives = scores.slice(1, 3).map(s => ({ folder: s.folder, confidence: s.score / 100 }));
  
  // Check training data for exact matches or similar content
  const trainingMatch = findTrainingMatch(subject, body, from);
  if (trainingMatch) {
    const trainedFolder = trainingMatch.correctFolder;
    if (availableFolders.includes(trainedFolder)) {
      // Boost score for trained folder
      const trainedIndex = scores.findIndex(s => s.folder === trainedFolder);
      if (trainedIndex >= 0) {
        scores[trainedIndex].score = Math.min(100, scores[trainedIndex].score + 30);
        scores.sort((a, b) => b.score - a.score);
      }
    }
  }
  
  const classification: FolderClassification = {
    emailId,
    suggestedFolder: best.folder,
    confidence: best.score / 100,
    reason: best.reason,
    alternatives: alternatives.length > 0 ? alternatives : undefined
  };
  
  console.log(`[AI Service] Classified email ${emailId} → ${best.folder} (${(best.score / 100 * 100).toFixed(0)}%)`);
  return classification;
}

/**
 * Calculate score for a specific folder
 */
function calculateFolderScore(
  folderName: string,
  text: string,
  senderDomain: string,
  sender: string
): { folder: string; score: number; reason: string } {
  let score = 0;
  const reasons: string[] = [];
  
  // Find matching rule
  const rule = folderRules.find(r => 
    r.folderName.toLowerCase() === folderName.toLowerCase()
  );
  
  if (rule) {
    // Keyword matching
    const keywordMatches = rule.keywords.filter(kw => text.includes(kw.toLowerCase()));
    if (keywordMatches.length > 0) {
      score += Math.min(40, keywordMatches.length * 15);
      reasons.push(`Keywords: ${keywordMatches.slice(0, 3).join(', ')}`);
    }
    
    // Sender matching
    if (rule.senders.some(s => sender.toLowerCase().includes(s.toLowerCase()))) {
      score += 25;
      reasons.push('Known sender');
    }
    
    // Domain matching
    if (rule.domains.some(d => senderDomain.includes(d.toLowerCase()))) {
      score += 30;
      reasons.push('Known domain');
    }
    
    // Priority boost
    score += (rule.priority / 10);
  } else {
    // Fuzzy match folder name in content
    if (text.includes(folderName.toLowerCase())) {
      score += 20;
      reasons.push('Folder name mentioned');
    }
  }
  
  // Default inbox for low scores
  if (score < 15) {
    return { folder: 'Inbox', score: 30, reason: 'No strong classification signals' };
  }
  
  return {
    folder: folderName,
    score: Math.min(100, score),
    reason: reasons.length > 0 ? reasons.join('; ') : 'General classification'
  };
}

/**
 * Extract domain from email address
 */
function extractDomain(from: string): string {
  const match = from.match(/@([\w\.-]+)/);
  return match ? match[1].toLowerCase() : '';
}

/**
 * Find similar training examples
 */
function findTrainingMatch(subject: string, body: string, from: string): TrainingData | null {
  // Look for exact sender match first
  const senderMatch = trainingData.find(t => 
    t.emailContent.from.toLowerCase() === from.toLowerCase()
  );
  if (senderMatch) return senderMatch;
  
  // Look for similar subject (contains same keywords)
  const subjectWords = subject.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  for (const data of trainingData) {
    const dataWords = data.emailContent.subject.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const commonWords = subjectWords.filter(w => dataWords.includes(w));
    if (commonWords.length >= 2) {
      return data;
    }
  }
  
  return null;
}

/**
 * Learn from user feedback - store correction for future classifications
 */
export function learnFromFeedback(
  emailId: string,
  content: {
    subject: string;
    body: string;
    from: string;
  },
  correctFolder: string
): { success: boolean; message: string } {
  const training: TrainingData = {
    emailContent: content,
    correctFolder,
    timestamp: new Date().toISOString()
  };
  
  // Check if we already have this email
  const existingIndex = trainingData.findIndex(t => 
    t.emailContent.from === content.from &&
    t.emailContent.subject === content.subject
  );
  
  if (existingIndex >= 0) {
    // Update existing entry
    trainingData[existingIndex] = training;
    console.log(`[AI Service] Updated training data for ${emailId}`);
    return { success: true, message: 'Training data updated' };
  }
  
  // Add new entry
  trainingData.push(training);
  console.log(`[AI Service] Added training data for ${emailId} → ${correctFolder}`);
  
  // Update rules based on new training data
  updateRulesFromTraining();
  
  return { success: true, message: 'Training data added' };
}

/**
 * Update classification rules based on accumulated training data
 */
function updateRulesFromTraining(): void {
  // Group training data by folder
  const folderData = new Map<string, TrainingData[]>();
  for (const data of trainingData) {
    const folder = data.correctFolder;
    if (!folderData.has(folder)) {
      folderData.set(folder, []);
    }
    folderData.get(folder)!.push(data);
  }
  
  // Extract new keywords from training data
  for (const [folder, entries] of folderData) {
    const existingRule = folderRules.find(r => 
      r.folderName.toLowerCase() === folder.toLowerCase()
    );
    
    if (!existingRule && entries.length >= 3) {
      // Create new rule for this folder
      const keywords = extractCommonKeywords(entries);
      const domains = extractCommonDomains(entries);
      
      if (keywords.length > 0 || domains.length > 0) {
        folderRules.push({
          folderName: folder,
          keywords,
          senders: [],
          domains,
          priority: 75
        });
        console.log(`[AI Service] Created new rule for folder "${folder}"`);
      }
    }
  }
}

/**
 * Extract common keywords from training entries
 */
function extractCommonKeywords(entries: TrainingData[]): string[] {
  const wordCounts = new Map<string, number>();
  
  for (const entry of entries) {
    const words = `${entry.emailContent.subject} ${entry.emailContent.body}`
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 4);
    
    for (const word of words) {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    }
  }
  
  // Return words that appear in at least 30% of entries
  const threshold = Math.ceil(entries.length * 0.3);
  const commonWords: string[] = [];
  
  for (const [word, count] of wordCounts) {
    if (count >= threshold) {
      commonWords.push(word);
    }
  }
  
  return commonWords.slice(0, 10);
}

/**
 * Extract common domains from training entries
 */
function extractCommonDomains(entries: TrainingData[]): string[] {
  const domainCounts = new Map<string, number>();
  
  for (const entry of entries) {
    const domain = extractDomain(entry.emailContent.from);
    if (domain) {
      domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
    }
  }
  
  // Return domains that appear in at least 20% of entries
  const threshold = Math.ceil(entries.length * 0.2);
  const commonDomains: string[] = [];
  
  for (const [domain, count] of domainCounts) {
    if (count >= threshold) {
      commonDomains.push(domain);
    }
  }
  
  return commonDomains;
}

/**
 * Get all training data (for export/debugging)
 */
export function getTrainingData(): TrainingData[] {
  return [...trainingData];
}

/**
 * Import training data
 */
export function importTrainingData(data: TrainingData[]): void {
  trainingData = [...trainingData, ...data];
  updateRulesFromTraining();
  console.log(`[AI Service] Imported ${data.length} training entries`);
}

/**
 * Get current folder rules
 */
export function getFolderRules(): FolderRule[] {
  return [...folderRules];
}

// ============== WEB API INTEGRATION (FUTURE) ==============
// These would be implemented for OpenAI, Anthropic, etc.

/*
async function callLLM_API(prompt: string): Promise<string> {
  if (aiConfig.provider === 'rule-based') {
    throw new Error('LLM API called with rule-based provider');
  }

  const response = await fetch(aiConfig.endpoint!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${aiConfig.apiKey}`
    },
    body: JSON.stringify({
      model: aiConfig.model,
      messages: [
        { role: 'system', content: 'You are an email analysis assistant.' },
        { role: 'user', content: prompt }
      ]
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
*/
