let activate = async codeUrl => {
  let rawCode = new URLSearchParams(new URL(codeUrl).search).get('value')
  if (!rawCode) {
    throw new Error('Activation code not found')
  }
  let [identifier, encodedHost] = rawCode.split('-')
  let host = atob(encodedHost)
  if (identifier.length !== 20 || !/^api.*\.duosecurity\.com$/.test(host)) {
    throw new Error('Illegal activation code')
  }

  let url = `https://${host}/push/v2/activation/${identifier}`
  let body = {
    customer_protocol: '1',
    pubkey: await generatePublicKey(),
    pkpush: 'rsa-sha512',
    jailbroken: 'false',
    architecture: 'arm64',
    region: 'US',
    app_id: 'com.duosecurity.duomobile',
    full_disk_encryption: true,
    passcode_status: true,
    app_version: '4.59.0',
    app_build_number: '459010',
    version: '13',
    manufacturer: 'unknown',
    language: 'en',
    security_patch_level: '2022-11-05',
    platform: 'Android',
    model: 'Samsung Smart Fridge',
  }

  let { response, message } = await (await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body),
  })).json()

  console.log('Response:', response)

  let secret = response?.hotp_secret
  if (!secret) throw new Error(message || 'Missing secret key')
  let isTotp = response?.use_totp
  return `${isTotp ? 'Success: TOPT activated!' : 'Warning: HOTP activated instead of TOTP due to your organizations\' settings.'} Your 2FA secret key is: ${base32Encode(secret)}`
}

let generatePublicKey = async () => {
  let rsaKeyPair = await crypto.subtle.generateKey({
    name: 'RSASSA-PKCS1-v1_5',
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: 'SHA-512',
  }, true, ['sign'])
  let spki = await crypto.subtle.exportKey('spki', rsaKeyPair.publicKey)
  let base64 = btoa(String.fromCharCode(...new Uint8Array(spki)))
  return `-----BEGIN PUBLIC KEY-----\n${base64}\n-----END PUBLIC KEY-----`
}

let base32Encode = input => {
  let bits = ''
  for (let i = 0; i < input.length; i++) {
    bits += input.charCodeAt(i).toString(2).padStart(8, '0')
  }
  while (bits.length % 5 !== 0) {
    bits += '0'
  }
  let encoded = ''
  for (let i = 0; i < bits.length; i += 5) {
    encoded += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.charAt(parseInt(bits.slice(i, i + 5), 2))
  }
  return encoded
}

await activate(location.href)
