const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

app.use(express.json());

const DEFAULT_MODEL = 'phi3';

app.get('/', (req, res) => {

    res.send('AI Test Case Generator Backend Running');
});

app.post('/generate', async (req, res) => {

    console.log('====================================');

    console.log('New generation request received');

    const prompt = req.body.prompt;

    const model =
        req.body.model || DEFAULT_MODEL;

    console.log('Model:', model);

    console.log('Prompt:', prompt);

    const startTime = Date.now();

    try {

        console.log('Sending streaming request to Ollama');

        const ollamaResponse = await fetch(
            'http://127.0.0.1:11434/api/generate',
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({

                    model: model,

                    prompt: `
You are a Senior QA Automation Engineer.

Generate exactly 5 concise and professional QA test cases.

Rules:
- Keep responses concise
- Avoid unnecessary explanations
- Include realistic edge cases
- Keep formatting consistent
- Focus on professional QA structure

Output format:

### Test Case 1
Scenario:
Steps:
Expected Result:

### Test Case 2
Scenario:
Steps:
Expected Result:

Feature:
${prompt}
                    `,

                    stream: true
                })
            }
        );

        console.log('Streaming response started');

        res.setHeader(
            'Content-Type',
            'text/plain'
        );

        res.setHeader(
            'Transfer-Encoding',
            'chunked'
        );

        const reader =
            ollamaResponse.body.getReader();

        const decoder =
            new TextDecoder();

        let completeResponse = '';

        while (true) {

            const { done, value } =
                await reader.read();

            if (done) {

                break;
            }

            const chunk =
                decoder.decode(value);

            const lines =
                chunk.split('\n');

            for (const line of lines) {

                if (!line.trim()) {

                    continue;
                }

                try {

                    const parsed =
                        JSON.parse(line);

                    if (parsed.response) {

                        completeResponse +=
                            parsed.response;

                        res.write(parsed.response);
                    }

                } catch (err) {

                    console.log(
                        'Chunk parse skipped'
                    );
                }
            }
        }

        const endTime = Date.now();

        const duration =
            ((endTime - startTime) / 1000)
            .toFixed(2);

        console.log(
            `Generation completed in ${duration}s`
        );

        console.log(
            `Response length: ${completeResponse.length}`
        );

        console.log('Streaming completed');

        res.end();

    } catch (error) {

        console.error('ERROR OCCURRED');

        console.error(error);

        res.status(500).send(
            'Failed to generate AI response'
        );
    }

    console.log('====================================');
});

app.listen(3000, () => {

    console.log('====================================');

    console.log('AI Test Case Generator Backend');

    console.log(`Default model: ${DEFAULT_MODEL}`);

    console.log('Streaming enabled');

    console.log('Server running on port 3000');

    console.log('====================================');
});