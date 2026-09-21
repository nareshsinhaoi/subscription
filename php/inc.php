<?php 
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);
date_default_timezone_set('Asia/Calcutta');
$timezone_offset = 5.5;
$datetime = gmdate('Y-m-d H:i:s', time()+$timezone_offset*60*60);

// Razorpay API keys
$razorpayKeyId     = "rzp_live_ZCi8bn59NxQnUV";
$razorpayKeySecret = "Ey2SwFAckPBufe6t1ir3Z0VD";


/*
if($_SERVER['HTTP_HOST']=='localhost' || $_SERVER['HTTP_HOST']=='kj.local')
{
	$host = "localhost";
	$user = "root";
	$pass = "";
	$db   = "test";
}
elseif($_SERVER['HTTP_HOST']=='localhost:4321')
{
	$host = "43.205.171.104";
	$user = "outlooksubs";
	$pass = "rejiaihsubs#out";
	$db   = "outlook";
	$port = 3305;  
}else{
	//$host = "oirds.ca1hy0emu6jb.ap-south-1.rds.amazonaws.com";
	//$user = "appuser";
	$host = "127.0.0.1";
	$user = "root"; 
	$pass = "eciffoym";
	$db   = "outlook";
	$port = 3305;
}

$conn = new mysqli($host, $user, $pass, $db, $port);
if ($conn->connect_error) {
    die("DB Connection failed: " . $conn->connect_error);
}
*/


function getClientIP() {
    $ip = '';

    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        // IP from shared internet
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        // IP passed from proxy or load balancer
        $ipList = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        $ip = trim($ipList[0]); // take the first IP
    } elseif (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
        // Cloudflare specific header
        $ip = $_SERVER['HTTP_CF_CONNECTING_IP'];
    } else {
        // Default remote address
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'UNKNOWN';
    }

    // Validate to ensure it’s a public IP address
    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
        return $ip;
    }

    // Fallback if it's a private or invalid IP
    return $_SERVER['REMOTE_ADDR'] ?? 'UNKNOWN';
}

