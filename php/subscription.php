<?php 
include('inc.php');

// ---- Client IP (respecting proxies) ----
$client_ip = function_exists('getClientIP')
    ? getClientIP()
    : (isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'UNKNOWN');

// ---- Uncomment for testing specific countries ----
// $client_ip = "51.195.242.240";   // GBP
// $client_ip = "218.107.132.66";   // China
// $client_ip = "147.93.156.2";     // Singapore
// $client_ip = "102.129.157.255";    // UAE
// $client_ip ='175.29.177.126';    // Bangladesh
// $client_ip ='110.33.122.75';     // Australia
// $client_ip ='115.240.90.163';    // India

$client_ip = 'UNKNOWN';
if (isset($_GET['ip']) && $_GET['ip'] !== '') {
    $test_ip = trim($_GET['ip']);
    if (filter_var($test_ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
        $client_ip = $test_ip;
    }
}
if ($client_ip === 'UNKNOWN') {
    $client_ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'UNKNOWN';
}
 
// ---- Geo lookup via ipgeolocation.io ----
$api_url = "https://api.ipgeolocation.io/ipgeo?apiKey=017706b0a63c42f3be8789ee1859e4c0&ip={$client_ip}";
$response = @file_get_contents($api_url);
$locationData = $response ? json_decode($response, true) : null;

$countryFlag = isset($locationData['country_flag'])
    ? $locationData['country_flag']
    : 'https://ipgeolocation.io/static/flags/in_64.png';
$countryName = isset($locationData['country_name'])
    ? $locationData['country_name']
    : 'India';

$nativeCode = isset($locationData['currency']['code'])
    ? $locationData['currency']['code']
    : 'INR';
$nativeSymbol = isset($locationData['currency']['symbol'])
    ? $locationData['currency']['symbol']
    : '₹';
$languagesSymbol = isset($locationData['languages'])
    ? $locationData['languages']
    : 'en-US';

// ---- Currency options: [native, INR] or [INR] only ----
$displayCurrency = isset($_GET['currency'])
    ? strtoupper($_GET['currency'])
    : $nativeCode;

if ($nativeCode === 'INR') {
    $currencyOptions = array(array('code' => 'INR', 'symbol' => '₹'));
    $displayCurrency = 'INR';
} else {
    $currencyOptions = array(
        array('code' => $nativeCode, 'symbol' => $nativeSymbol),
        array('code' => 'INR',       'symbol' => '₹'),
    );
    if (!in_array($displayCurrency, array($nativeCode, 'INR'), true)) {
        $displayCurrency = $nativeCode;
    }
}

$to_currency    = $displayCurrency;
$currencySymbol = $displayCurrency === 'INR' ? '₹' : $nativeSymbol;

// ---- Load magazine rates from mag_covers.json (INTL_MAGAZINES) ----
$intlMagazines = loadIntlMagazines();

if (!$intlMagazines) {
    $intlMagazines = array(
        array('key'=>'oli','code'=>'OLI','name'=>'Outlook India',    'details'=>'Weekly news magazine',       'print1'=>11000,'digital1'=>2600,'print2'=>5200),
        array('key'=>'olm','code'=>'OLM','name'=>'Outlook Money',    'details'=>'Personal finance monthly',   'print1'=>3500, 'digital1'=>960, 'print2'=>1920),
        array('key'=>'olt','code'=>'OLT','name'=>'Outlook Traveller','details'=>'Travel monthly',             'print1'=>2850, 'digital1'=>900, 'print2'=>1800),
        array('key'=>'olb','code'=>'OLB','name'=>'Outlook Business', 'details'=>'Business fortnightly',       'print1'=>5200, 'digital1'=>1200,'print2'=>2400),
        array('key'=>'olh','code'=>'OLH','name'=>'Outlook Hindi',    'details'=>'Weekly Hindi news magazine', 'print1'=>5000, 'digital1'=>600, 'print2'=>1200),
    );
}

// ---- Cover images from mag_covers.json (MAG_IMG) ----
$jsonFile = 'mag_covers.json';
$jsonPath = realpath(__DIR__ . "/../assets/covers/");
$jsonSourcePath = file_exists($jsonPath . '/' . $jsonFile)
    ? $jsonPath . '/' . $jsonFile
    : (file_exists($jsonFile) ? $jsonFile : null);

$coverdata = $jsonSourcePath ? json_decode(file_get_contents($jsonSourcePath), true) : null;
$imgPaths  = array();
if (!empty($coverdata['MAG_IMG'])) {
    $imgPaths['oli_image'] = isset($coverdata['MAG_IMG']['oli']) ? $coverdata['MAG_IMG']['oli'] : '';
    $imgPaths['olb_image'] = isset($coverdata['MAG_IMG']['olb']) ? $coverdata['MAG_IMG']['olb'] : '';
    $imgPaths['olm_image'] = isset($coverdata['MAG_IMG']['olm']) ? $coverdata['MAG_IMG']['olm'] : '';
    $imgPaths['olt_image'] = isset($coverdata['MAG_IMG']['olt']) ? $coverdata['MAG_IMG']['olt'] : '';
    $imgPaths['olh_image'] = isset($coverdata['MAG_IMG']['olh']) ? $coverdata['MAG_IMG']['olh'] : '';
}

/** Convert INR price to display currency (returns float). */
function priceInDisplay($inrAmount, $toCurrency) {
    if ($toCurrency === 'INR') return (float)$inrAmount;
    $c = convertCurrency($inrAmount, $toCurrency);
    return $c === null ? (float)$inrAmount : (float)$c;
}

/** Display "AED 420.99 (₹11,000)" or "₹11,000" when INR. */
function displayPrice($inrAmount, $toCurrency, $symbol) {
    if ($toCurrency === 'INR') {
        return '₹' . number_format((float)$inrAmount, 0, '.', ',');
    }
    $conv = convertCurrency($inrAmount, $toCurrency);
    if ($conv === null) return '₹' . number_format((float)$inrAmount, 0, '.', ',');
    $convStr = number_format((float)$conv, 2);
    $baseStr = number_format((float)$inrAmount, 0, '.', ',');
    $space   = preg_match('/^[A-Z]{3}$/', trim($symbol)) ? ' ' : '';
    return "{$symbol}{$space}{$convStr}"
         . " <span class=\"edition-base\">(₹{$baseStr})</span>";
}

/** Slug → cover key mapping (matches magazine card data-magazine). */
$coverKeyBySlug = array(
    'ol'  => 'oli_image',
    'ii'  => 'olm_image',
    'olt' => 'olt_image',
    'ob'  => 'olb_image',
    'olh' => 'olh_image',
);
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="shortcut icon" href="https://fea.assettype.com/outlook/outlook-india/assets/favicon.ico" type="image/x-icon">
<link rel="apple-touch-icon" href="https://fea.assettype.com/outlook/outlook-india/assets/apple-touch-icon.png">
<link rel="icon" type="image/png" href="https://fea.assettype.com/outlook/outlook-india/assets/favicon.ico">
<title>Outlook Magazine Subscription</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<style>
*{margin:0;padding:0;box-sizing:border-box;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif}
body{color:#333;line-height:1.6;background-color:#f8f9fa}
.container{max-width:1400px;width:95%;margin:0 auto;background:#fff;border-radius:15px;box-shadow:0 15px 40px rgb(0 0 0 / .15);overflow:hidden}
.topheader{margin-bottom:10px;background-color:#FFF;text-align:center;padding:1rem 0}
header{background:linear-gradient(90deg,#d60810 0,#ef0912 100%);color:#fff;padding:30px 0;text-align:center}
.header-content{margin:0 auto;display:flex;flex-direction:column;align-items:center}
h1{font-size:2.5rem;margin-bottom:10px;text-transform:uppercase;letter-spacing:1px}
.subtitle{font-size:1.2rem;opacity:.9}
.magazine-grid{display:flex;flex-wrap:nowrap;overflow-x:auto;gap:15px;margin:30px;padding:5px 0 25px}
.magazine-card{width:260px;min-width:260px;flex-shrink:0;background:#fff;padding:15px;margin:10px 8px 0;border-radius:10px;border:2px solid #e9ecef;box-shadow:0 4px 12px rgb(0 0 0 / .1);transition:.4s}
.magazine-card:hover{transform:translateY(-5px);box-shadow:0 15px 30px rgb(118 6 5 / .2),0 0 0 2px #d60810}
.magazine-card.selected{border-color:#fc0;box-shadow:0 0 0 2px #fc0;animation:pulse-selected 1.5s infinite alternate}
@keyframes pulse-selected{from{box-shadow:0 0 0 2px #fc0}to{box-shadow:0 0 0 3px #fc0}}
.magazine-card .magazine-image{height:300px;width:100%;object-fit:cover;border-radius:8px}
.magazine-info{margin-bottom:15px}
.magazine-name{font-weight:700;font-size:1.3rem;margin-bottom:10px;color:#760605}
.magazine-details{font-size:.9rem;color:#666;margin-bottom:15px;min-height:45px}
.duration-select{width:100%;padding:10px;border:1px solid #ced4da;border-radius:6px;font-size:16px;margin-bottom:15px;background:#f8f9fa}
.edition-option{display:flex;align-items:center;margin-bottom:10px;padding:10px;border:1px solid #e9ecef;border-radius:6px;transition:.3s}
.edition-option:hover{background-color:#f8f9fa}
.edition-option input{margin-right:10px}
.edition-label{flex:1;font-weight:600}
.edition-price{color:#c00;font-weight:600;text-align:right;white-space:nowrap;font-size:.95rem}
.edition-base{font-weight:400;color:#666;font-size:.85em}
.magazine-price{font-size:1.1rem;text-align:right;margin-top:10px;color:#c00;font-weight:600}
.magazine-price-inr{font-weight:400;color:#666;font-size:.85em}
.selection-summary{background:#fff;border-radius:10px;padding:25px;margin:30px;box-shadow:0 5px 15px rgb(0 0 0 / .08)}
.summary-title{font-size:1.5rem;color:#760605;margin-bottom:20px;padding-bottom:10px;border-bottom:2px solid #f5f5f5;text-align:center}
.selected-items{margin-bottom:20px;min-height:100px}
.selected-item{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eee}
.selected-item small{color:#666;font-size:.85em}
.empty-selection{color:#999;font-style:italic;padding:20px 0;text-align:center}
.total-section{background:#f5f5f5;padding:15px;border-radius:8px;margin-top:20px}
.total-row{display:flex;justify-content:space-between;font-weight:600;font-size:1.2rem;color:#760605}
.total-row small{font-weight:400;font-size:.72rem;color:#666;display:block}
.submit-btn{background:linear-gradient(90deg,#d60810 0,#ef0912 100%);color:#fff;border:none;padding:15px 30px;font-size:1.1rem;font-weight:600;border-radius:50px;cursor:pointer;display:block;width:100%;margin-top:20px;text-transform:uppercase;letter-spacing:1px}
.validation-error{color:#ff3860;font-size:.9rem;display:none;padding:10px;background:#ffeef0;border-radius:5px;margin-top:15px;text-align:center}
.terms{margin-top:30px;padding:15px;color:#fff;border-radius:0 0 10px 10px;text-align:center;background:linear-gradient(90deg,#d60810 0,#ef0912 100%)}
.terms a{color:#fff;text-decoration:none;font-weight:600}
.terms a:hover{text-decoration:underline}
.scroll-hint{display:none;text-align:center}
.shake{animation:.5s shake}
@keyframes shake{0%,100%{transform:translateX(0)}10%,30%,50%,70%,90%{transform:translateX(-5px)}20%,40%,60%,80%{transform:translateX(5px)}}
@media (max-width:767px){
	.magazine-grid{margin:15px;gap:10px}
	.magazine-card{min-width:250px;width:220px;padding:12px}
	.magazine-card .magazine-image{height:280px}
	h1{font-size:1.5rem!important}
	.scroll-hint{display:block}
}
@media (min-width:768px) and (max-width:1023px){
	.container{max-width:960px}
	h1{font-size:2rem!important}
}
@media (min-width:1024px) and (max-width:1279px){
	.container{max-width:1200px}
	.magazine-card{width:240px;min-width:240px}
}
@media (min-width:1280px) and (max-width:1535px){
	.container{max-width:1400px}
	.magazine-card{width:260px;min-width:260px}
}
@media (min-width:1536px){
	.container{max-width:1700px}
	.magazine-card{width:290px;min-width:290px}
}
.detected-country{display:inline-flex; align-items:center; gap:8px; margin-top:12px; padding:6px 14px; background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.35); border-radius:50px; font-size:.9rem; font-weight:500}
.country-flag-img{width:22px; height:auto; border-radius:2px; box-shadow:0 1px 2px rgba(0,0,0,0.2)}
</style>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-322WCNE2BL" type="text/javascript"></script>
<script type="text/javascript">
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date()); 
  gtag('config', 'G-322WCNE2BL');
</script>
</head>
<body>
<div class="topheader">
    <a href="JavaScript:;"><img src="https://kj2.outlookindia.com/easyqr/img/outlook-group.jpg" style="max-width:200px"></a>
</div>

<div class="container mx-auto mt-8">
    <header>
        <div class="header-content">
            <h1><?php echo translateText('Subscription for International Readers', $languagesSymbol); ?></h1>
            <p class="subtitle"><?php echo translateText('Select your favorite magazines and enjoy worldwide delivery through Registered Post', $languagesSymbol); ?></p>
            <?php if ($countryFlag): ?>
            <div class="detected-country">
                <img src="<?php echo htmlspecialchars($countryFlag); ?>"
                     alt="<?php echo htmlspecialchars($countryName); ?>"
                     class="country-flag-img">
                <span><?php echo htmlspecialchars($countryName); ?></span>
            </div>
            <?php endif; ?>
        </div>
    </header>

    <?php if (count($currencyOptions) > 1): ?>
    <div class="currency-picker" style="display:none;"><?php echo $nativeCode?>
        <label for="currency-select"><strong>Currency:</strong></label>
        <select id="currency-select" onchange="window.location.href='?currency='+this.value">
            <?php foreach ($currencyOptions as $opt): ?>
                <option value="<?php echo htmlspecialchars($opt['code']); ?>"
                    <?php echo $opt['code'] === $displayCurrency ? 'selected' : ''; ?>>
                    <?php echo htmlspecialchars($opt['code']); ?>
                </option>
            <?php endforeach; ?>
        </select>
    </div>
    <?php endif; ?>

    <form name="online" action="orderform_international.php" method="post" onsubmit="return validateForm()">
        <!-- Hidden form fields -->
        <input type="hidden" name="sess" value="20140822151657799013952">
        <input type="hidden" name="magazine_code" value="15">
        <input type="hidden" name="amt" id="form-amt" value="">
        <input type="hidden" name="dura" id="form-dura" value="">
        <input type="hidden" name="strlocation" value="NBBP">
        <input type="hidden" name="gift" value="">
        <input type="hidden" name="ggift" value="">
        <input type="hidden" name="mag" id="form-mag" value="OL-TEO-KJ-INTL<?php if(isset($_REQUEST['source'])){ echo htmlspecialchars($_REQUEST['source']); } ?><?php if(isset($_REQUEST['vouchercode'])){ echo '-'.htmlspecialchars($_REQUEST['vouchercode']); } ?>">
        <input type="hidden" name="mag_select" id="form-mag-select" value="">
        <input type="hidden" name="selectionlist" id="form-selectionlist" value="">
        <input type="hidden" name="printoffline" value="false">
        <input type="hidden" name="client_ip" value="<?php echo htmlspecialchars($client_ip); ?>">
        <input type="hidden" name="currency" value="INR">
        <input type="hidden" name="to_currency" value="INR">
        <input type="hidden" name="display_currency" value="<?php echo htmlspecialchars($displayCurrency); ?>">
        <input type="hidden" name="currencySymbol" value="₹">
        <input type="hidden" name="languagesSymbol" value="en-IN">
        <input type="hidden" name="source" value="<?php echo isset($_REQUEST['source']) ? htmlspecialchars($_REQUEST['source']) : ''; ?>">
        <input type="hidden" name="vouchercode" value="<?php echo isset($_REQUEST['vouchercode']) ? htmlspecialchars($_REQUEST['vouchercode']) : ''; ?>">
        <input type="hidden" name="kjsource" value="<?php echo isset($_REQUEST['vouchercode']) ? htmlspecialchars($_REQUEST['vouchercode']) : ''; ?>">

        <p class="scroll-hint"><strong>&larr; Scroll horizontally &rarr;</strong></p>

        <div class="magazine-grid">
        <?php foreach ($intlMagazines as $mag):
            $slug = $mag['key'];              // oli, olm, olt, olb, olh
            $slugMap = array('oli'=>'ol','olm'=>'ii','olt'=>'olt','olb'=>'ob','olh'=>'olh');
            $dm = isset($slugMap[$slug]) ? $slugMap[$slug] : $slug;
            $coverKey = isset($coverKeyBySlug[$dm]) ? $coverKeyBySlug[$dm] : null;
            $coverUrl = ($coverKey && isset($imgPaths[$coverKey])) ? $imgPaths[$coverKey] : '';
        ?>
            <div class="magazine-card" data-magazine="<?php echo $dm; ?>">
                <img src="<?php echo htmlspecialchars($coverUrl); ?>" alt="<?php echo htmlspecialchars($mag['name']); ?>" class="magazine-image">
                <div class="magazine-info">
                    <div class="magazine-name"><?php echo translateText($mag['name'], $languagesSymbol); ?></div>
                    <div class="magazine-details"><?php echo htmlspecialchars($mag['details']); ?></div>
                </div>

                <select class="duration-select" data-magazine="<?php echo $dm; ?>">
                    <option value="">Select Duration</option>
                    <option value="1">1 Year</option>
                    <option value="2">2 Years</option>
                </select>

                <div class="edition-options">
                    <!-- PRINT (1 Year) -->
                    <label class="edition-option">
                        <input type="checkbox" name="<?php echo $dm; ?>_edition" value="print"
                            data-price="<?php echo priceInDisplay($mag['print1'], $to_currency); ?>"
                            data-price-inr="<?php echo (int)$mag['print1']; ?>">
                        <span class="edition-label"><?php echo translateText('Print', $languagesSymbol); ?></span>
                        <span class="edition-price">
                            <?php echo displayPrice($mag['print1'], $to_currency, $currencySymbol); ?>
                        </span>
                    </label>

                    <!-- e-MAG (1 Year) -->
                    <label class="edition-option">
                        <input type="checkbox" name="<?php echo $dm; ?>_edition" value="digital"
                            data-price="<?php echo priceInDisplay($mag['digital1'], $to_currency); ?>"
                            data-price-inr="<?php echo (int)$mag['digital1']; ?>">
                        <span class="edition-label"><?php echo translateText('e-Mag', $languagesSymbol); ?></span>
                        <span class="edition-price">
                            <?php echo displayPrice($mag['digital1'], $to_currency, $currencySymbol); ?>
                        </span>
                    </label>

                    <!-- e-MAG (2 Years) -->
                    <label class="edition-option" style="display:none;">
                        <input type="checkbox" name="<?php echo $dm; ?>_edition" value="digital2"
                            data-price="<?php echo priceInDisplay($mag['print2'], $to_currency); ?>"
                            data-price-inr="<?php echo (int)$mag['print2']; ?>">
                        <span class="edition-label"><?php echo translateText('e-Mag', $languagesSymbol); ?></span>
                        <span class="edition-price">
                            <?php echo displayPrice($mag['print2'], $to_currency, $currencySymbol); ?>
                        </span>
                    </label>
                </div>

                <div class="magazine-price" data-magazine="<?php echo $dm; ?>"><?php echo $currencySymbol; ?>0</div>
            </div>
        <?php endforeach; ?>
        </div>

        <div class="selection-summary">
            <h2 class="summary-title"><?php echo translateText('Your Selection Summary', $languagesSymbol); ?></h2>
            <div class="selected-items" id="selected-items">
                <div class="empty-selection">No magazines selected yet</div>
            </div>
            <div class="total-section">
                <div class="total-row">
                    <span>You Pay:</span>
                    <span id="total-price"><?php echo $currencySymbol; ?> 0
                        <small id="total-price-inr-note">You will be charged in INR at checkout.</small>
                    </span>
                </div>
            </div>
            <div class="validation-error" id="selection-error">Please select at least one magazine to continue.</div>
            <button type="submit" class="submit-btn pulse">Proceed to Checkout</button>
        </div>

        <div class="terms">
            <a href="JavaScript:;" onClick="window.open('terms-and-conditions-international.html','terms','width=800,height=600');">Terms &amp; Conditions</a>
        </div>
    </form>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    var durationSelects      = document.querySelectorAll('.duration-select');
    var editionCheckboxes    = document.querySelectorAll('.edition-options input[type="checkbox"]');
    var selectedItemsContainer = document.getElementById('selected-items');
    var totalPriceElement    = document.getElementById('total-price');
    var selectionError       = document.getElementById('selection-error');
    var editionOptions       = document.querySelectorAll('.edition-option');

    var CURRENCY_SYMBOL  = <?php echo json_encode($currencySymbol); ?>;
    var DISPLAY_CURRENCY = <?php echo json_encode($to_currency); ?>;
    var IS_INR           = DISPLAY_CURRENCY === 'INR';

    var selectedMagazines = {};

    editionCheckboxes.forEach(function(cb){ cb.disabled = true; cb.checked = false; });

    durationSelects.forEach(function(select) {
        select.addEventListener('change', function() {
            var magazine = this.dataset.magazine;
            var duration = this.value;

            var magazineCheckboxes = document.querySelectorAll('input[name="' + magazine + '_edition"]');
            magazineCheckboxes.forEach(function(cb){ cb.checked = false; cb.disabled = true; });

            if (duration === '1') {
                var print   = document.querySelector('input[name="' + magazine + '_edition"][value="print"]');
                var digital = document.querySelector('input[name="' + magazine + '_edition"][value="digital"]');
                var digi2   = document.querySelector('input[name="' + magazine + '_edition"][value="digital2"]');
                if (print)   { print.disabled   = false; print.parentElement.style.display   = 'flex'; }
                if (digital) { digital.disabled = false; digital.parentElement.style.display = 'flex'; }
                if (digi2)   { digi2.parentElement.style.display = 'none'; }
            } else if (duration === '2') {
                var digi2b = document.querySelector('input[name="' + magazine + '_edition"][value="digital2"]');
                var printb = document.querySelector('input[name="' + magazine + '_edition"][value="print"]');
                var digitalb = document.querySelector('input[name="' + magazine + '_edition"][value="digital"]');
                if (digi2b) { digi2b.disabled = false; digi2b.parentElement.style.display = 'flex'; }
                if (printb)   printb.parentElement.style.display   = 'none';
                if (digitalb) digitalb.parentElement.style.display = 'none';
            }

            Object.keys(selectedMagazines).forEach(function(k){
                if (k.indexOf(magazine + '_') === 0) delete selectedMagazines[k];
            });

            updateMagazinePriceDisplay(magazine);
            updateCardSelectionState(magazine);
            updateSummary();
        });
    });

    editionOptions.forEach(function(option) {
        option.addEventListener('click', function(e) {
            var cb = this.querySelector('input[type="checkbox"]');
            if (cb && cb.disabled) {
                e.preventDefault(); e.stopPropagation();
                var magazine = cb.name.split('_')[0];
                var sel = document.querySelector('.duration-select[data-magazine="' + magazine + '"]');
                if (sel) {
                    sel.style.border = '2px solid #ff0000';
                    sel.style.boxShadow = '0 0 5px rgba(255,0,0,0.5)';
                    sel.focus();
                    setTimeout(function(){ sel.style.border = ''; sel.style.boxShadow = ''; }, 2000);
                }
            }
        });
    });

    editionCheckboxes.forEach(function(cb) {
        cb.addEventListener('change', function() {
            var magazine = this.name.split('_')[0];
            var edition = this.value;
            var durationSelect = document.querySelector('.duration-select[data-magazine="' + magazine + '"]');
            var duration = durationSelect.value;
            if (!duration) { this.checked = false; return; }

            var price    = parseFloat(this.dataset.price)    || 0;
            var priceInr = parseFloat(this.dataset.priceInr) || 0;
            var key = magazine + '_' + edition;

            if (this.checked) {
                selectedMagazines[key] = {
                    name: getMagazineName(magazine),
                    edition: getEditionName(edition),
                    duration: duration === '1' ? '1 Year' : '2 Years',
                    price: price,
                    priceInr: priceInr,
                    magazine: magazine
                };
            } else {
                delete selectedMagazines[key];
            }

            updateMagazinePriceDisplay(magazine);
            updateCardSelectionState(magazine);
            updateSummary();
        });
    });

    function updateMagazinePriceDisplay(magazine) {
        var convTotal = 0, inrTotal = 0;
        Object.keys(selectedMagazines).forEach(function(key){
            if (key.indexOf(magazine + '_') !== 0) return;
            var item = selectedMagazines[key];
            convTotal += item.price;
            inrTotal  += item.priceInr;
        });
        var el = document.querySelector('.magazine-price[data-magazine="' + magazine + '"]');
        if (!el) return;

        if (IS_INR) {
            el.textContent = '₹' + inrTotal.toLocaleString('en-IN');
        } else {
            el.innerHTML = CURRENCY_SYMBOL + convTotal.toFixed(2)
                + (inrTotal > 0
                    ? ' <small class="magazine-price-inr">/ ₹' + inrTotal.toLocaleString('en-IN') + '</small>'
                    : '');
        }
    }

    function updateCardSelectionState(magazine) {
        var card = document.querySelector('.magazine-card[data-magazine="' + magazine + '"]');
        if (!card) return;
        var has = Object.keys(selectedMagazines).some(function(k){
            return k.indexOf(magazine + '_') === 0;
        });
        if (has) card.classList.add('selected'); else card.classList.remove('selected');
    }

    function getMagazineName(abbr) {
        var names = {
            'ol':'Outlook India','ii':'Outlook Money','olt':'Outlook Traveller',
            'ob':'Outlook Business','olh':'Outlook Hindi','olx':'Outlook Luxe'
        };
        return names[abbr] || abbr;
    }

    function getEditionName(edition) {
        if (edition === 'print')    return 'Print Edition';
        if (edition === 'digital')  return 'Digital Edition';
        if (edition === 'digital2') return 'Digital Edition';
        return edition;
    }

    function updateSummary() {
        var convTotal = 0, inrTotal = 0;
        selectedItemsContainer.innerHTML = '';

        var keys = Object.keys(selectedMagazines);
        if (keys.length === 0) {
            selectedItemsContainer.innerHTML =
                '<div class="empty-selection">No magazines selected yet</div>';
        } else {
            keys.forEach(function(key){
                var item = selectedMagazines[key];
                convTotal += item.price;
                inrTotal  += item.priceInr;

                var edText = item.edition === 'Print Edition' ? 'Print' : 'e-Mag';
                var div = document.createElement('div');
                div.className = 'selected-item';

                var priceHtml;
                if (IS_INR) {
                    priceHtml = '₹' + item.priceInr.toLocaleString('en-IN');
                } else {
                    priceHtml = CURRENCY_SYMBOL + item.price.toFixed(2)
                              + ' <small>/ ₹' + item.priceInr.toLocaleString('en-IN') + '</small>';
                }

                div.innerHTML = '<span>' + item.name + ' (' + item.duration + ', ' + edText + ')</span>'
                              + '<span>' + priceHtml + '</span>';
                selectedItemsContainer.appendChild(div);
            });
        }

        var totalHtml;
        if (IS_INR) {
            totalHtml = '₹' + inrTotal.toLocaleString('en-IN');
        } else {
            totalHtml = CURRENCY_SYMBOL + convTotal.toFixed(2) + ' / ₹' + inrTotal.toLocaleString('en-IN');
        }
        totalHtml += '<small id="total-price-inr-note">You will be charged in INR at checkout.</small>';
        totalPriceElement.innerHTML = totalHtml;

        updateFormFields();

        if (keys.length > 0) selectionError.style.display = 'none';
    }

    function updateFormFields() {
        var totalInr = 0, any1 = false, any2 = false;
        Object.keys(selectedMagazines).forEach(function(key){
            var item = selectedMagazines[key];
            totalInr += item.priceInr;
            if (item.duration === '1 Year') any1 = true; else any2 = true;
        });

        document.getElementById('form-amt').value = totalInr;
        document.getElementById('form-dura').value = (any2 && !any1) ? '2yr' : '1yr';

        var magSelect = Object.keys(selectedMagazines).map(function(key){
            var item = selectedMagazines[key];
            var durChar = item.duration.charAt(0);
            var ed = item.edition === 'Print Edition' ? 'P' : 'D';
            return item.magazine + '-' + durChar + ed;
        }).join('|');
        document.getElementById('form-mag-select').value = magSelect;

        var selectionList = Object.keys(selectedMagazines).map(function(key){
            var item = selectedMagazines[key];
            var edText = item.edition === 'Print Edition' ? 'Print Edition' : 'Digital Edition';
            return item.name + ' - ' + item.duration + ' - ' + edText + ' - ₹' + item.priceInr;
        }).join('|');
        document.getElementById('form-selectionlist').value = selectionList;
    }

    window.validateForm = function() {
        if (Object.keys(selectedMagazines).length === 0) {
            selectionError.style.display = 'block';
            var summaryBox = document.querySelector('.selection-summary');
            summaryBox.classList.add('shake');
            setTimeout(function(){ summaryBox.classList.remove('shake'); }, 500);
            return false;
        }
        updateFormFields();
        return true;
    };
});
</script>
</body>
</html>