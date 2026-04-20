"""
Adiciona bibliaalpha.studiologos.com.br como dominio customizado no Firebase Hosting
e exibe os registros DNS necessarios para configurar na Hostinger.
"""
import json
import sys
import os
import requests
import google.auth
import google.auth.transport.requests
from google.oauth2 import service_account

SA_JSON = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS_JSON', '')
if not SA_JSON:
    print("ERRO: GOOGLE_APPLICATION_CREDENTIALS_JSON nao definido")
    sys.exit(1)

with open('/tmp/sa.json', 'w') as f:
    f.write(SA_JSON)

sa_info = json.loads(SA_JSON)
project_id = sa_info.get('project_id', 'sentinela-ai-489015')

credentials = service_account.Credentials.from_service_account_file(
    '/tmp/sa.json',
    scopes=['https://www.googleapis.com/auth/firebase']
)
auth_req = google.auth.transport.requests.Request()
credentials.refresh(auth_req)
token = credentials.token

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json',
}

CUSTOM_DOMAIN = 'bibliaalpha.studiologos.com.br'
SITE_ID = 'bibliaalpha'

print(f"Projeto: {project_id}")
print(f"Dominio a adicionar: {CUSTOM_DOMAIN}")
print()

sites_url = f'https://firebasehosting.googleapis.com/v1beta1/projects/{project_id}/sites'
r = requests.get(sites_url, headers=headers)
print(f"Sites existentes: {r.status_code}")
if r.status_code == 200:
    for s in r.json().get('sites', []):
        print(f"  - {s.get('name')} | defaultUrl: {s.get('defaultUrl')}")

domains_url = f'https://firebasehosting.googleapis.com/v1beta1/sites/{SITE_ID}/domains'
r = requests.get(domains_url, headers=headers)
print(f"\nDominios atuais ({r.status_code}):")
if r.status_code == 200:
    for d in r.json().get('domains', []):
        print(f"  - {d.get('domainName')} | status: {d.get('status')}")
else:
    print(f"  Erro: {r.text[:300]}")

body = {'domainName': CUSTOM_DOMAIN}
r = requests.post(domains_url, headers=headers, json=body)
print(f"\nAdicionar {CUSTOM_DOMAIN}: {r.status_code}")
resp_data = r.json()
print(json.dumps(resp_data, indent=2))

if r.status_code in (200, 409):
    if r.status_code == 409:
        print("\nDominio ja existe. Buscando detalhes...")
        r2 = requests.get(f"{domains_url}/{CUSTOM_DOMAIN}", headers=headers)
        if r2.status_code == 200:
            resp_data = r2.json()
            print(json.dumps(resp_data, indent=2))

    provision = resp_data.get('provisioning', {})
    dns_records = provision.get('dnsRecords', [])
    expected = provision.get('expectedDnsRecords', [])
    all_records = dns_records or expected

    print("\n" + "="*60)
    print("REGISTROS DNS NECESSARIOS NA HOSTINGER:")
    print("="*60)
    if all_records:
        for rec in all_records:
            print(f"  Tipo: {rec.get('type')}")
            print(f"  Host: {rec.get('domainName', rec.get('name', CUSTOM_DOMAIN))}")
            print(f"  Valor: {rec.get('rdata', rec.get('value', ''))}")
            print()
    else:
        print("  Nenhum registro DNS retornado ainda.")
        print("  Status do provisioning:", provision.get('certStatus', 'N/A'))

    domain_status = resp_data.get('status', 'UNKNOWN')
    print(f"Status do dominio: {domain_status}")
    print("="*60)
