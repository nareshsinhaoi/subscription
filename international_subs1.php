<?php 
include('functions.php');

$client_ip = $_SERVER['REMOTE_ADDR'];
 
# $client_ip = "51.195.242.240";  // GBP
#$client_ip = "218.107.132.66"; // China
#$client_ip = "62.210.101.19"; // France
#$client_ip = "147.93.156.2"; // Singapore
#$client_ip = "94.242.50.9"; // Russian Federation

$api_url =  "https://api.ipgeolocation.io/ipgeo?apiKey=2940d1c6e88440199e375ffea1942fc2&ip=$client_ip";
$api_url =  "https://api.ipgeolocation.io/ipgeo?apiKey=017706b0a63c42f3be8789ee1859e4c0&ip=$client_ip";
$response = file_get_contents($api_url);
$locationData = json_decode($response, true);
/* 

ipgeolocation - 1K Requests/day
1000 free requests per day for developers.
Geolocation - Get accurate city-level location data using IP addresses with basic precision. Ideal for non-critical geo use cases.
Country Metadata - Determine the language, top-level domain, and international dialing code of the user’s location.
Currency - Get localized currency details including ISO code, name, and symbol for pricing display or conversion.
Astronomy - Get sunrise, sunset, and moon phase data for the user’s location. Useful for travel and outdoor applications.
Timezone - Retrieve the local timezone of the user along with UTC offsets. Useful for scheduling and logging.
User-Agent - Parse the user's device, OS, and browser from the User-Agent string for analytics or personalization.

*/

$currency = $to_currency = $locationData['currency']['code'];
$currencySymbol = $locationData['currency']['symbol'];
$languagesSymbol = $locationData['languages'];


$uploadedPaths = array();
$jsonFile = 'newcovers.json'; 
$jsonPath 	 = realpath(__DIR__ . "/../assets/covers/");
$jsonSourcePath = $jsonPath . '/' .  $jsonFile ; 

if(file_exists($jsonSourcePath)){ 
	if (file_exists($jsonSourcePath)) { 
		$jsonContent = file_get_contents($jsonSourcePath); 
		$coverdata = json_decode($jsonContent, true);  
	}
}
if(!empty($coverdata))
{ 	 
	foreach ($coverdata as $key => $imagePath) {
		// Only show string keys (skip numeric keys)
		if (is_string($key)) { 
			// Clean up the image path
			$webPath = str_replace($_SERVER['DOCUMENT_ROOT'], '', $imagePath); 
			$uploadedPaths[$key] =  $webPath;
		}
	}
}
 
