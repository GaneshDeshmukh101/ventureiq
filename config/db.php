
<?php
// ============================================================
// VentureIQ – Database Connection (PDO Singleton)
// Supports localhost and Aiven MySQL
// ============================================================

require_once __DIR__ . '/config.php';

class DB {
    private static ?PDO $instance = null;

    public static function conn(): PDO {
        if (self::$instance === null) {
            $dsn = sprintf(
                'mysql:host=%s;port=%d;dbname=%s;charset=%s',
                DB_HOST,
                DB_PORT,
                DB_NAME,
                DB_CHARSET
            );

            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
            ];

            // Enable TLS for cloud databases such as Aiven.
            // Set DB_SSL_CA to the path of Aiven's CA certificate.
            $sslCa = getenv('DB_SSL_CA');

            if ($sslCa !== false && $sslCa !== '') {
                if (!is_file($sslCa)) {
                    error_log('DB connection failed: DB_SSL_CA file not found.');
                    http_response_code(503);
                    die(json_encode(['error' => 'Database SSL configuration unavailable']));
                }

                $options[PDO::MYSQL_ATTR_SSL_CA] = $sslCa;
            }

            try {
                self::$instance = new PDO(
                    $dsn,
                    DB_USER,
                    DB_PASS,
                    $options
                );
            } catch (PDOException $e) {
                error_log('DB connection failed: ' . $e->getMessage());
                http_response_code(503);
                die(json_encode(['error' => 'Database unavailable']));
            }
        }

        return self::$instance;
    }

    // Execute a prepared statement
    public static function run(string $sql, array $params = []): PDOStatement {
        $stmt = self::conn()->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    // Fetch one row
    public static function one(string $sql, array $params = []): ?array {
        $row = self::run($sql, $params)->fetch();
        return $row ?: null;
    }

    // Fetch all rows
    public static function all(string $sql, array $params = []): array {
        return self::run($sql, $params)->fetchAll();
    }

    // Insert and return last insert ID
    public static function insert(string $sql, array $params = []): int {
        self::run($sql, $params);
        return (int) self::conn()->lastInsertId();
    }
}
