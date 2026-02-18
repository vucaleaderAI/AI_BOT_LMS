
import { config } from 'dotenv';
config({ path: '.env.local' });

import { GoogleGenAI } from '@google/genai';

async function test() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Checking API Key:', apiKey ? `Present (${apiKey.slice(0, 10)}...)` : 'Missing');

    if (!apiKey) {
        console.error('API Key is missing from .env.local');
        return;
    }

    const ai = new GoogleGenAI({ apiKey });

    console.log('Testing Gemini client...');
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Hello, say hi in one sentence.',
        });
        console.log('Response:', response.text);
    } catch (error) {
        console.error('Error:', error);
    }
}

test();
