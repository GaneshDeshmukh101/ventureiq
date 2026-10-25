
<?php
/**
 * VentureIQ – AI Chatbot API
 * Powered by Groq
 * Model: llama-3.3-70b-versatile
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle browser preflight requests.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Accept POST requests only.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Read and validate the request body.
$rawBody = file_get_contents('php://input');
$body = json_decode($rawBody, true);

if (!is_array($body)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON request']);
    exit;
}

$userMessage = trim($body['message'] ?? '');
$history = $body['history'] ?? [];

if ($userMessage === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Empty message']);
    exit;
}

if (!is_array($history)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid conversation history']);
    exit;
}

// Read the API key from the server environment.
// Never hardcode your API key in this file.
$apiKey = getenv('GROQ_API_KEY');

if (!$apiKey) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Groq API key is not configured on the server.'
    ]);
    exit;
}

// VentureBot system instructions.
$systemPrompt = <<<'SYSTEM'
You are VentureBot, an expert eCommerce business advisor built into
the VentureIQ platform.

Help users start, operate, and scale eCommerce businesses in India
and globally.

Topics:
1. Business setup: D2C, marketplaces, dropshipping, B2B, niche research,
   competitor analysis, sourcing, pricing, and supplier negotiation.

2. Legal and compliance in India:
   GST registration, business structures, Udyam registration, Shops and
   Establishments requirements, Import Export Code, trademarks, FSSAI,
   BIS, Legal Metrology, consumer protection, privacy, and payment
   gateway KYC.

3. Platforms and technology:
   Shopify, WooCommerce, Amazon, Flipkart, website development,
   payment gateways, logistics, and shipping integrations.

4. Marketing:
   SEO, Google Ads, Meta Ads, influencer marketing, WhatsApp Commerce,
   email campaigns, and social media strategy.

5. Finance:
   Investment planning, profit margins, working capital, accounting,
   GST filing, and business tax considerations.

6. Scaling:
   Warehousing, third-party logistics, recruitment, automation,
   and international expansion.

Guidelines:
- Be concise, friendly, and practical.
- Use Indian Rupees by default when discussing costs.
- Explain required business documents, their purpose, where to apply,
  approximate costs, and processing times when relevant.
- Do not present legal or financial information as a substitute for
  professional advice. Recommend a qualified CA or lawyer when needed.
- Keep answers under 300 words unless the user requests more detail.
- End with a useful follow-up question when appropriate.
- Do not invent facts, prices, laws, or regulatory requirements.
SYSTEM;

// Validate and limit conversation history.
$messages = [];
$allowedRoles = ['user', 'assistant'];
$maxHistoryMessages = 20;

foreach (array_slice($history, -$maxHistoryMessages) as $item) {
    if (
        !is_array($item) ||
        !isset($item['role'], $item['content']) ||
        !in_array($item['role'], $allowedRoles, true) ||
        !is_string($item['content'])
    ) {
        continue;
    }

    $content = trim($item['content']);

    if ($content !== '') {
        $messages[] = [
            'role' => $item['role'],
            'content' => substr($content, 0, 6000)
        ];
    }
}

// Append the latest user message.
$messages[] = [
    'role' => 'user',
    'content' => substr($userMessage, 0, 6000)
];

// Prepare the Groq API request.
$payload = json_encode([
    'model' => 'llama-3.3-70b-versatile',
    'messages' => array_merge(
        [
            [
                'role' => 'system',
                'content' => $systemPrompt
            ]
        ],
        $messages
    ),
    'max_tokens' => 600,
    'temperature' => 0.7
]);

if ($payload === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to prepare the request']);
    exit;
}

// Check that PHP cURL is available.
if (!function_exists('curl_init')) {
    http_response_code(500);
    echo json_encode(['error' => 'PHP cURL extension is unavailable']);
    exit;
}

// Send the request to Groq.
$ch = curl_init(
    'https://api.groq.com/openai/v1/chat/completions'
);

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey
    ],
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_TIMEOUT => 30
]);

$response = curl_exec($ch);
$curlError = curl_errno($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

curl_close($ch);

// Handle connection errors without exposing internal details.
if ($response === false || $curlError !== 0) {
    error_log('VentureBot: Groq connection failed; cURL error ' . $curlError);

    http_response_code(502);
    echo json_encode([
        'error' => 'Unable to connect to the AI service. Please try again.'
    ]);
    exit;
}

// Handle API errors.
if ($httpCode < 200 || $httpCode >= 300) {
    error_log('VentureBot: Groq API returned HTTP ' . $httpCode);

    http_response_code(502);
    echo json_encode([
        'error' => 'The AI service returned an error. Please try again.'
    ]);
    exit;
}

// Parse the response.
$data = json_decode($response, true);

$reply = $data['choices'][0]['message']['content'] ?? null;

if (!is_string($reply) || trim($reply) === '') {
    http_response_code(502);
    echo json_encode([
        'error' => 'The AI service returned an invalid response.'
    ]);
    exit;
}

// Return the chatbot response.
echo json_encode(
    ['reply' => trim($reply)],
    JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE
);
