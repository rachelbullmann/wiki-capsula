# Information Gathering - Web Edition

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
```bash
whois targetdomain.com
```

### Enumeração DNS com Ferramentas Dedicadas
- **dnsenum:** Ferramenta abrangente para dicionário, brute-force e consulta de registros:
```bash
dnsenum --dnsserver <IP_DNS> -f /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt targetdomain.com
```
- **fierce:** Descoberta recursiva com detecção de registros wildcard:
```bash
fierce --domain targetdomain.com
```
- **dnsrecon:** Utilitário em Python para múltiplas técnicas de reconhecimento DNS:
```bash
dnsrecon -d targetdomain.com -t std,brt
```
- **amass:** Projeto OWASP focado em descoberta profunda de subdomínios via OSINT e fontes ativas:
```bash
amass enum -d targetdomain.com
```
- **assetfinder:** Ferramenta rápida em Go para localizar subdomínios relacionados:
```bash
assetfinder --subs-only targetdomain.com
```
- **puredns:** Resolução DNS de alta velocidade e brute force massivo.

---

## Zone Transfer & VHosts

### [[Zone Transfer]] (AXFR)
Ocorre quando um servidor DNS secundário mal configurado permite que qualquer cliente baixe o arquivo completo da zona DNS:
```bash
dig axfr @<IP_SERVIDORES_DNS> targetdomain.com
```

### Virtual Hosts (VHosts) & Brute Force de Diretórios
Servidores web frequentemente hospedam múltiplos sites no mesmo IP com base no cabeçalho `Host`:
- **Gobuster:**
```bash
gobuster vhost -u http://targetdomain.com -w /usr/share/seclists/Discovery/DNS/subdomains-top10000.txt
```
- **ffuf:**
```bash
ffuf -w /usr/share/seclists/Discovery/DNS/subdomains-top10000.txt -u http://targetdomain.com -H "Host: FUZZ.targetdomain.com" -fs 4242
```
- **feroxbuster:** Busca recursiva ultra-rápida de diretórios.

---

## SSL Footprinting
Certificados SSL/TLS contêm registros de nomes alternativos de assunto (SAN) e logs de transparência de certificado (Certificate Transparency):
- **[[crt.sh]]:**
```bash
curl -s "https://crt.sh/?q=%25.targetdomain.com&output=json" | jq -r '.[].name_value' | sort -u
```
- **Censys & SSLBoard:** Plataformas de busca para mapeamento de certificados e endereços IP associados.

---

## Web Fingerprinting & Technology Identification
- **Wappalyzer & BuiltWith:** Extensões e ferramentas CLI para identificar frameworks (React, Angular), CMS (WordPress, Joomla), e servidores web.
- **WhatWeb:**
```bash
whatweb -a 3 http://targetdomain.com
```
- **wafw00f:** Identificação de Web Application Firewalls (WAF):
```bash
wafw00f http://targetdomain.com
```
- **Nikto:** Scanner de vulnerabilidades conhecidas em servidores web:
```bash
nikto -h http://targetdomain.com
```

---

## Crawling & Web Spiders
- Arquivos de controle: Verificar `http://targetdomain.com/robots.txt` e `http://targetdomain.com/.well-known/`.
- **Burp Suite & OWASP ZAP:** Crawling ativo e passivo durante navegação proxyfied.
- **Scrapy & ReconSpider:** Frameworks para raspagem personalizada de links e comentários HTML.

---

## Search Engine Operators (Google Dorks)
- `site:targetdomain.com` — Limita a busca ao domínio alvo.
- `inurl:admin` — Busca URLs contendo a palavra "admin".
- `filetype:pdf` ou `filetype:env` — Busca por extensões específicas.
- `intitle:"index of"` — Localiza diretórios expostos sem página inicial.
- `intext:"password" OR "API_KEY"` — Localiza credenciais expostas.

---

## Web Archive & Frameworks OSINT
- **[[Wayback Machine]] / waybackurls:** Extração de URLs históricas do repositório da Internet Archive:
```bash
waybackurls targetdomain.com
```
- **Recon-ng:** Framework modular em Python para automação OSINT.
- **theHarvester:** Coleta de e-mails, nomes, subdomínios e IPs de fontes abertas.
- **FinalRecon & SpiderFoot:** Automação completa de reconhecimento web e visualização de inteligência.

---
*Notas relacionadas:* [[Footprinting]], [[DNS Enumeration]], [[Zone Transfer]], [[Subdomain Enumeration]], [[Nmap]]
