<?php
session_start();
session_destroy();
session_start();
include('inc.php');

// ------------------------------------------------------------------
// PHP 5.6-safe POST reads (no ?? operator)
// ------------------------------------------------------------------
$client_ip        = isset($_POST['client_ip'])        ? $_POST['client_ip']        : '';
$display_currency = isset($_POST['display_currency']) ? $_POST['display_currency'] : 'INR';
$kjsource         = isset($_POST['kjsource'])         ? $_POST['kjsource']         : '';
$source           = isset($_POST['source'])           ? $_POST['source']           : '';
$vouchercode      = isset($_POST['vouchercode'])      ? $_POST['vouchercode']      : '';
$selectionlist    = isset($_POST['selectionlist'])    ? $_POST['selectionlist']    : '';
$dura             = isset($_POST['dura'])             ? $_POST['dura']             : '1yr';
$gift             = isset($_POST['gift'])             ? $_POST['gift']             : '';
$mag              = isset($_POST['mag'])              ? $_POST['mag']              : '';
$mag_select       = isset($_POST['mag_select'])       ? $_POST['mag_select']       : '';
$magazine_code    = isset($_POST['magazine_code'])    ? $_POST['magazine_code']    : '15';

$amtInr = isset($_POST['amt']) ? (float)$_POST['amt'] : 0;

// Guard: no amount → bounce back to the picker
if ($amtInr <= 0) {
    $qs = array();
    if ($source)      $qs[] = 'source=' . urlencode($source);
    if ($vouchercode) $qs[] = 'vouchercode=' . urlencode($vouchercode);
    $back = 'international_subs2.php' . (count($qs) ? '?' . implode('&', $qs) : '');
    header('Location: ' . $back);
    exit;
}

$ymd       = date('YmdHis');
$rand      = rand(10000000, 99999999);
$sessionID = $ymd . $rand;
$_SESSION['purchase_amount'] = $amtInr;

