# 🐉 Radar do Dragão — Capsule Corp. Knowledge Base

> **Sistema de Documentação Técnica, Mapeamento em Grafo de Conceitos e Gestão Wiki hospedado em rachel.github.io**

---

## 📂 Índice Mestre de Documentos (8 Notas Indexadas)

| Categoria | Documento | Tags |
| :--- | :--- | :--- |
| **Reconnaissance - Web** | **Information Gathering - Web Edition** | `#web-recon` `#passive-recon` `#active-recon` `#dns` `#whois` `#subdomain-enum` `#crt-sh` `#dorks` `#osint` `#web-archive` |
| **Footprinting & Service Enumeration** | **Footprinting Methodology & Service Discovery** | `#footprinting` `#recon` `#smb` `#cifs` `#nfs` `#dns` `#smtp` `#imap` `#pop3` `#snmp` `#mysql` `#mssql` `#oracle` `#ipmi` `#ssh` `#rdp` `#winrm` |
| **File Transfers & Evasion** | **File Transfers & Evasion Techniques** | `#file-transfers` `#windows` `#linux` `#powershell` `#certutil` `#smb` `#ftp` `#webdav` `#curl` `#wget` `#lolbas` `#gtfobins` `#encryption` |
| **Shells & Payloads** | **Shells, Payloads & Infiltration** | `#shells` `#reverse-shell` `#bind-shell` `#msfvenom` `#metasploit` `#payloads` `#web-shell` `#tty-spawn` `#eternalblue` `#printnightmare` |
| **Password Attacks & Hashes** | **Password Attacks, Hashes & Credential Harvesting** | `#passwords` `#hashcat` `#john-the-ripper` `#hydra` `#lsass` `#sam` `#ntds` `#kerberoasting` `#pass-the-hash` `#pass-the-cert` `#snaffler` |
| **Attacking Common Services** | **Attacking Common Services & Misconfigurations** | `#common-services` `#smb` `#ftp` `#sql` `#mysql` `#mssql` `#rdp` `#dns` `#email` `#log4j` `#xp-cmdshell` `#ntlm-relay` `#bluekeep` |
| **Pivoting & Tunneling** | **Pivoting, Tunneling & Port Forwarding** | `#pivoting` `#tunneling` `#chisel` `#proxychains` `#ssh-tunnel` `#socat` `#meterpreter` `#rpivot` `#netsh` `#dnscat2` `#ptunnel` `#socksoverrdp` |
| **Active Directory** | **Active Directory Enumeration & Attacks** | `#active-directory` `#kerberos` `#kerberoasting` `#asreproasting` `#dcsync` `#bloodhound` `#powerview` `#responder` `#nopac` `#printnightmare` `#gpo` `#domain-trusts` |

---

## 🚀 Como Publicar em `wiki-capsula` no GitHub Pages:

### Método 1: Enviar para `https://wiki-capsula`
1. Extraia este projeto ZIP em uma pasta do seu computador.
2. Crie um repositório no seu GitHub chamado `wiki-capsula`.
3. Abra o terminal na pasta do projeto e execute:
   ```bash
   npm install
   git init
   git add .
   git commit -m "feat: publicar Radar do Dragão"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/wiki-capsula.git
   git push -u origin main
   ```
4. No GitHub, vá até **Settings -> Pages**:
   - Em **Source**, selecione **GitHub Actions**.
   - O workflow em `.github/workflows/deploy.yml` compilará e publicará automaticamente em 1 minuto!

---

## 🛠️ Execução Local
```bash
npm install
npm run dev
```

© Capsule Corp. Tech
