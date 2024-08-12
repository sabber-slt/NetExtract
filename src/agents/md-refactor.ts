import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL_NAME = 'gemma2-9b-it';

if (!GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY is not set in the environment variables');
}

const groq = new Groq({ apiKey: GROQ_API_KEY });

/**
 * @returns {string} The generated prompt
 */
const generatePrompt = (): string => `
As an AI model specializing in content rewriting using Markdown, your task is to generate detailed and informative responses that enhance the given input. Make effective use of Markdown formatting to structure your response clearly and comprehensively. Aim to provide thorough and complete information, avoiding unnecessary brevity.

Begin by creating a Markdown header that includes the following elements: title, description, URL, and today's date. Then, proceed to rewrite all the provided content in a well-organized Markdown format.

Today's date is ${new Date().toISOString()}.
`;

/**
 * @param {string} content The content to be processed
 * @returns {Promise<string>} The processed markdown content
 * @throws {Error} If the API call fails
 */
export const md_refactor = async (content: string): Promise<string> => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `${generatePrompt()}\n\n <content>${content}</content>`,
        },
      ],
      model: MODEL_NAME,
    });

    const markdown = chatCompletion.choices[0]?.message?.content;

    if (!markdown) {
      throw new Error('No content generated from the API');
    }

    return markdown;
  } catch (error) {
    console.error('Error in twitterAgent:', error);
    throw new Error('Failed to process content with the Twitter agent');
  }
};
