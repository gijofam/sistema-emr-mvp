param(
  [Parameter(Mandatory = $true)]
  [string]$LanIp
)

$address = $null
if (-not [System.Net.IPAddress]::TryParse($LanIp, [ref]$address) -or
    $address.AddressFamily -ne [System.Net.Sockets.AddressFamily]::InterNetwork) {
  throw 'Indica una dirección IPv4 válida para la laptop.'
}

$opensslCommand = Get-Command openssl -ErrorAction SilentlyContinue
$openssl = if ($opensslCommand) { $opensslCommand.Source } else { 'C:\Program Files\Git\usr\bin\openssl.exe' }
if (-not (Test-Path -LiteralPath $openssl)) {
  throw 'OpenSSL no está disponible. Instala Git for Windows u OpenSSL.'
}

$certDir = Join-Path $PSScriptRoot '..\dev-certs'
New-Item -ItemType Directory -Path $certDir -Force | Out-Null
@"
subjectAltName=IP:$LanIp,IP:127.0.0.1,DNS:localhost
basicConstraints=critical,CA:FALSE
keyUsage=critical,digitalSignature,keyEncipherment
extendedKeyUsage=serverAuth
"@ | Set-Content -Path (Join-Path $certDir 'server.ext') -Encoding ascii

& $openssl req -x509 -newkey rsa:3072 -sha256 -days 365 -nodes -keyout (Join-Path $certDir 'rootCA-key.pem') -out (Join-Path $certDir 'rootCA.pem') -subj '/CN=EMR Local Development CA' -addext 'basicConstraints=critical,CA:TRUE' -addext 'keyUsage=critical,keyCertSign,cRLSign' 2>$null
if ($LASTEXITCODE -ne 0) { throw 'No se pudo crear la autoridad local.' }

& $openssl req -newkey rsa:3072 -nodes -keyout (Join-Path $certDir 'server-key.pem') -out (Join-Path $certDir 'server.csr') -subj "/CN=$LanIp" 2>$null
if ($LASTEXITCODE -ne 0) { throw 'No se pudo crear el certificado del servidor.' }

& $openssl x509 -req -in (Join-Path $certDir 'server.csr') -CA (Join-Path $certDir 'rootCA.pem') -CAkey (Join-Path $certDir 'rootCA-key.pem') -CAcreateserial -out (Join-Path $certDir 'server.pem') -days 90 -sha256 -extfile (Join-Path $certDir 'server.ext') 2>$null
if ($LASTEXITCODE -ne 0) { throw 'No se pudo firmar el certificado del servidor.' }

Copy-Item -LiteralPath (Join-Path $certDir 'rootCA.pem') -Destination (Join-Path $certDir 'rootCA.crt') -Force
& $openssl verify -CAfile (Join-Path $certDir 'rootCA.pem') (Join-Path $certDir 'server.pem')
if ($LASTEXITCODE -ne 0) { throw 'El certificado no pasó la verificación.' }

Write-Output "Certificado listo para https://$LanIp`:5173/"
Write-Output "Instala solo $(Join-Path $certDir 'rootCA.crt') en el celular. Nunca copies rootCA-key.pem."
