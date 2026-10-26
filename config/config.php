
<?php
// ============================================================
// VentureIQ – Configuration
// Supports localhost and Render deployment
// ============================================================

define('APP_NAME', 'VentureIQ');
define('APP_TAGLINE', 'AI-Powered E-Commerce Startup Planner');

define('APP_ENV', getenv('APP_ENV') ?: 'development');

// Base path: localhost uses /ventureiq/public; Render uses /
define(
    'BASE_PATH',
    getenv('BASE_PATH') !== false
        ? rtrim(getenv('BASE_PATH'), '/')
        : '/ventureiq/public'
);

define(
    'APP_URL',
    getenv('APP_URL') ?: (
        (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'
            ? 'https'
            : 'http')
        . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost')
        . BASE_PATH
    )
);

// ── Database ─────────────────────────────────────────────────
// Local defaults; Render will provide environment variables.
define('DB_HOST',    getenv('DB_HOST') ?: 'localhost');
define('DB_NAME',    getenv('DB_NAME') ?: 'ventureiq');
define('DB_USER',    getenv('DB_USER') ?: 'root');
define('DB_PASS',    getenv('DB_PASSWORD') !== false
    ? getenv('DB_PASSWORD')
    : '');
define('DB_PORT',    (int)(getenv('DB_PORT') ?: 3306));
define('DB_CHARSET', 'utf8mb4');

// ── Paths ────────────────────────────────────────────────────
if (!defined('ROOT_PATH')) {
    define('ROOT_PATH', dirname(__DIR__));
}
if (!defined('CONFIG_PATH')) {
    define('CONFIG_PATH', __DIR__);
}
if (!defined('PUBLIC_PATH')) {
    define('PUBLIC_PATH', ROOT_PATH . '/public');
}
if (!defined('UPLOAD_PATH')) {
    define('UPLOAD_PATH', ROOT_PATH . '/uploads');
}

// ── Security ────────────────────────────────────────────────
define(
    'SECRET_KEY',
    getenv('SECRET_KEY') ?: 'ventureiq_dev_secret_key_change_in_production'
);
define('SESSION_LIFETIME', 7200);
define('BCRYPT_COST', 12);
define('CSRF_TOKEN_NAME', '_csrf');

// ── Rate Limiting ───────────────────────────────────────────
define('LOGIN_MAX_ATTEMPTS', 5);
define('LOGIN_WINDOW_SECS', 900);
define('LOGIN_LOCKOUT_SECS', 1800);

// ── reCAPTCHA ───────────────────────────────────────────────
define('RECAPTCHA_SITE_KEY', getenv('RECAPTCHA_SITE_KEY') ?: 'YOUR_SITE_KEY_HERE');
define('RECAPTCHA_SECRET_KEY', getenv('RECAPTCHA_SECRET_KEY') ?: 'YOUR_SECRET_KEY_HERE');
define('RECAPTCHA_THRESHOLD', 0.5);

// ── Mail ────────────────────────────────────────────────────
define('MAIL_FROM', 'noreply@ventureiq.com');
define('MAIL_FROM_NAME', 'VentureIQ');

// ── URL Helper ──────────────────────────────────────────────
function url(string $path = ''): string {
    return BASE_PATH . '/' . ltrim($path, '/');
}

// ── PHP Error Display ───────────────────────────────────────
if (APP_ENV === 'production') {
    ini_set('display_errors', '0');
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', '1');
    error_reporting(E_ALL);
}

date_default_timezone_set('UTC');
