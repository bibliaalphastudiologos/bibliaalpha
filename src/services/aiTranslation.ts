import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function translateChapterText(bookId: string, chapter: number, verses: any[]): Promise<any[]> {
  const cacheKey = `bible_pt_${bookId}_${chapter}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  // Extract text to translate
  const textsToTranslate: string[] = [];
  verses.forEach(v => {
    if (v.type === 'verse' && Array.isArray(v.content)) {
      v.content.forEach((segment: any) => {
        if (typeof segment === 'string') textsToTranslate.push(segment);
      });
    }
  });

  if (textsToTranslate.length === 0) return verses;

  const prompt = `Translate the following array of Bible text segments from English to Portuguese.
Maintain the exact tone, accuracy, and reverence of a standard Portuguese Bible translation (like João Ferreira de Almeida ou NVI).
Return ONLY a valid JSON array of strings in the exact same order, with exactly ${textsToTranslate.length} elements.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Use correct model alias
      contents: [prompt, JSON.stringify(textsToTranslate)],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const translatedTexts: string[] = JSON.parse(response.text.trim());
    
    // Reconstruct the verses with translated text
    let textIndex = 0;
    const translatedVerses = verses.map(v => {
      if (v.type === 'verse' && Array.isArray(v.content)) {
        return {
          ...v,
          content: v.content.map((segment: any) => {
            if (typeof segment === 'string') {
              return translatedTexts[textIndex++] || segment;
            }
            return segment;
          })
        };
      }
      return v;
    });

    localStorage.setItem(cacheKey, JSON.stringify(translatedVerses));
    return translatedVerses;
  } catch (error) {
    console.error("Translation error:", error);
    return verses; // fallback to English
  }
}

export async function translateCommentaries(bookId: string, chapter: number, verseNumber: number, commentaries: any[]): Promise<any[]> {
  const cacheKey = `comments_pt_${bookId}_${chapter}_${verseNumber}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  const textsToTranslate: string[] = [];
  commentaries.forEach(c => {
    c.texts.forEach((text: string) => textsToTranslate.push(text));
  });

  if (textsToTranslate.length === 0) return commentaries;

  const prompt = `Translate the following array of Bible commentary segments from English to Portuguese.
Maintain a scholarly and clear theological tone. 
Return ONLY a valid JSON array of Portuguese strings in the exact same order, with exactly ${textsToTranslate.length} elements.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [prompt, JSON.stringify(textsToTranslate)],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const translatedTexts: string[] = JSON.parse(response.text.trim());
    
    let textIndex = 0;
    const translatedCommentaries = commentaries.map(c => ({
      ...c,
      texts: c.texts.map(() => translatedTexts[textIndex++] || "")
    }));

    localStorage.setItem(cacheKey, JSON.stringify(translatedCommentaries));
    return translatedCommentaries;
  } catch (error) {
    console.error("Translation error:", error);
    return commentaries; // fallback to English
  }
}