$imgPaths['oli_image'] = 'https://kj2.outlookindia.com'. $uploadedPaths['oli_image'];
$imgPaths['olb_image'] = 'https://kj2.outlookindia.com'. $uploadedPaths['olb_image'];
$imgPaths['olm_image'] = 'https://kj2.outlookindia.com'. $uploadedPaths['olm_image'];
$imgPaths['olt_image'] = 'https://kj2.outlookindia.com'. $uploadedPaths['olt_image'];
$imgPaths['olh_image'] = 'https://kj2.outlookindia.com'. $uploadedPaths['olh_image'];
  
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
	<!-- Favicon -->
	<link rel="shortcut icon" href="https://fea.assettype.com/outlook/outlook-india/assets/favicon.ico" type="image/x-icon">
	<link rel="apple-touch-icon" href="https://fea.assettype.com/outlook/outlook-india/assets/apple-touch-icon.png">
	<link rel="icon" type="image/png" href="https://fea.assettype.com/outlook/outlook-india/assets/favicon.ico">
	<!-- <link rel="icon" type="image/png" href="https://images.assettype.com/outlookindia/2024-02/47070d72-2da2-4509-8ce0-de538d8fa5fe/favicon.png"> -->
	<!-- Title of the webpage -->
    <title>Outlook Magazine Subscription</title>
	<link rel="shortcut icon" href="favicon.ico" type="image/x-icon">
	<link rel="icon" type="image/png" href="favicon.ico">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
	<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "utkuc7469k");
	</script>
	
	<script>
		!function(f,b,e,v,n,t,s)
		{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
		n.callMethod.apply(n,arguments):n.queue.push(arguments)};
		if(!f._fbq)f._fbq=n;
		n.push=n;n.loaded=!0;n.version='2.0';
		n.queue=[];
		t=b.createElement(e);t.async=!0;
		t.src=v;
		s=b.getElementsByTagName(e)[0];
		s.parentNode.insertBefore(t,s)}
		(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');

		fbq('init', '1019930838075477');
		fbq('track', 'PageView');
	</script>
	<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1019930838075477&ev=PageView&noscript=1"/></noscript>
	<script>
	fbq('track', 'ViewContent', {
		content_category: 'Politics',
		content_type: 'Article',
		domain: 'outlookindia'
	});
	fbq('track', 'ViewContent', {
		content_category: '{{category}}',
		content_type: '{{type}}',
		content_id: '{{article_id}}',
		domain: window.location.hostname
	});
	</script>
    
	<style>
    *{margin:0;padding:0;box-sizing:border-box;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif}body{color:#333;line-height:1.6;background-color:#f8f9fa}.container{max-width:1400px;width:95%;margin:0 auto;background:#fff;border-radius:15px;box-shadow:0 15px 40px rgb(0 0 0 / .15);overflow:hidden}.magazine-grid{display:flex;flex-wrap:nowrap;overflow-x:auto;gap:15px;margin:30px;padding-bottom:25px;padding-top:5px;transform-style:preserve-3d}.magazine-card{width:260px;min-width:260px;flex-shrink:0;background:#fff;padding:15px;margin:0 8px;border-radius:10px;overflow:hidden;transition:transform .4s cubic-bezier(.25,.8,.25,1),box-shadow .4s,border-color .4s;border:2px solid #e9ecef;box-shadow:0 4px 12px rgb(0 0 0 / .1);cursor:pointer;margin-top:10px}.magazine-card:hover{transform:translateY(-5px) scale(1);box-shadow:0 15px 30px rgb(118 6 5 / .2),0 0 0 2px #d60810}.magazine-card.selected{border-color:#fc0;transform:scale(1.01);box-shadow:0 0 0 2px #fc0;animation:pulse-selected 1.5s infinite alternate}.magazine-card .magazine-image{height:300px;width:100%;object-fit:cover;border-radius:8px}@keyframes pulse-selected{from{box-shadow:0 0 0 2px #fc0}to{box-shadow:0 0 0 3px #fc0}}.scroll-hint{display:none}@media (max-width:767px){.magazine-grid{margin:15px;gap:10px}.magazine-card{min-width:250px;width:220px;padding:12px}.magazine-card .magazine-image{height:280px}h1{font-size:1.5rem!important}.scroll-hint{display:block}}@media (min-width:768px) and (max-width:1023px){.container{max-width:960px}h1{font-size:2rem!important}}@media (min-width:1024px) and (max-width:1279px){.container{max-width:1200px}.magazine-card{width:240px;min-width:240px}}@media (min-width:1280px) and (max-width:1535px){.container{max-width:1400px}.magazine-card{width:260px;min-width:260px}}@media (min-width:1536px){.container{max-width:1700px}.magazine-card{width:290px;min-width:290px}}.header-content{margin:0 auto}.submit-btn,h1{text-transform:uppercase;letter-spacing:1px}.magazine-card,.selection-summary{box-shadow:0 5px 15px rgb(0 0 0 / .08)}header{background:linear-gradient(90deg,#d60810 0,#ef0912 100%);color:#fff;padding:30px 0;text-align:center}.header-content{display:flex;flex-direction:column;align-items:center}.header-logo{max-width:200px;margin-bottom:15px}h1{font-size:2.5rem;margin-bottom:10px}.subtitle{font-size:1.2rem;opacity:.9}.edition-options,.magazine-info{margin-bottom:15px}.duration-select,.edition-option:hover{background-color:#f8f9fa}.magazine-name{font-weight:700;font-size:1.3rem;margin-bottom:10px;color:#760605}.magazine-details{font-size:.9rem;color:#666;margin-bottom:15px;min-height:45px}.edition-price,.magazine-price{color:#c00;font-weight:600}.duration-select{width:100%;padding:10px;border:1px solid #ced4da;border-radius:6px;font-size:16px;margin-bottom:15px}.edition-option{display:flex;align-items:center;margin-bottom:10px;padding:10px;border:1px solid #e9ecef;border-radius:6px;transition:.3s}.edition-option input{margin-right:10px}.edition-label{flex:1;font-weight:600}.magazine-price{font-size:1.1rem;text-align:right;margin-top:10px}.empty-selection,.summary-title,.terms,.topheader,.validation-error{text-align:center}.selection-summary{background:#fff;border-radius:10px;padding:25px;margin:30px;position:sticky;top:20px}.summary-title{font-size:1.5rem;color:#760605;margin-bottom:20px;padding-bottom:10px;border-bottom:2px solid #f5f5f5}.selected-items{margin-bottom:20px;min-height:100px}.selected-item{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eee}.total-section{background:#f5f5f5;padding:15px;border-radius:8px;margin-top:20px}.submit-btn,.terms{background:linear-gradient(90deg,#d60810 0,#ef0912 100%)}.total-row{display:flex;justify-content:space-between;font-weight:600;font-size:1.2rem;color:#760605}.submit-btn{color:#fff;border:none;padding:15px 30px;font-size:1.1rem;font-weight:600;border-radius:50px;cursor:pointer;display:block;width:100%;margin-top:20px;transition:.3s;box-shadow:0 4px 15px rgb(118 6 5 / .3)}.submit-btn:hover{transform:translateY(-2px);box-shadow:0 7px 20px rgb(118 6 5 / .4)}.submit-btn:active{transform:translateY(0)}.terms{margin-top:30px;padding:15px;color:#fff;border-radius:0 0 10px 10px}.terms a{color:#fff;text-decoration:none;font-weight:600}.terms a:hover{text-decoration:underline}.validation-error{color:#ff3860;font-size:.9rem;display:none;padding:10px;background:#ffeef0;border-radius:5px;margin-top:15px}.empty-selection{color:#999;font-style:italic;padding:20px 0}.shake{animation:.5s shake}@keyframes shake{0%,100%{transform:translateX(0)}10%,30%,50%,70%,90%{transform:translateX(-5px)}20%,40%,60%,80%{transform:translateX(5px)}}.topheader{margin-bottom:10px;background-color:#FFF}.shadow-md{--tw-shadow:0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);--tw-shadow-colored:0 4px 6px -1px var(--tw-shadow-color), 0 2px 4px -2px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow)}.py-4{padding-top:1rem;padding-bottom:1rem}.mt-8{margin-top:2rem}.mt-4{margin-top:1rem}.text-center{text-align:center}
	</style>
	
</head>
<body>
	<div class="topheader shadow-md py-4">
		<div class="logo">
		<a href="JavaScript:;"><img src="https://kj2.outlookindia.com/easyqr/img/outlook-group.jpg" class="olg-logo"></a>
		</div>
	</div>
	
    <div class="container mx-auto mt-8">
        <header>
            <div class="header-content">
                <!-- <img src="https://subscription.outlookindia.com/newoffer/images/logo.png" alt="Outlook India" class="header-logo"> -->
                <h1><?php echo translateText('Subscription for International Readers', $languagesSymbol)?></h1>
                <p class="subtitle"><?php echo translateText('Select your favorite magazines and enjoy worldwide delivery through Registered Post', $languagesSymbol)?></p>
            </div>
        </header>
        
        <!-- <form name="online" action="https://subscription.outlookindia.com/orderform_international_new.php" method="post" onsubmit="return validateForm()"> OL-TEO-KJ-INTL-1-WFHE130482-->
        <form name="online" action="orderform_international_new.php" method="post" onsubmit="return validateForm()">
            <!-- Hidden form fields -->
            <input type="hidden" name="sess" value="20140822151657799013952">
            <input name="magazine_code" value="15" type="hidden">
            <input type="hidden" name="amt" id="form-amt" value="">
            <input type="hidden" name="dura" id="form-dura" value="">
            <input type="hidden" name="strlocation" value="NBBP">
            <input type="hidden" name="gift" value="">
            <input type="hidden" name="ggift" value="">
            <input type="hidden" name="mag" id="form-mag" value="OL-TEO-KJ-INTL<?php if(isset($_REQUEST['source'])){ echo $_REQUEST['source'] ; }?><?php if(isset($_REQUEST['vouchercode'])){ echo "-".$_REQUEST['vouchercode']; }?>">
            <input type="hidden" name="mag_select" id="form-mag-select" value="">
            <input type="hidden" name="selectionlist" id="form-selectionlist" value="">
            <input type="hidden" name="printoffline" value="false">
			
            <input type="hidden" name="client_ip" value="<?php echo $client_ip;?>">
			<input type="hidden" name="currency" value="<?php echo $currency;?>" />
			<input type="hidden" name="to_currency" value="<?php echo $to_currency;?>"> 
			<input type="hidden" name="currencySymbol" value="<?php echo $currencySymbol;?>" />
			<input type="hidden" name="languagesSymbol" value="<?php echo $languagesSymbol;?>" />
 
            <input type="hidden" name="source" value="<?php if(isset($_REQUEST['source'])){ echo $_REQUEST['source']; }?>">
			<input type="hidden" name="vouchercode" value="<?php if(isset($_REQUEST['vouchercode'])){ echo $_REQUEST['vouchercode']; }?>">
			<input type="hidden" name="kjsource" value="<?php if(isset($_REQUEST['vouchercode'])){ echo $_REQUEST['vouchercode']; }?>">
            
			
			<!-- Scrollable hint for mobile -->
			<p class="text-center text-sm text-gray-500 mt-4 lg:hidden scroll-hint">
				<strong>&larr; Scroll horizontally  &rarr;</strong><br />(All magazines options)
			</p>
			
			
            <div class="magazine-grid">
                <!-- Outlook Magazine Card -->
                <div class="magazine-card" data-magazine="ol">
                    <img src="<?php echo $imgPaths['oli_image']?>" alt="Outlook Magazine" class="magazine-image">
                    <div class="magazine-info">
                        <div class="magazine-name"><?php echo translateText('Outlook India', $languagesSymbol)?></div>
                        <div class="magazine-details">26 Issues / Year | In-depth news analysis</div>
                    </div>
                    
                    <select class="duration-select" data-magazine="ol">
                        <option value="">Select Duration</option>
                        <option value="1" data-print="<?php echo convertCurrency(11000,  $to_currency)?>" data-digital="<?php echo convertCurrency(2600,  $to_currency)?>">1 Year</option>
                        <option value="2" data-print="0" data-digital="<?php echo convertCurrency(5200,  $to_currency)?>">2 Years</option>
                    </select>
                    
                    <div class="edition-options">
                        <label class="edition-option">
                            <input type="checkbox" name="ol_edition" value="print" data-price="<?php echo convertCurrency(11000,  $to_currency)?>">
                            <span class="edition-label"><?php echo translateText('Print', $languagesSymbol)?></span>
                            <span class="edition-price"><?php echo $currencySymbol?><?php echo convertCurrency(11000,  $to_currency)?></span>
                        </label>
                        
                        <label class="edition-option">
                            <input type="checkbox" name="ol_edition" value="digital" data-price="<?php echo convertCurrency(2600,  $to_currency)?>">
                            <span class="edition-label"><?php echo translateText('e-Mag', $languagesSymbol)?></span>
                            <span class="edition-price"><?php echo $currencySymbol?><?php echo convertCurrency(2600,  $to_currency)?></span>
                        </label>
                        <label class="edition-option" style="display:none;">
                            <input type="checkbox" name="ol_edition" value="digital2" data-price="<?php echo convertCurrency(5200,  $to_currency)?>">
                            <span class="edition-label"><?php echo translateText('e-Mag', $languagesSymbol)?> </span>
                            <span class="edition-price"><?php echo $currencySymbol;?><?php echo convertCurrency(5200,  $to_currency)?></span>
                        </label>
                    </div>
                    
                    <div class="magazine-price" data-magazine="ol"><?php echo $currencySymbol;?>0</div>
                </div>
                
                <!-- Outlook Money Card -->
                <div class="magazine-card" data-magazine="ii">
                    <img src="<?php echo $imgPaths['olm_image']?>" alt="Outlook Money" class="magazine-image">
                    <div class="magazine-info">
                        <div class="magazine-name"><?php echo translateText('Outlook Money', $languagesSymbol)?></div>
                        <div class="magazine-details">12 Issues / Year | Financial guidance</div>
                    </div>
                    
                    <select class="duration-select" data-magazine="ii">
                        <option value="">Select Duration</option>
                        <option value="1" data-print="<?php echo convertCurrency(5050,  $to_currency)?>" data-digital="<?php echo convertCurrency(960,  $to_currency)?>">1 Year</option>
                        <option value="2" data-print="0" data-digital="<?php echo convertCurrency(1920,  $to_currency)?>">2 Years</option>
                    </select> 
                    
                    <div class="edition-options">
                        <label class="edition-option">
                            <input type="checkbox" name="ii_edition" value="print" data-price="<?php echo convertCurrency(5050,  $to_currency)?>">
                            <span class="edition-label"><?php echo translateText('Print', $languagesSymbol)?></span>
                            <span class="edition-price"><?php echo $currencySymbol;?><?php echo convertCurrency(5050,  $to_currency)?></span>
                        </label> 
                        <label class="edition-option">
                            <input type="checkbox" name="ii_edition" value="digital" data-price="<?php echo convertCurrency(960,  $to_currency)?>">
                            <span class="edition-label"><?php echo translateText('e-Mag', $languagesSymbol)?></span>
                            <span class="edition-price"><?php echo $currencySymbol;?><?php echo convertCurrency(960,  $to_currency)?></span>
                        </label>
                        <label class="edition-option" style="display:none;">
                            <input type="checkbox" name="ii_edition" value="digital2" data-price="<?php echo convertCurrency(1920,  $to_currency)?>">
                            <span class="edition-label"><?php echo translateText('e-Mag', $languagesSymbol)?> </span>
                            <span class="edition-price"><?php echo $currencySymbol;?><?php echo convertCurrency(1920,  $to_currency)?></span>
                        </label>
                    </div> 
                    
                    <div class="magazine-price" data-magazine="ii"><?php echo $currencySymbol;?>0</div>
                </div>
                
                <!-- Outlook Traveller Card -->
                <div class="magazine-card" data-magazine="olt">
                    <img src="<?php echo $imgPaths['olt_image']?>" alt="Outlook Traveller" class="magazine-image">
                    <div class="magazine-info">
                        <div class="magazine-name"><?php echo translateText('Outlook Traveller', $languagesSymbol)?></div>
                        <div class="magazine-details">6 Issues / Year | Travel inspiration</div>
                    </div>
                    
                    <select class="duration-select" data-magazine="olt">
                        <option value="">Select Duration</option>
                        <option value="1" data-print="<?php echo convertCurrency(2850,  $to_currency)?>" data-digital="<?php echo convertCurrency(900,  $to_currency)?>">1 Year</option>
                        <option value="2" data-print="0" data-digital="<?php echo convertCurrency(1800,  $to_currency)?>">2 Years</option>
                    </select>
                    
                    <div class="edition-options">
                        <label class="edition-option">
                            <input type="checkbox" name="olt_edition" value="print" data-price="<?php echo convertCurrency(2850,  $to_currency)?>">
                            <span class="edition-label"><?php echo translateText('Print', $languagesSymbol)?></span>
                            <span class="edition-price"><?php echo $currencySymbol;?><?php echo convertCurrency(2850,  $to_currency)?></span>
                        </label>
                        
                        <label class="edition-option">
                            <input type="checkbox" name="olt_edition" value="digital" data-price="<?php echo convertCurrency(900,  $to_currency)?>">
                            <span class="edition-label"><?php echo translateText('e-Mag', $languagesSymbol)?></span>
                            <span class="edition-price"><?php echo $currencySymbol;?><?php echo convertCurrency(900,  $to_currency)?></span>
                        </label>
                        <label class="edition-option" style="display:none;">
                            <input type="checkbox" name="olt_edition" value="digital2" data-price="<?php echo convertCurrency(1800,  $to_currency)?>">
                            <span class="edition-label"><?php echo translateText('e-Mag', $languagesSymbol)?></span>
                            <span class="edition-price"><?php echo $currencySymbol;?><?php echo convertCurrency(1800,  $to_currency)?></span>
                        </label>
                    </div>
                    
                    <div class="magazine-price" data-magazine="olt"><?php echo $currencySymbol;?>0</div>
                </div>
                
                <!-- Outlook Business Card -->
                <div class="magazine-card" data-magazine="ob">
                    <img src="<?php echo $imgPaths['olb_image']?>" alt="Outlook Business" class="magazine-image">
                    <div class="magazine-info">
                        <div class="magazine-name"><?php echo translateText('Outlook Business', $languagesSymbol)?></div>
                        <div class="magazine-details">12 Issues / Year | Business insights</div>
                    </div>
                    
                    <select class="duration-select" data-magazine="ob">
                        <option value="">Select Duration</option>
                        <option value="1" data-print="<?php echo convertCurrency(5200,  $to_currency)?>" data-digital="<?php echo convertCurrency(1200,  $to_currency)?>">1 Year</option>
                        <option value="2" data-print="0" data-digital="2400">2 Years</option>
                    </select>
                    
                    <div class="edition-options">
                        <label class="edition-option">
                            <input type="checkbox" name="ob_edition" value="print" data-price="<?php echo convertCurrency(5200,  $to_currency)?>">
                            <span class="edition-label"><?php echo translateText('Print', $languagesSymbol)?></span>
                            <span class="edition-price"><?php echo $currencySymbol;?><?php echo convertCurrency(5200,  $to_currency)?></span>
                        </label>
                        
                        <label class="edition-option">
                            <input type="checkbox" name="ob_edition" value="digital" data-price="<?php echo convertCurrency(1200,  $to_currency)?>">
                            <span class="edition-label"><?php echo translateText('e-Mag', $languagesSymbol)?></span>
                            <span class="edition-price"><?php echo $currencySymbol;?><?php echo convertCurrency(1200,  $to_currency)?></span>
                        </label>
                        <label class="edition-option" style="display:none;">
                            <input type="checkbox" name="ob_edition" value="digital2" data-price="<?php echo convertCurrency(2400,  $to_currency)?>">
                            <span class="edition-label"><?php echo translateText('e-Mag', $languagesSymbol)?> </span>
                            <span class="edition-price"><?php echo $currencySymbol;?><?php echo convertCurrency(2400,  $to_currency)?></span>
                        </label>
                    </div> 
                    
                    <div class="magazine-price" data-magazine="ob"><?php echo $currencySymbol;?>0</div>
                </div>
                
                <!-- Outlook Hindi Card -->
                <div class="magazine-card" data-magazine="olh">
                    <img src="<?php echo $imgPaths['olh_image']?>" alt="Outlook Hindi" class="magazine-image">
                    <div class="magazine-info">
                        <div class="magazine-name"><?php echo translateText('Outlook Hindi', $languagesSymbol)?></div>
                        <div class="magazine-details">12 Issues / Year | Hindi content</div>
                    </div> 
                    
                    <select class="duration-select" data-magazine="olh">
                        <option value="">Select Duration</option>
                        <option value="1" data-print="<?php echo convertCurrency(5000,  $to_currency)?>" data-digital="<?php echo convertCurrency(600,  $to_currency)?>">1 Year</option>
                        <option value="2" data-print="0" data-digital="<?php echo convertCurrency(1200,  $to_currency)?>">2 Years</option>
                    </select> 
                    <div class="edition-options">
                        <label class="edition-option">
                            <input type="checkbox" name="olh_edition" value="print" data-price="<?php echo convertCurrency(5000,  $to_currency)?>">
                            <span class="edition-label"><?php echo translateText('Print', $languagesSymbol)?></span>
                            <span class="edition-price"><?php echo $currencySymbol;?><?php echo convertCurrency(5000, $to_currency)?></span>
                        </label> 
                        <label class="edition-option">
                            <input type="checkbox" name="olh_edition" value="digital" data-price="<?php echo convertCurrency(600, $to_currency)?>">
                            <span class="edition-label"><?php echo translateText('e-Mag', $languagesSymbol)?></span>
                            <span class="edition-price"><?php echo $currencySymbol;?><?php echo convertCurrency(600,  $to_currency)?></span>
                        </label>
                        <label class="edition-option" style="display:none;">
                            <input type="checkbox" name="olh_edition" value="digital2" data-price="<?php echo convertCurrency(1200,  $to_currency)?>">
                            <span class="edition-label"><?php echo translateText('e-Mag', $languagesSymbol)?> </span>
                            <span class="edition-price"><?php echo $currencySymbol;?><?php echo convertCurrency(1200,  $to_currency)?></span>
                        </label>
                    </div> 
                    <div class="magazine-price" data-magazine="olh"><?php echo $currencySymbol;?>0</div>
                </div>
				
				<?php /* ?>
				<!-- Outlook Luxe Card -->
                <div class="magazine-card" data-magazine="olx">
                    <img src="https://img-2.outlookindia.com/outlook-luxe/01_Cover_Outlook Luxe_GA.jpg" alt="Outlook Luxe" class="magazine-image">
                    <div class="magazine-info">
                        <div class="magazine-name"><?php echo translateText('Outlook Luxe', $languagesSymbol)?></div>
                        <div class="magazine-details">26 Issues / Year | Luxe content</div>
                    </div>
                    <select class="duration-select" data-magazine="olx">
                        <option value="">Select Duration</option>
                        <option value="1" data-print="<?php echo convertCurrency(1,  $to_currency)?>" data-digital="<?php echo convertCurrency(30,  $to_currency)?>">1 Year</option>
                        <option value="2" data-print="0" data-digital="<?php echo convertCurrency(119,  $to_currency)?>">2 Years</option>
                    </select> 
                    <div class="edition-options">
                        <label class="edition-option">
                            <input type="checkbox" name="olx_edition" value="print" data-price="<?php echo convertCurrency(1,  $to_currency)?>">
                            <span class="edition-label"><?php echo translateText('Print Edition', $languagesSymbol)?></span>
                            <span class="edition-price"><?php echo $currencySymbol;?><?php echo convertCurrency(1, $to_currency)?></span>
                        </label> 
                        <label class="edition-option">
                            <input type="checkbox" name="olx_edition" value="digital" data-price="<?php echo convertCurrency(30, $to_currency)?>">
                            <span class="edition-label"><?php echo translateText('Digital Edition', $languagesSymbol)?></span>
                            <span class="edition-price"><?php echo $currencySymbol;?><?php echo convertCurrency(30,  $to_currency)?></span>
                        </label>
                        <label class="edition-option" style="display:none;">
                            <input type="checkbox" name="olx_edition" value="digital2" data-price="<?php echo convertCurrency(119,  $to_currency)?>">
                            <span class="edition-label"><?php echo translateText('Digital Edition', $languagesSymbol)?> </span>
                            <span class="edition-price"><?php echo $currencySymbol;?><?php echo convertCurrency(1,  $to_currency)?></span>
                        </label>
                    </div> 
                    <div class="magazine-price" data-magazine="olx"><?php echo $currencySymbol;?>0</div>
                </div>
				<?php */ ?> 
            </div>
            
            <div class="selection-summary">
                <h2 class="summary-title"><?php echo translateText('Your Selection Summary', $languagesSymbol)?></h2>
                
                <div class="selected-items" id="selected-items">
                    <div class="empty-selection">No magazines selected yet</div>
                </div>
                
                <div class="total-section">
                    <div class="total-row">
                        <span>Total Payout:</span>
                        <span id="total-price"><?php echo $currencySymbol?> 0</span>
                    </div>
                </div>
                
                <div class="validation-error" id="selection-error">
                    Please select at least one magazine to continue.
                </div>
                
                <button type="submit" class="submit-btn pulse">Proceed to Checkout</button>
            </div>
            
            <div class="terms">
                <a href="JavaScript:;" onClick="window.open('terms-and-conditions-international.html','terms','width=800,height=600,top=100,left=100');">
                    Terms & Conditions </a> | <a href="https://www.outlookindia.com/privacy-policy" target="_blank" class="text-gray-500 hover:text-primary-red transition duration-150 underline">Privacy Policy</a> | <a href="https://www.outlookindia.com/contact-us" target="_blank"  class="text-gray-500 hover:text-primary-red transition duration-150 underline">Contact us</a>
            </div>
        </form>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const durationSelects = document.querySelectorAll('.duration-select');
            const editionCheckboxes = document.querySelectorAll('.edition-options input[type="checkbox"]');
            const selectedItemsContainer = document.getElementById('selected-items');
            const totalPriceElement = document.getElementById('total-price');
            const selectionError = document.getElementById('selection-error');
			const editionOptions = document.querySelectorAll('.edition-option');
            
            let selectedMagazines = {};
            let totalPrice = 0.00;
            
            // Initialize - disable all edition checkboxes on page load
            editionCheckboxes.forEach(checkbox => {
                checkbox.disabled = true;
                checkbox.checked = false;
            });
            
            // Add event listeners to duration selects
            durationSelects.forEach(select => {
                select.addEventListener('change', function() {
                    const magazine = this.dataset.magazine;
                    const duration = this.value;
                    
                    // Reset all checkboxes for this magazine
                    const magazineCheckboxes = document.querySelectorAll(`input[name="${magazine}_edition"]`);
                    magazineCheckboxes.forEach(checkbox => {
                        checkbox.checked = false;
                        checkbox.disabled = true;
                    });
                    
                    // Enable appropriate checkboxes based on duration
                    if (duration === '1') {
                        // Enable both print and digital for 1 year
                        const printCheckbox = document.querySelector(`input[name="${magazine}_edition"][value="print"]`);
                        const digitalCheckbox = document.querySelector(`input[name="${magazine}_edition"][value="digital"]`);
                        
                        if (printCheckbox) {
                            printCheckbox.disabled = false;
                            printCheckbox.parentElement.style.display = 'flex';
                        }
                        if (digitalCheckbox) {
                            digitalCheckbox.disabled = false;
                            digitalCheckbox.parentElement.style.display = 'flex';
                        }
                        
                        // Hide 2-year digital option
                        const digital2Checkbox = document.querySelector(`input[name="${magazine}_edition"][value="digital2"]`);
                        if (digital2Checkbox) digital2Checkbox.parentElement.style.display = 'none';
                        
                    } else if (duration === '2') {
                        // Enable only 2-year digital option
                        const digital2Checkbox = document.querySelector(`input[name="${magazine}_edition"][value="digital2"]`);
                        if (digital2Checkbox) {
                            digital2Checkbox.disabled = false;
                            digital2Checkbox.parentElement.style.display = 'flex';
                        }
                        
                        // Hide 1-year options
                        const printCheckbox = document.querySelector(`input[name="${magazine}_edition"][value="print"]`);
                        const digitalCheckbox = document.querySelector(`input[name="${magazine}_edition"][value="digital"]`);
                        
                        if (printCheckbox) printCheckbox.parentElement.style.display = 'none';
                        if (digitalCheckbox) digitalCheckbox.parentElement.style.display = 'none';
                        
                    } else {
                        // No duration selected - disable all options
                        const magazineCheckboxes = document.querySelectorAll(`input[name="${magazine}_edition"]`);
                        
						//magazineCheckboxes.forEach(checkbox => {
                        //    checkbox.disabled = true;
                        //    checkbox.checked = false;
                        //    checkbox.parentElement.style.display = 'flex';
                        //});
                        
                        // Hide 2-year digital option specifically
                        //const digital2Checkbox = document.querySelector(`input[name="${magazine}_edition"][value="digital2"]`);
                        //if (digital2Checkbox) digital2Checkbox.parentElement.style.display = 'none';
                    }
                    
                    // Remove all editions of this magazine from selection
                    Object.keys(selectedMagazines).forEach(key => {
                        if (key.startsWith(magazine + '_')) {
                            delete selectedMagazines[key];
                        }
                    });
                    
                    // Update magazine price display
                    updateMagazinePriceDisplay(magazine);
                    
                    // Update card selection state
                    updateCardSelectionState(magazine);
                    
                    // Update summary
                    updateSummary();
                });
            });
			
			// Add click event to edition option labels
			editionOptions.forEach(option => {
				option.addEventListener('click', function(e) {
					const checkbox = this.querySelector('input[type="checkbox"]');
					if (checkbox && checkbox.disabled) {
						e.preventDefault();
						e.stopPropagation();
						
						// Find the magazine and duration select
						const magazine = checkbox.name.split('_')[0];
						const durationSelect = document.querySelector(`.duration-select[data-magazine="${magazine}"]`);
						
						if (durationSelect) {
							// Highlight the duration dropdown
							durationSelect.style.border = '2px solid #ff0000';
							durationSelect.style.boxShadow = '0 0 5px rgba(255, 0, 0, 0.5)';
							
							// Show message
							//alert('Please select a duration first');
							
							// Focus on the duration dropdown
							durationSelect.focus();
							
							// Remove highlight after 2 seconds
							setTimeout(() => {
								durationSelect.style.border = '';
								durationSelect.style.boxShadow = '';
							}, 2000);
						}
					}
				});
			});
            
            // Add event listeners to edition checkboxes
            editionCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    const magazine = this.name.split('_')[0];
                    const edition = this.value;
                    const durationSelect = document.querySelector(`.duration-select[data-magazine="${magazine}"]`);
                    const duration = durationSelect.value;
                    
                    if (!duration) {
                        this.checked = false;
                        alert('Please select duration first');
                        return;
                    }
                    
                    // Get price from data attribute
                    const price = parseFloat(this.dataset.price);
                    const selectionKey = `${magazine}_${edition}`;
                    
                    if (this.checked) {
                        // Add to selection
                        selectedMagazines[selectionKey] = {
                            name: getMagazineName(magazine),
                            edition: getEditionName(edition, duration),
                            duration: duration === '1' ? '1 Year' : '2 Years',
                            price: price,
                            magazine: magazine
                        };
                    } else {
                        // Remove from selection
                        delete selectedMagazines[selectionKey];
                    }
                    
                    // Update magazine price display
                    updateMagazinePriceDisplay(magazine);
                    
                    // Update card selection state
                    updateCardSelectionState(magazine);
                    
                    // Update summary
                    updateSummary();
                });
            });
            
            // Update magazine price display for a specific magazine
            function updateMagazinePriceDisplay(magazine) {
                let magazineTotal = 0;
                
                // Calculate total for this magazine
                Object.keys(selectedMagazines).forEach(key => {
                    if (key.startsWith(magazine + '_')) {
                        let floatPrice = parseFloat(selectedMagazines[key].price) || 0;
                        //alert(selectedMagazines[key].magazine +' @ '+ selectedMagazines[key].duration +' @ '+ selectedMagazines[key].edition +' @ '+ selectedMagazines[key].price  )
                        magazineTotal +=  floatPrice;
                    }
                });
                
                // Update display
                const priceElement = document.querySelector(`.magazine-price[data-magazine="${magazine}"]`);
                priceElement.textContent = `<?php echo $currencySymbol;?>${magazineTotal.toFixed(2)}`;
            }
            
            // Update card selection state
            function updateCardSelectionState(magazine) {
                const card = document.querySelector(`.magazine-card[data-magazine="${magazine}"]`);
                const hasSelection = Object.keys(selectedMagazines).some(key => key.startsWith(magazine + '_'));
                
                if (hasSelection) {
                    card.classList.add('selected');
                } else {
                    card.classList.remove('selected');
                }
            }
            
            // Get magazine name from abbreviation
            function getMagazineName(abbr) {
                const names = {
                    'ol': 'Outlook India',
                    'ii': 'Outlook Money',
                    'olt': 'Outlook Traveller',
                    'ob': 'Outlook Business',
                    'olh': 'Outlook Hindi',
					'olx': 'Outlook Luxe'
                };
                return names[abbr] || abbr;
            }
            
            // Get edition name from value and duration
            function getEditionName(edition, duration) {
                if (edition === 'print') return 'Print Edition';
                if (edition === 'digital') return 'Digital Edition';
                if (edition === 'digital2') return 'Digital Edition';
                return edition;
            }
            
            // Update summary section

            function updateSummary() {
                totalPrice = 0.00;
                
                // Clear the summary container
                selectedItemsContainer.innerHTML = '';
                
                // Update selected items display
                if (Object.keys(selectedMagazines).length === 0) {
                    selectedItemsContainer.innerHTML = '<div class="empty-selection">No magazines selected yet</div>';
                } else {
                    // Display each selected magazine edition
                    for (const key in selectedMagazines) {
                        const item = selectedMagazines[key];
                        totalPrice += item.price;
                         
                        const itemElement = document.createElement('div');
                        itemElement.className = 'selected-item';
						const editionText = item.edition !== 'Print Edition' ? 'e-Mag' : 'Print';//item.edition;
						
                        itemElement.innerHTML = `
                            <span>${item.name} (${item.duration}, ${editionText})</span>
                            <span><?php echo $currencySymbol;?>${item.price. toFixed(2)}</span>
                        `;
                        selectedItemsContainer.appendChild(itemElement);
                    }
                }
                
                // Update total price
                totalPriceElement.textContent = `<?php echo $currencySymbol;?> ${totalPrice .toFixed(2)}`;
                //totalPriceElement.textContent = `₹${totalPrice.toLocaleString()}`;
                
                // Update form hidden fields
                updateFormFields();
                
                // Hide error if selection is made
                if (Object.keys(selectedMagazines).length > 0) {
                    selectionError.style.display = 'none';
                }
            }
            
            // Update form hidden fields
            function updateFormFields() {
                // Update amt field with total price
                document.getElementById('form-amt').value = totalPrice;
                
                // Update dura field
                document.getElementById('form-dura').value = "1yr";
                
                // Update mag_select field with pipe separated magazine codes
                const magSelect = Object.keys(selectedMagazines).map(key => {
                    const item = selectedMagazines[key];
                    return `${item.magazine}-${item.duration.charAt(0)}`;
                }).join('|');
                document.getElementById('form-mag-select').value = magSelect;
                
                // Update selectionlist field with pipe separated magazine names and prices
                const selectionList = Object.keys(selectedMagazines).map(key => {
                    const item = selectedMagazines[key];
                    return `${item.name} - ${item.duration} - ${item.edition} - <?php #echo $currencySymbol;?>${item.price}`;
                }).join('|');
                
                document.getElementById('form-selectionlist').value = selectionList;
            }
            
            // Form validation
            window.validateForm = function() {
                if (Object.keys(selectedMagazines).length === 0) {
                    selectionError.style.display = 'block';
                    
                    // Add shake animation to summary box
                    const summaryBox = document.querySelector('.selection-summary');
                    summaryBox.classList.add('shake');
                    setTimeout(() => {
                        summaryBox.classList.remove('shake');
                    }, 500);
                    
                    return false;
                }
                
                // Update form fields one last time before submission
                updateFormFields();
                return true;
            };
        });
    </script>
</body>
</html> 