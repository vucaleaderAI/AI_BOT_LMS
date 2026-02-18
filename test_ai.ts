
import { config } from 'dotenv';
config({ path: '.env.local' });

import Anthropic from '@anthropic-ai/sdk';

async function test() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    console.log('Checking API Key:', apiKey ? `Present (${apiKey.slice(0, 10)}...)` : 'Missing');

    if (!apiKey) {
        console.error('API Key is missing from .env.local');
        return;
    }

    const anthropic = new Anthropic({ apiKey });

    console.log('Testing Anthropic client...');
    try {
        const message = await anthropic.messages.create({
            max_tokens: 100,
            messages: [{ role: 'user', content: 'Hello' }],
            model: 'claude-3-haiku-20240307',
        });
        console.log('Response:', message.content[0].type === 'text' ? message.content[0].text : 'No text');
    } catch (error) {
        console.error('Error:', error);
    }
}

test();