function get_public_ip() {
    $ip_keys = [
        'HTTP_CLIENT_IP',
        'HTTP_X_FORWARDED_FOR',  // may be comma-separated
        'HTTP_X_FORWARDED',
        'HTTP_FORWARDED_FOR',
        'HTTP_FORWARDED',
        'REMOTE_ADDR'
    ];

    foreach ($ip_keys as $key) {
        if (!empty($_SERVER[$key])) {
            $ip_list = explode(',', $_SERVER[$key]);
            foreach ($ip_list as $ip) {
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }
    }
    return 'UNKNOWN';
}

function getIPDetails() 
{
	$api_url = "https://speed.cloudflare.com/meta";  
	 
	$response = file_get_contents($api_url);
	if ($response === FALSE) {
	    die("Error: Unable to fetch API data.");
	} 
	// Decode JSON
	$data = json_decode($response, true);
	return $data;
}

function getIPIFY() 
{ 
	$api_url = "https://api.ipify.org/";  
	$api_url = "https://ipinfo.io/ip";
	$response = file_get_contents($api_url);
	if ($response === FALSE) {
	    die("Error: Unable to fetch API data.");
	} 
	// Decode JSON
	//$data = json_decode($response, true);
	return $response;
}

// ---- REPLACE existing getExchangeRate() with this ----
function getExchangeRate() 
{
    $api_url = "https://open.er-api.com/v6/latest/INR";
    $cache_file = __DIR__ . "/rates/exchange_rates.json";

    $response = @file_get_contents($api_url);
    if ($response !== FALSE) {
        $data = json_decode($response, true);
        if (isset($data['result']) && $data['result'] === "success") {
            file_put_contents($cache_file, json_encode($data, JSON_PRETTY_PRINT));
        }
    }

    // Return the cached data (either freshly fetched or last known good)
    if (file_exists($cache_file)) {
        return json_decode(file_get_contents($cache_file), true);
    }
    return null;
}

// ---- REPLACE existing convertCurrency() with this ----
/**
 * Convert an INR amount to the target currency.
 * Reads from the cached exchange_rates.json. Returns a float.
 */
function convertCurrency($amount_inr, $to_currency) 
{
    $cache_file = __DIR__ . "/rates/exchange_rates.json";
    if (!file_exists($cache_file)) return null;

    $ExchangeData = json_decode(file_get_contents($cache_file), true);
    // Support both "rates" (live API) and "conversion_rates" (legacy key).
    $rates = $ExchangeData['rates'] ?? $ExchangeData['conversion_rates'] ?? null;
    if (!$rates) return null;

    $to_currency = strtoupper($to_currency);
    if ($to_currency === 'INR') return round($amount_inr, 2);
    if (!isset($rates[$to_currency])) return null;

    // INR is the base → rate already means "1 INR = X target".
    return round($amount_inr * $rates[$to_currency], 2);
}

// ---- NEW: format amount with symbol, "AED 420.99" or "₹11,000" ----
function formatAmount($amount, $currency_code, $symbol) 
{
    $isINR = strtoupper($currency_code) === 'INR';
    $decimals = $isINR ? 0 : 2;
    $value = number_format((float)$amount, $decimals, '.', ',');
    // 3-letter codes get a space; symbols like ₹/$ stick tight.
    if (preg_match('/^[A-Z]{3}$/', trim($symbol))) {
        return trim($symbol) . ' ' . $value;
    }
    return $symbol . $value;
}

// ---- NEW: format dual "AED 420.99 / ₹11,000" ----
function formatDual($amount_inr, $currency_code, $symbol) 
{
    if (strtoupper($currency_code) === 'INR') {
        return '₹' . number_format((float)$amount_inr, 0, '.', ',');
    }
    $converted = convertCurrency($amount_inr, $currency_code);
    if ($converted === null) {
        return '₹' . number_format((float)$amount_inr, 0, '.', ',');
    }
    return formatAmount($converted, $currency_code, $symbol)
         . ' / ₹' . number_format((float)$amount_inr, 0, '.', ',');
}

// ---- NEW: load INTL_MAGAZINES from mag_covers.json ----
function loadIntlMagazines() 
{
    $path = __DIR__ . "/mag_covers.json";
    if (!file_exists($path)) {
        $path = __DIR__ . "/mag_covers.json";
    }
    if (!file_exists($path)) return null;

    $json = json_decode(file_get_contents($path), true);
    return $json['INTL_MAGAZINES'] ?? null;
}



/*
function getExchangeRate() 
{
	//$api_url = "https://v6.exchangerate-api.com/v6/818eacd5809cd027b6ec9457/latest/INR";
	$api_url = "https://open.er-api.com/v6/latest/INR";
	$cache_file = __DIR__ . "/rates/exchange_rates.json";

	$response = file_get_contents($api_url);
	if ($response === FALSE) {
	    die("Error: Unable to fetch API data.");
	}

	// Decode JSON
	$data = json_decode($response, true);

	// Check if response is valid
	if (isset($data['result']) && $data['result'] === "success") {
	    // Write to file
	    file_put_contents($cache_file, json_encode($data, JSON_PRETTY_PRINT));
	    echo "✅ Data fetched and saved to exchange_rates.json<br />";
	} else {
	    echo "❌ API returned an error.<br />";
	}

	// ---- Later: Read saved file ----
	if (file_exists($cache_file)) {
	    $saved_data = json_decode(file_get_contents($cache_file), true);

	    echo "💾 Last saved base currency: " . $saved_data['base_code'] . "<br />";
	    echo "💱 1 INR = " . $saved_data['conversion_rates']['USD'] . " USD<br />";
	}
}

function convertCurrency($amount,  $to_currency) 
{ 
    $cache_file = __DIR__ . "/rates/exchange_rates.json";  
    $ExchangeData = json_decode(file_get_contents($cache_file), true); 
    $conversion_rates = $ExchangeData['conversion_rates'][$to_currency];
    $rates = $ExchangeData['conversion_rates'];
    $from_currency =  'INR';
    $to_currency   = strtoupper($to_currency);
    if (!isset($rates[$from_currency]) || !isset($rates[$to_currency])) {
        return null; // currency not found
    }
    $amount_in_base = $amount / $rates[$from_currency];
    $converted = $amount_in_base * $rates[$to_currency];
    return round($converted, 2); 
}*/

function translateText($text, $lang = 'en') {
    // Define your own translations
    $translations = [
        'hi' => [
            'Hello' => 'नमस्ते',
            'How are you?' => 'आप कैसे हैं?',
            'Welcome' => 'स्वागत है',
            'Thank you' => 'धन्यवाद',
            'Select your favorite magazines and enjoy worldwide delivery through Registered Post' => "अपनी पसंदीदा पत्रिकाएँ चुनें और रजिस्टर्ड डाक के माध्यम से दुनिया भर में डिलीवरी का आनंद लें",
        ],
        'fr' => [
            'Hello' => 'Bonjour',
            'How are you?' => 'Comment ça va?',
            'Welcome' => 'Bienvenue',
            'Thank you' => 'Merci',
            'Outlook India' => 'Perspectives Inde', 
            'Outlook Money' => "Perspectives monétaires",
            'Outlook Traveller' => "Outlook Traveller",
            'Outlook Business' => "Perspectives d'affaires",
            'Outlook Hindi' => "Perspectives Hindi",
            'Print Edition' => 'Édition imprimée',
            'Digital Edition' => "Édition numérique",
            'Subscription for International Readers' => 'Abonnement pour les lecteurs internationaux',
            'Select your favorite magazines and enjoy worldwide delivery through Registered Post' => "Sélectionnez vos magazines préférés et profitez d'une livraison dans le monde entier par courrier recommandé",
            "Your Selection Summary" => "Résumé de votre sélection",
        ],
        'zh-CN' => [
            'Hello' => 'नमस्ते',
            'How are you?' => 'आप कैसे हैं?',
            'Outlook India' => '印度展望', 
            'Outlook Money' => "展望貨幣",
            'Outlook Traveller' => "展望旅行者",
            'Outlook Business' => "展望業務",
            'Outlook Hindi' => "印地語展望",
            'Print Edition' => '印刷版',
            'Digital Edition' => "數位版",
            'Subscription for International Readers' => '國際讀者訂閱',
            'Select your favorite magazines and enjoy worldwide delivery through Registered Post' => "選擇您喜愛的雜誌，並透過掛號郵寄享受全球遞送服務",
            "Your Selection Summary" => "您的選擇摘要",
        ],
        'en-SG' => [
            'Hello' => 'Bonjour',
            'How are you?' => 'Comment ça va?',
            'Welcome' => 'Bienvenue',
            'Thank you' => 'Merci',
            'Outlook India' => 'Perspectives Inde', 
            'Outlook Money' => "Perspectives monétaires",
            'Outlook Traveller' => "Outlook Traveller",
            'Outlook Business' => "Perspectives d'affaires",
            'Outlook Hindi' => "Perspectives Hindi",
            'Print Edition' => 'Mbeti ti imprimé ni',
            'Digital Edition' => "Édition numérique",
            'Subscription for International Readers' => 'Abonnement pour les lecteurs internationaux',
            'Select your favorite magazines and enjoy worldwide delivery through Registered Post' => "Sélectionnez vos magazines préférés et profitez d'une livraison dans le monde entier par courrier recommandé",
            "Your Selection Summary" => "Résumé de votre sélection",
        ],
    ];
    return $text;
    if($lang=='GBP' || $lang=='en-US'){ return $text; }
    // Return translated text if exists, else return original
    if (isset($translations[$lang][$text])) {
        return $translations[$lang][$text];
    } else {
        return $text;
    }
}

?>
