<?php
declare(strict_types=1);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json');

$vendorAutoload = __DIR__ . '/../vendor/autoload.php';
if (!file_exists($vendorAutoload)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Backend not configured. Run: cd php && composer install']);
    exit;
}

require_once $vendorAutoload;

use App\Sanitizer;
use App\Logger;
use App\RateLimiter;
use App\CsrfProtection;
use Dotenv\Dotenv;

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->safeLoad();

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Max-Age: 86400');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    header('Content-Type: application/json');
    echo json_encode(['csrf_token' => CsrfProtection::generate()]);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

if (!CsrfProtection::validate()) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Invalid CSRF token']);
    exit;
}

function buildAdminTemplate(array $d): string {
    return <<<HTML
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>New Contact</title><style>
body{font-family:'Segoe UI',sans-serif;background:#0a0a0f;color:#e5e5e5;margin:0;padding:20px;}
h1{background:linear-gradient(90deg,#00f3ff,#bc13fe);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
.card{background:rgba(20,20,30,0.8);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:20px;max-width:600px;margin:20px auto;backdrop-filter:blur(12px);}
.row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);}
.label{color:#00f3ff;font-weight:600;}
</style></head>
<body>
<h1>New Contact Message</h1>
<div class="card">
<div class="row"><span class="label">Name:</span><span>{$d['name']}</span></div>
<div class="row"><span class="label">Email:</span><span>{$d['email']}</span></div>
<div class="row"><span class="label">Phone:</span><span>{$d['phone']}</span></div>
<div class="row"><span class="label">Subject:</span><span>{$d['subject']}</span></div>
<div class="row"><span class="label">Date:</span><span>{$d['date']}</span></div>
<div class="row"><span class="label">Time:</span><span>{$d['time']}</span></div>
<div class="row"><span class="label">IP:</span><span>{$d['ip']}</span></div>
<div class="row"><span class="label">OS:</span><span>{$d['os']}</span></div>
<div class="row"><span class="label">Referrer:</span><span>{$d['referrer']}</span></div>
<div class="row"><span class="label">ID:</span><span>{$d['messageId']}</span></div>
</div>
<div class="card">
  <h3 style="color:#bc13fe">Message</h3>
  <p style="white-space:pre-wrap;line-height:1.6;">{$d['message']}</p>
</div>
</body></html>
HTML;
}

function buildReplyTemplate(string $name): string {
    return <<<HTML
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Thank You!</title><style>
body{font-family:'Segoe UI',sans-serif;background:#0a0a0f;color:#e5e5e5;margin:0;padding:40px;text-align:center;}
h1{background:linear-gradient(90deg,#00f3ff,#bc13fe);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
p{color:#a3a3a3;line-height:1.7;}
</style></head>
<body>
<h1>Hello {$name}!</h1>
<p>Thank you for reaching out. I have received your message and will get back to you shortly.</p>
<p style="color:#00f3ff">Best regards,<br>Neon Portfolio</p>
</body></html>
HTML;
}

try {
    $contentType = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';

    if (str_starts_with($contentType, 'multipart/form-data')) {
        $name = Sanitizer::string($_POST['name'] ?? '', 255);
        $email = Sanitizer::email($_POST['email'] ?? '');
        $phone = Sanitizer::phone($_POST['phone'] ?? '');
        $subject = Sanitizer::string($_POST['subject'] ?? 'Contact Form Submission', 255);
        $message = Sanitizer::string($_POST['message'] ?? '', 5000);
    } else {
        $input = file_get_contents('php://input');
        if (!$input) {
            throw new InvalidArgumentException('No input data received');
        }
        $data = json_decode($input, true, 512, JSON_THROW_ON_ERROR);
        $name = Sanitizer::string($data['name'] ?? '', 255);
        $email = Sanitizer::email($data['email'] ?? '');
        $phone = Sanitizer::phone($data['phone'] ?? '');
        $subject = Sanitizer::string($data['subject'] ?? 'Contact Form Submission', 255);
        $message = Sanitizer::string($data['message'] ?? '', 5000);
    }

    if (!mb_strlen($name) || !mb_strlen($email) || !mb_strlen($message)) {
        throw new InvalidArgumentException('Required fields must not be empty.');
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new InvalidArgumentException('Invalid email format.');
    }

    $limiter = new RateLimiter(__DIR__ . '/../messages/ratelimit', (int)(getenv('RATE_LIMIT_WINDOW') ?: 900), (int)(getenv('RATE_LIMIT_MAX_REQUESTS') ?: 5));
    if (!$limiter->isAllowed($email)) {
        throw new InvalidArgumentException('Too many requests. Please try again later.');
    }

    $uploadedPath = null;
    if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] === UPLOAD_ERR_OK) {
        $allowedTypes = ['image/jpeg','image/png','image/webp','application/pdf'];
        $fileType = mime_content_type($_FILES['attachment']['tmp_name']);
        $maxSize = (int)(getenv('UPLOAD_MAX_SIZE') ?: 5242880);
        if (!in_array($fileType, $allowedTypes, true)) {
            throw new InvalidArgumentException('Invalid file type.');
        }
        if ($_FILES['attachment']['size'] > $maxSize) {
            throw new InvalidArgumentException('File too large.');
        }
        $uploadDir = __DIR__ . '/../uploads/';
        if (!is_dir($uploadDir)) { @mkdir($uploadDir, 0755, true); }
        $ext = pathinfo($_FILES['attachment']['name'], PATHINFO_EXTENSION);
        $safeName = bin2hex(random_bytes(8)) . '.' . $ext;
        $uploadedPath = $uploadDir . $safeName;
        move_uploaded_file($_FILES['attachment']['tmp_name'], $uploadedPath);
    }

    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $userAgent = Sanitizer::string($_SERVER['HTTP_USER_AGENT'] ?? 'unknown', 500);
    $os = Sanitizer::string($_SERVER['HTTP_USER_AGENT'] ?? 'unknown', 255);
    $referrer = Sanitizer::string($_SERVER['HTTP_REFERER'] ?? 'direct', 255);
    $now = new DateTimeImmutable('now', new DateTimeZone('UTC'));
    $date = $now->format('Y-m-d');
    $time = $now->format('H:i:s');
    $messageId = uniqid('msg_', true) . '_' . bin2hex(random_bytes(6));

    $adminEmail = getenv('ADMIN_EMAIL') ?: 'admin@example.com';
    $host = getenv('SMTP_HOST') ?: 'smtp.gmail.com';
    $port = (int)(getenv('SMTP_PORT') ?: 587);
    $username = getenv('SMTP_USERNAME') ?: 'user@gmail.com';
    $password = getenv('SMTP_PASSWORD') ?: 'app_password';
    $from = getenv('SMTP_FROM') ?: 'user@gmail.com';
    $fromName = getenv('SMTP_FROM_NAME') ?: 'Portfolio';

    $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = $host;
    $mail->SMTPAuth = true;
    $mail->Username = $username;
    $mail->Password = $password;
    $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = $port;
    $mail->CharSet = 'UTF-8';
    $mail->setFrom($from, $fromName);
    $mail->addAddress($adminEmail);
    $mail->addReplyTo($email, $name);
    $mail->Subject = "[Portfolio] {$subject}";
    $mail->isHTML(true);
    $mail->Body = buildAdminTemplate([
        'name'=>$name,'email'=>$email,'phone'=>$phone,'subject'=>$subject,
        'message'=>nl2br(htmlspecialchars($message)),'date'=>$date,'time'=>$time,
        'ip'=>$ip,'os'=>$os,'referrer'=>$referrer,'messageId'=>$messageId,'userAgent'=>$userAgent
    ]);
    $mail->AltBody = "Name: {$name}\nEmail: {$email}\nPhone: {$phone}\nSubject: {$subject}\nMessage:\n{$message}\nDate: {$date}\nID: {$messageId}\n";
    $mail->send();

    $reply = new \PHPMailer\PHPMailer\PHPMailer(true);
    $reply->isSMTP();
    $reply->Host = $host;
    $reply->SMTPAuth = true;
    $reply->Username = $username;
    $reply->Password = $password;
    $reply->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
    $reply->Port = $port;
    $reply->CharSet = 'UTF-8';
    $reply->setFrom($from, $fromName);
    $reply->addAddress($email, $name);
    $reply->Subject = "Thank you for contacting me!";
    $reply->isHTML(true);
    $reply->Body = buildReplyTemplate($name);
    $reply->AltBody = "Hi {$name},\n\nThank you for reaching out. I'll get back to you soon.\n\nBest regards.";
    $reply->send();

    Logger::log('info', 'Contact sent', ['id'=>$messageId,'email'=>$email]);

    $logDir = __DIR__ . '/../messages/';
    if (!is_dir($logDir)) { @mkdir($logDir, 0755, true); }
    $logFile = $logDir . 'contact_logs.json';
    $entry = [
        'id'=>$messageId,'name'=>$name,'email'=>$email,'phone'=>$phone,
        'subject'=>$subject,'message'=>$message,'date'=>$date,'time'=>$time,
        'ip'=>$ip,'user_agent'=>$userAgent,'os'=>$os,'referrer'=>$referrer,
        'attachment'=>$uploadedPath ? basename($uploadedPath) : null,
        'status'=>'sent','sent_at'=>$now->format('c'),
    ];
    $logs = [];
    if (file_exists($logFile)) {
        $decoded = json_decode(file_get_contents($logFile), true);
        $logs = is_array($decoded) ? $decoded : [];
    }
    $logs[] = $entry;
    file_put_contents($logFile, json_encode($logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR), LOCK_EX);

    echo json_encode(['success'=>true,'message'=>'Message sent successfully!','id'=>$messageId]);

} catch (\Throwable $e) {
    http_response_code(400);
    echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}