// Referer (PHP 5.6-safe)
$referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
    <link rel="shortcut icon" href="https://fea.assettype.com/outlook/outlook-india/assets/favicon.ico" type="image/x-icon">
    <title>Outlook Subscription - Order Form</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
    *{margin:0;box-sizing:border-box;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif}
    body{color:#333;line-height:1.6;padding:20px;background:#fff}
    ul{padding:0;list-style:none}
    .container{max-width:800px;margin:0 auto;background:#fff;border-radius:15px;box-shadow:0 10px 30px rgb(0 0 0 / .1);overflow:hidden}
    .topheader{text-align:center;margin-bottom:10px}
    .header{background-color:#d1181e;color:#fff;padding:25px 0;text-align:center}
    h1{font-size:2.2rem;margin-bottom:10px}
    .subtitle{font-size:1.1rem;opacity:.9}
    .order-summary{background:#f8f9fa;padding:20px;border-radius:10px;margin:20px;box-shadow:0 4px 10px rgb(0 0 0 / .05)}
    .summary-title{font-size:1.4rem;color:#760605;border-bottom:2px solid #e9ecef;margin-bottom:15px;padding-bottom:10px;text-align:center}
    .summary-content{line-height:1.8}
    .form-container{padding:20px}
    .section-title{font-size:1.3rem;color:#760605;border-bottom:2px solid #e9ecef;padding-bottom:8px;margin-bottom:20px;text-align:center}
    .form-row{display:flex;flex-wrap:wrap;margin:0 -10px}
    .form-col{flex:1 0 300px;padding:0 10px;margin-bottom:15px}
    .form-group{margin-bottom:20px;width:100%}
    label{display:block;margin-bottom:8px;color:#495057;font-weight:600}
    .required::after{content:" *";color:#dc3545}
    input,select,textarea{width:100%;padding:12px 15px;border:1px solid #ced4da;border-radius:6px;font-size:16px;transition:.3s}
    input:focus,select:focus,textarea:focus{outline:0;border-color:#760605;box-shadow:0 0 0 3px rgb(118 6 5 / .1)}
    .class-textarea{width:100%;max-width:100%;height:80px;resize:none}
    .radio-group{display:flex;flex-wrap:wrap;gap:1rem;margin-top:.5rem}
    .radio-option{display:flex;align-items:center;min-height:44px;gap:8px}
    .radio-option input[type="radio"]{width:20px;height:20px;min-width:20px;cursor:pointer}
    .radio-option label{cursor:pointer;margin:0}
    .btn-container{text-align:center;margin:30px 0 20px}
    .submit-btn{background:linear-gradient(135deg,#c00 0,#760605 100%);color:#fff;border:none;padding:15px 40px;font-size:1.1rem;font-weight:600;border-radius:50px;cursor:pointer;box-shadow:0 4px 15px rgb(118 6 5 / .3)}
    .submit-btn:hover{transform:translateY(-2px);box-shadow:0 7px 20px rgb(118 6 5 / .4)}
    .payment-info{margin:20px 0;text-align:center}
    .payment-icons img{height:40px;margin:0 10px}
    .validation-error{color:#dc3545;font-size:.9rem;margin-top:5px;display:none}
    .footer{padding:15px;background:#760605;color:#fff;text-align:center}
    .footer a{color:#fc0;text-decoration:none;font-weight:600}
    li{margin-bottom:4px;padding-left:20px;position:relative;transition:.3s}
    li::before{content:"•";color:#9f0303;font-weight:700;position:absolute;left:4px}
    .shake{animation:.5s shake}
    @keyframes shake{0%,100%{transform:translateX(0)}10%,30%,50%,70%,90%{transform:translateX(-5px)}20%,40%,60%,80%{transform:translateX(5px)}}
    @media (max-width:768px){.form-col{flex:1 0 100%}h1{font-size:1.8rem}}
    </style>
    <script>
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}
        (window, document,'script','https://connect.facebook.net/en_US/fbevents.js');

        fbq('init', '1019930838075477');
        fbq('track', 'PageView');
    </script>
    <noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1019930838075477&ev=PageView&noscript=1"/></noscript>
    <script>
    var FB_SESSION_ID = <?php echo json_encode($sessionID); ?>;
    var FB_MAG         = <?php echo json_encode($mag); ?>;
    var FB_AMT_INR     = <?php echo json_encode($amtInr); ?>;

    fbq('track', 'AddToCart', {
        content_ids: FB_SESSION_ID,
        content_name: FB_MAG,
        content_type: 'magazine',
        value: FB_AMT_INR,
        currency: 'INR'
    });
    fbq('track', 'ViewContent', {
        content_category: 'international',
        content_type: 'magazine',
        content_id: FB_SESSION_ID,
        domain: window.location.hostname
    });
    fbq('track', 'Checkout', {
        content_name: 'Proceed to Checkout',
        status: true
    });
    </script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-322WCNE2BL"></script>
    <script>
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
    <div class="container">
        <div class="header">
            <h1>Outlook Subscription</h1>
            <p class="subtitle">Complete your order details</p>
        </div>

        <form name="online" action="https://subscription.outlookindia.com/processorder-new-kj.php" method="post" onsubmit="return validateForm()">

            <!-- Hidden fields -->
            <input name="MerchantID" value="00001102" type="hidden">
            <input name="ref_url_1" value="<?php echo htmlspecialchars($referer); ?>" type="hidden">
            <input name="PurchaseAmount" value="<?php echo number_format($amtInr, 2, '.', ''); ?>" type="hidden">
            <input name="SessionID" value="<?php echo htmlspecialchars($sessionID); ?>" type="hidden">
            <input name="magazine" value="<?php echo htmlspecialchars($selectionlist); ?>" type="hidden">
            <input name="duration" value="<?php echo htmlspecialchars($dura); ?>" type="hidden">
            <input name="giftdesc" value="<?php echo htmlspecialchars($gift); ?>" type="hidden">
            <input name="inco" value="0" type="hidden">
            <input name="subtype" value="sub" type="hidden">
            <input name="mag" value="<?php echo htmlspecialchars($mag); ?>" type="hidden">
            <input name="location" value="" type="hidden">
            <input name="baner" value="" type="hidden">
            <input name="refer" value="" type="hidden">
            <input name="mode_subs" value="subscription" type="hidden">
            <input name="selectionlist" value="<?php echo htmlspecialchars($selectionlist); ?>" type="hidden">
            <input name="mag_select" value="<?php echo htmlspecialchars($mag_select); ?>" type="hidden">
            <input name="magazine_code" value="<?php echo htmlspecialchars($magazine_code); ?>" type="hidden">

            <input type="hidden" name="cancel_url"
                value="https://subscription.outlookindia.com/newoffer/international_subs2.php<?php
                    $qs = array();
                    if ($source)      $qs[] = 'source=' . urlencode($source);
                    if ($vouchercode) $qs[] = 'vouchercode=' . urlencode($vouchercode);
                    echo count($qs) ? '?' . implode('&', $qs) : '';
                ?>">

            <input type="hidden" name="client_ip" value="<?php echo htmlspecialchars($client_ip); ?>">
            <!-- Gateway always charges INR -->
            <input type="hidden" name="currency" value="INR">
            <input type="hidden" name="to_currency" value="INR">
            <input type="hidden" name="display_currency" value="<?php echo htmlspecialchars($display_currency); ?>">
            <input type="hidden" name="currencySymbol" value="₹">
            <input type="hidden" name="languagesSymbol" value="en-IN">
            <input type="hidden" name="kjsource" value="<?php echo htmlspecialchars($kjsource); ?>">
            <input type="hidden" name="source" value="<?php echo htmlspecialchars($source); ?>">
            <input type="hidden" name="vouchercode" value="<?php echo htmlspecialchars($vouchercode); ?>">
            <input type="hidden" name="source2" value="international">

            <!-- Order summary -->
            <div class="order-summary">
                <h2 class="summary-title">Order Summary</h2>
                <div class="summary-content">
                    <p>I would like to subscribe, for the term indicated below.</p>
                    <ul>
                    <?php
                    if ($selectionlist !== '') {
                        $items = explode('|', $selectionlist);
                        foreach ($items as $item) {
                            $clean = preg_replace('/\s*at\s+Rs\.\s*[\d,]+/i', '', $item);
                            $parts = array_map('trim', explode('-', $clean));
                            echo '<li>' . htmlspecialchars(implode(' , ', $parts)) . '</li>';
                        }
                    }
                    ?>
                    </ul>
                    <p><strong>You Pay: ₹<?php echo number_format($amtInr, 0, '.', ','); ?> INR</strong></p>
                    <?php if ($gift): ?><p><strong><?php echo htmlspecialchars($gift); ?></strong></p><?php endif; ?>
                </div>
            </div>

            <div class="form-container">
                <h2 class="section-title">Mailing Details</h2>

                <!-- First / Last Name -->
                <div class="form-row">
                    <div class="form-col">
                        <label for="fname" class="required">First Name</label>
                        <input type="text" id="fname" name="fname" maxlength="50">
                        <div class="validation-error" id="fname-error">Please enter your first name</div>
                    </div>
                    <div class="form-col">
                        <label for="lname" class="required">Last Name</label>
                        <input type="text" id="lname" name="lname" maxlength="50">
                        <div class="validation-error" id="lname-error">Please enter your last name</div>
                    </div>
                </div>

                <!-- Gender / DOB -->
                <div class="form-row">
                    <div class="form-col">
                        <label class="required">Gender</label>
                        <div class="radio-group">
                            <div class="radio-option">
                                <input type="radio" id="male" name="sex" value="M" checked>
                                <label for="male">Male</label>
                            </div>
                            <div class="radio-option">
                                <input type="radio" id="female" name="sex" value="F">
                                <label for="female">Female</label>
                            </div>
                        </div>
                        <div class="validation-error" id="sex-error">Please select your gender</div>
                    </div>
                    <div class="form-col">
                        <label for="dob" class="required">Date of Birth</label>
                        <input type="date" id="dob" name="dob"
                            max="<?php echo date('Y-m-d', strtotime('-10 years')); ?>"
                            min="<?php echo date('Y-m-d', strtotime('-100 years')); ?>">
                        <div class="validation-error" id="dob-error">Please select your date of birth</div>
                    </div>
                </div>

                <!-- Address -->
                <div class="form-group">
                    <label for="address1" class="required">Mailing Address</label>
                    <textarea id="address1" name="address1" rows="3" class="class-textarea" placeholder="Enter your mailing address"></textarea>
                    <div class="validation-error" id="address1-error">Please enter your mailing address</div>
                </div>

                <!-- Country / Pin -->
                <div class="form-row">
                    <div class="form-col">
                        <label for="country" class="required">Country</label>
                        <select id="country" name="country">
                            <option value="">-- Select Country --</option>
                            <?php
                            $countries = array(
                                "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda",
                                "Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain",
                                "Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia",
                                "Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso",
                                "Burundi","Cambodia","Cameroon","Canada","Cape Verde","Central African Republic",
                                "Chad","Chile","China","Colombia","Comoros","Congo","Congo, Democratic Republic",
                                "Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti",
                                "Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Estonia",
                                "Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia",
                                "Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana",
                                "Haiti","Honduras","Hungary","Iceland","Indonesia","Iran","Iraq","Ireland","Israel",
                                "Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait",
                                "Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein",
                                "Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta",
                                "Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco",
                                "Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal",
                                "Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea",
                                "North Macedonia","Norway","Oman","Pakistan","Palau","Panama","Papua New Guinea",
                                "Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia",
                                "Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines",
                                "Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia",
                                "Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands",
                                "Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan",
                                "Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand",
                                "Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu",
                                "Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay",
                                "Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
                            );
                            foreach ($countries as $c) {
                                echo '<option value="' . htmlspecialchars($c) . '">' . htmlspecialchars($c) . '</option>';
                            }
                            ?>
                        </select>
                        <div class="validation-error" id="country-error">Please select your country</div>
                    </div>
                    <div class="form-col">
                        <label for="pin" class="required">Pin/Zip Code</label>
                        <input type="text" id="pin" name="pin" placeholder="Without spaces" class="number-only" maxlength="10" inputmode="numeric">
                        <div class="validation-error" id="pin-error">Please enter a valid pin/zip code</div>
                    </div>
                </div>

                <!-- Mobile / Phone -->
                <div class="form-row">
                    <div class="form-col">
                        <label for="phoneoff" class="required">Mobile</label>
                        <input type="tel" id="phoneoff" name="phoneoff" maxlength="15" class="number-only" inputmode="tel" autocomplete="tel">
                        <div class="validation-error" id="phoneoff-error">Please enter your mobile number</div>
                    </div>
                    <div class="form-col">
                        <label for="phoneres">Phone (Residence)</label>
                        <input type="tel" id="phoneres" name="phoneres" maxlength="15" class="number-only" inputmode="tel">
                    </div>
                </div>

                <!-- Email / Occupation -->
                <div class="form-row">
                    <div class="form-col">
                        <label for="email" class="required">Email</label>
                        <input type="email" id="email" name="email" placeholder="you@example.com" maxlength="150" autocomplete="email">
                        <div class="validation-error" id="email-error">Please enter a valid email address</div>
                    </div>
                    <div class="form-col">
                        <label for="occupa" class="required">Field of work</label>
                        <select id="occupa" name="occupa">
                            <option value="">-- Select --</option>
                            <option value="Sales">Sales</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Finance">Finance</option>
                            <option value="Human Resources">Human Resources</option>
                            <option value="IT &amp; Engineering">IT &amp; Engineering</option>
                            <option value="Operations">Operations</option>
                            <option value="Legal &amp; Consulting">Legal &amp; Consulting</option>
                            <option value="Education">Education</option>
                            <option value="Entrepreneur">Entrepreneur</option>
                            <option value="Medical Professional">Medical Professional</option>
                            <option value="Others">Others</option>
                        </select>
                        <div class="validation-error" id="occupa-error">Please select your field of work</div>
                    </div>
                </div>

                <!-- Seniority / Org -->
                <div class="form-row">
                    <div class="form-col">
                        <label for="desig" class="required">Level of seniority</label>
                        <select id="desig" name="desig">
                            <option value="">-- Select --</option>
                            <option value="Entrepreneur">Entrepreneur</option>
                            <option value="Senior Leadership">Senior Leadership</option>
                            <option value="Middle Management">Middle Management</option>
                            <option value="Entry Level">Entry Level</option>
                            <option value="Others">Others</option>
                        </select>
                        <div class="validation-error" id="desig-error">Please select your level of seniority</div>
                    </div>
                    <div class="form-col">
                        <label for="org">Organization</label>
                        <input type="text" id="org" name="org" maxlength="28"
                            pattern="[A-Za-z0-9 ]+"
                            title="Only letters, numbers and spaces are allowed (Maximum 28 characters)."
                            oninput="this.value=this.value.replace(/[^A-Za-z0-9 ]/g,'');">
                    </div>
                </div>

                <!-- Payment options -->
                <div class="form-row">
                    <div class="form-col">
                        <label class="required">Payment Options</label>
                        <div class="radio-group">
                            <div class="radio-option">
                                <input type="radio" id="ccavenue" name="paymentchoice" value="CCAVENUE" checked>
                                <label for="ccavenue">CCAVENUE</label>
                            </div>
                            <div class="radio-option">
                                <input type="radio" id="paytm" name="paymentchoice" value="PAYTM">
                                <label for="paytm">PAYTM</label>
                            </div>
                            <div class="radio-option">
                                <input type="radio" id="phonepe" name="paymentchoice" value="PHONEPE">
                                <label for="phonepe">PHONEPE</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="btn-container">
                    <button type="submit" name="submit1" value="Pay Online" class="submit-btn">
                        <i class="fas fa-lock"></i> Pay Now
                    </button>
                </div>

                <div class="payment-info">
                    <div class="payment-icons">
                        <img src="https://www.logo.wine/a/logo/Visa_Inc./Visa_Inc.-Logo.wine.svg" alt="Visa">
                        <img src="https://www.logo.wine/a/logo/Mastercard/Mastercard-Logo.wine.svg" alt="Mastercard">
                    </div>
                    <p>All Visa and Mastercard credit/debit cards are accepted, irrespective of the bank.</p>
                </div>
            </div>

            <div class="footer">
                <a href="JavaScript:;" onClick="window.open('https://subscription.outlookindia.com/newoffer/terms-and-conditions-international.html','terms','width=800,height=600');">
                    Terms and Conditions
                </a>
            </div>
        </form>
    </div>

    <script>
    document.addEventListener('DOMContentLoaded', function () {
        // Digits-only enforcement for pin + phones
        document.querySelectorAll('.number-only').forEach(function (input) {
            input.addEventListener('keydown', function (e) {
                if (e.key === ' ') e.preventDefault();
            });
            input.addEventListener('input', function () {
                this.value = this.value.replace(/[^0-9]/g, '');
            });
        });

        // DOB age validation (10–100)
        var dob = document.getElementById('dob');
        var dobErr = document.getElementById('dob-error');
        if (dob && dobErr) {
            dob.addEventListener('change', function () {
                if (!this.value) { dobErr.style.display = 'none'; return; }
                var d = new Date(this.value);
                if (isNaN(d.getTime())) {
                    dobErr.textContent = 'Please enter a valid date of birth (age 10–100)';
                    dobErr.style.display = 'block';
                    return;
                }
                var today = new Date();
                var age = today.getFullYear() - d.getFullYear();
                var m = today.getMonth() - d.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
                if (age < 10 || age > 100) {
                    dobErr.textContent = 'Please enter a valid date of birth (age 10–100)';
                    dobErr.style.display = 'block';
                } else {
                    dobErr.style.display = 'none';
                }
            });
        }

        // Real-time error clearing on blur
        document.querySelectorAll('input, select, textarea').forEach(function (el) {
            el.addEventListener('blur', function () {
                var err = document.getElementById(this.id + '-error');
                if (err && this.value.trim()) err.style.display = 'none';
            });
        });
    });

    function validateForm() {
        var isValid = true;
        document.querySelectorAll('.validation-error').forEach(function (el) {
            el.style.display = 'none';
        });

        function fail(id) {
            var el = document.getElementById(id + '-error');
            if (el) el.style.display = 'block';
            isValid = false;
        }
        function empty(id) {
            var el = document.getElementById(id);
            return !el || !el.value.trim();
        }

        // DOB
        var dob = document.getElementById('dob');
        if (!dob.value) {
            fail('dob');
        } else {
            var d = new Date(dob.value);
            var today = new Date();
            if (isNaN(d.getTime())) {
                fail('dob');
            } else {
                var age = today.getFullYear() - d.getFullYear();
                var m = today.getMonth() - d.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
                if (age < 10 || age > 100) fail('dob');
            }
        }

        if (empty('fname'))    fail('fname');
        if (empty('lname'))    fail('lname');
        if (empty('address1')) fail('address1');
        if (empty('country'))  fail('country');
        if (empty('pin'))      fail('pin');
        if (empty('phoneoff')) fail('phoneoff');
        if (empty('occupa'))   fail('occupa');
        if (empty('desig'))    fail('desig');

        var email = document.getElementById('email');
        if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) fail('email');

        if (!document.querySelector('input[name="sex"]:checked')) fail('sex');

        if (!isValid) {
            var fc = document.querySelector('.form-container');
            fc.classList.add('shake');
            setTimeout(function () { fc.classList.remove('shake'); }, 500);
        }
        return isValid;
    }
    </script>
</body>
</html>