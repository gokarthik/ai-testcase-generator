const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.post('/generate', async (req, res) => {

    console.log('Request received');

    const prompt = req.body.prompt;

    console.log('Prompt:', prompt);

    try {

        console.log('Sending request to Ollama');

        const response = await fetch('http://127.0.0.1:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'phi3',
                prompt: `Give only 5 short QA test cases for: ${prompt}`,
                stream: false
            })
        });

        console.log('Received response from Ollama');

        const data = await response.json();

        console.log('Sending response back to browser');

        res.json({
            result: data.response
        });

    } catch (error) {

        console.error('ERROR OCCURRED');
        console.error(error);

        res.status(500).json({
            error: 'Something went wrong'
        });
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});