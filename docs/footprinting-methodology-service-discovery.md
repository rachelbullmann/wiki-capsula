# Footprinting Methodology & Service Discovery

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
```bash
smbclient -N -L //<TARGET_IP>
smbmap -H <TARGET_IP>
```
- **Interação via rpcclient:**
```bash
rpcclient -U "" -N <TARGET_IP>
querydominfo
enumdomusers
enumdomgroups
```
- **CrackMapExec / NetExec (nxc):**
```bash
nxc smb <TARGET_IP> -u '' -p '' --shares
```
- **Enum4Linux-ng & samrdump.py:** Automação completa de enumeração de SID e usuários.

### 2. NFS - Network File System (Porta 2049)
Sistemas de arquivos compartilhados em ambientes Linux/Unix.
- **Listar exportações:**
```bash
showmount -e <TARGET_IP>
```
- **Montar diretório remoto:**
```bash
mkdir /tmp/nfs_mount
mount -t nfs <TARGET_IP>:/compartilhamento /tmp/nfs_mount -o nolock
```

### 3. DNS (Porta 53 UDP/TCP)
- Consulta de versão de servidor BIND9 e registros:
```bash
dig NS <TARGET_IP>
dig version.bind CHAOS TXT @<TARGET_IP>
dig ANY @<TARGET_IP> targetdomain.com
```

### 4. SMTP (Porta 25 / 587)
- **Enumeração manual via Telnet / Netcat:**
```text
telnet <TARGET_IP> 25
VRFY root
EXPN admin
RCPT TO: user@domain.com
```
- **smtp-user-enum:**
```bash
smtp-user-enum -M VRFY -U /usr/share/seclists/Usernames/top-usernames.txt -t <TARGET_IP>
```

### 5. IMAP & POP3 (Portas 143/993 e 110/995)
- Inspeção de banners e certificados SSL:
```bash
openssl s_client -connect <TARGET_IP>:993 -crlf
curl -s "pop3://<TARGET_IP>" -u user:pass
```

### 6. SNMP (Portas 161/162 UDP)
Simple Network Management Protocol expõe MIBs (Management Information Base) com OIDs valiosos quando community strings padrão são utilizadas (`public`, `private`):
```bash
snmpwalk -v2c -c public <TARGET_IP>
onesixtyone -c /usr/share/seclists/Discovery/SNMP/snmp-default-passwords.txt <TARGET_IP>
braa public@<TARGET_IP>:.1.3.6.1.2.1.1.1.0
```

### 7. Bancos de Dados: MySQL & MSSQL (Portas 3306 / 1433)
- **MySQL:**
```bash
nmap -p 3306 --script mysql-enum,mysql-info <TARGET_IP>
mysql -h <TARGET_IP> -u root -p
```
- **MSSQL:**
```bash
nmap -p 1433 --script ms-sql-info,ms-sql-ntlm-info <TARGET_IP>
sqsh -S <TARGET_IP> -U sa -P 'Password123'
```

### 8. Oracle TNS (Porta 1521)
- Inspeção de `tnsnames.ora` e ferramentas de teste:
```bash
tnscmd10g ping -h <TARGET_IP>
odat sidguesser -s <TARGET_IP> -p 1521
sqlplus user/pass@<TARGET_IP>:1521/SID
```

### 9. IPMI (Porta UDP 623)
Gerenciamento fora de banda (BMC). Vulnerável a extração de hashes de senha de usuário admin:
```bash
nmap -sU --script ipmi-version -p 623 <TARGET_IP>
msfconsole -x "use auxiliary/scanner/ipmi/ipmi_dumphashes; set RHOSTS <TARGET_IP>; run"
hashcat -m 7300 ipmi.hash /usr/share/wordlists/rockyou.txt
```

### 10. Gerenciamento Remoto: SSH, RDP & WinRM
- **SSH (Porta 22):** Identificação de chaves e versões de algoritmo.
- **RDP (Porta 3389):** Certificados TLS e NTLM domain info com `xfreerdp` ou `nmap --script rdp-enum-encryption`.
- **WinRM (Porta 5985/5986):** Gerenciamento PowerShell no Windows. Testar com `evil-winrm -i <TARGET_IP> -u user -p pass`.

---

## Walkthrough do Lab de Footprinting
1. Leitura inicial de tickets e identificação do escopo de rede.
2. Varredura com [[Nmap]] para encontrar a porta 445 (SMB) aberta.
3. Conexão anônima no SMB para identificar o compartilhamento `devshare` e baixar o arquivo `config.xml`.
4. Extração das credenciais do usuário `sa` de banco MSSQL.
5. Autenticação na porta 1433 (MSSQL) com `sqsh` e leitura da tabela `devsacc` para encontrar senhas de RDP.
6. Acesso final via RDP (`xfreerdp`) para obter a flag no Desktop do Administrador.

---
*Notas relacionadas:* [[Information Gathering - Web Edition]], [[SMB]], [[Nmap]], [[Password Attacks]], [[Active Directory]]
