# Duo TOTP
> Login through Duo with your own 2FA app

# Instructions
1. Open a Duo login page, enter your credentials, and select "Other options"
2. Select "Manage devices" and finish logging in to open the device management portal
3. Click "Add a device" and select "Duo Mobile"
4. Click "I have a table" and then click "Next"
5. Right click on the QR code and click "Open image in new tab"
6. Go to the new tab that was opened, open your browser console with F12, and paste in the following script:
   ```js
   let e=async()=>{let e=await crypto.subtle.generateKey({name:"RSASSA-PKCS1-v1_5",modulusLength:2048,
   publicExponent:new Uint8Array([1,0,1]),hash:"SHA-512"},!0,["sign"]),t=await crypto.subtle.exportKey(
   "spki",e.publicKey);return`-----BEGIN PUBLIC KEY-----\n${btoa(String.fromCharCode(...new Uint8Array(
   t)))}\n-----END PUBLIC KEY-----`},t=e=>{let t="";for(let r=0;r<e.length;r++)t+=e.charCodeAt(r).
   toString(2).padStart(8,"0");for(;t.length%5!=0;)t+="0";let r="";for(let e=0;e<t.length;e+=5)r+="ABC\
   DEFGHIJKLMNOPQRSTUVWXYZ234567".charAt(parseInt(t.slice(e,e+5),2));return r};await(async r=>{let a=
   new URLSearchParams(new URL(r).search).get("value");if(!a)throw new Error("Activation code not foun\
   d");let[o,n]=a.split("-"),s=atob(n);if(20!==o.length||!/^api.*\.duosecurity\.com$/.test(s))throw new
   Error("Illegal activation code");let i=`https://${s}/push/v2/activation/${o}`,l={customer_protocol:
   "1",pubkey:await e(),pkpush:"rsa-sha512",jailbroken:"false",architecture:"arm64",region:"US",app_id:
   "com.duosecurity.duomobile",full_disk_encryption:!0,passcode_status:!0,app_version:"4.59.0",
   app_build_number:"459010",version:"13",manufacturer:"unknown",language:"en",security_patch_level:
   "2022-11-05",platform:"Android",model:"Samsung Smart Fridge"},{response:c,message:u}=await(await
   fetch(i,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new
   URLSearchParams(l)})).json();console.log("Response:",c);let p=c?.hotp_secret;if(!p)throw new Error(u
   ||"Missing secret key");let d=c?.use_totp;return`${d?"Success: TOPT activated!":"Warning: HOTP acti\
   vated instead of TOTP due to your organizations' settings."} Your 2FA secret key is: ${t(p)}`})(
   location.href);
   ```
   Alternatively, the unminified script is available [here](script.js).
7. Enter the 2FA secret key into a 2FA authenticator of your choice
