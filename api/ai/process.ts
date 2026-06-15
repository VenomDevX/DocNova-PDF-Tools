import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import pdfParse from 'pdf-parse';

// Initialize Gemini (automatically uses process.env.GEMINI_API_KEY)
const ai = new GoogleGenAI({});

// Simple in-memory rate limiting (Best effort per-instance)
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10;
  
  let record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + windowMs };
    rateLimitMap.set(ip, record);
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count += 1;
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 0. Apply Rate Limit (10 requests per minute per IP)
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress || 'unknown';
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ error: 'Too many requests. Please try again in a minute.' });
    }

    // 1. Parse JSON body
    const { 
      fileBase64, 
      toolId,
      summaryLength,
      outputStyle,
      tone,
      language,
      includeKeyPoints,
      includeImportantDates,
      includeConclusion,
      includeActionItems,
      includePageReferences,
      includeSimpleExplanation
    } = req.body;
    
    if (!fileBase64) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // 2. Extract text from base64 PDF
    const buffer = Buffer.from(fileBase64, 'base64');
    const pdfData = await pdfParse(buffer);
    const documentText = pdfData.text;
    
    // 3. Extract Settings
    const requiredSections = [];
    if (includeKeyPoints === true || includeKeyPoints === 'true') requiredSections.push('Key Points');
    if (includeImportantDates === true || includeImportantDates === 'true') requiredSections.push('Important Dates');
    if (includeConclusion === true || includeConclusion === 'true') requiredSections.push('Main Conclusion');
    if (includeActionItems === true || includeActionItems === 'true') requiredSections.push('Action Items');
    if (includePageReferences === true || includePageReferences === 'true') requiredSections.push('Page References');
    if (includeSimpleExplanation === true || includeSimpleExplanation === 'true') requiredSections.push('Simple Explanation');

    // 4. Construct the Gemini Prompts dynamically based on toolId
    let systemInstruction = "";
    let additionalPrompt = "";

    switch (toolId) {
      case 'resume-analyzer':
        systemInstruction = "You are DocNova AI, an expert HR professional and Resume Analyzer. Score the resume, identify key strengths, list missing skills based on standard industry requirements, and provide actionable improvements.";
        break;
      case 'quiz-generator':
        systemInstruction = "You are DocNova AI, an expert educator. Generate a comprehensive multiple-choice quiz based ONLY on the provided document text. Include an answer key at the end.";
        break;
      case 'flashcards':
        systemInstruction = "You are DocNova AI, an expert study assistant. Generate a series of Flashcards (Question and Answer format) from the provided text to help the user memorize key concepts.";
        break;
      case 'translator':
        systemInstruction = `You are DocNova AI, an expert translator. Translate the following text into ${language || 'the requested language'}. Preserve the original formatting and meaning as much as possible.`;
        break;
      case 'contract-review':
        systemInstruction = "You are DocNova AI, an expert legal assistant. Review the provided contract. Highlight potential risks, loopholes, obligations, and key terms. Use simple language to explain complex legal jargon.";
        break;
      case 'table-extractor':
        systemInstruction = "You are DocNova AI. Your task is to identify any tabular or structured data in the text and format it cleanly into Markdown tables.";
        break;
      case 'pdf-chat':
        systemInstruction = "You are DocNova AI, an expert document assistant. Answer the user's questions based ONLY on the provided document text. If the answer is not in the text, say so.";
        additionalPrompt = "Please summarize the document briefly and suggest 3 questions the user could ask about it to start the chat.";
        break;
      default:
        // Default Summary Summarizer logic
        systemInstruction = "You are DocNova AI, an expert PDF summarization assistant. Summarize only from the provided document text. Do not invent information. If something is not found in the document, say it is not mentioned. Create a clear, structured, useful summary based on the user's selected settings. Format the output in clear Markdown.";
        break;
    }

    const userPrompt = `
      Document text:
      ${documentText.substring(0, 100000)}

      Settings:
      Tone: ${tone}
      Language: ${language}
      ${summaryLength ? `Summary length: ${summaryLength}` : ''}
      ${outputStyle ? `Output style: ${outputStyle}` : ''}

      Required sections to generate:
      ${requiredSections.length > 0 ? requiredSections.join('\n') : 'Generate standard output for this tool.'}
      
      ${additionalPrompt}
      
      Generate the result according to these settings. Use Markdown headers (##).
    `;

    // 5. Call Gemini 2.5 Flash
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2, // Low temperature for factual accuracy
      }
    });

    // 6. Return result to frontend
    return res.status(200).json({ 
      success: true, 
      result: response.text 
    });

  } catch (error) {
    console.error('Gemini Processing error:', error);
    return res.status(500).json({ error: 'Failed to process document' });
  }
}
