import json, os, sys, requests
import google.oauth2.service_account as sa
import google.auth.transport.requests

sa_json = os.environ.get('SA_JSON', '')
if not sa_json:
    print('ERRO: SA_JSON nao definido')
    sys.exit(1)

creds_info = json.loads(sa_json)
creds = sa.Credentials.from_service_account_info(
    creds_info,
    scopes=['https://www.googleapis.com/auth/cloud-platform',
            'https://www.googleapis.com/auth/firebase']
)
auth_req = google.auth.transport.requests.Request()
creds.refresh(auth_req)
token = creds.token

project_number = '188238488601'
site = 'sentinela-ai-489015'
domain = 'bibliaalpha.org'
base_v2 = f'https://firebasehosting.googleapis.com/v1beta2/projects/{project_number}/sites/{site}/customDomains'
hdrs = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

# Listar custom domains existentes
r_list = requests.get(base_v2, headers=hdrs)
print(f'LIST customDomains: HTTP {r_list.status_code}')
if r_list.status_code == 200:
    existing = r_list.json()
    print(json.dumps(existing, indent=2)[:400])

# Verificar se ja existe
r_get = requests.get(f'{base_v2}/{domain}', headers=hdrs)
print(f'GET {domain}: HTTP {r_get.status_code}')

if r_get.status_code != 200:
    # Criar via v1beta2: POST com query param customDomainId
    r_post = requests.post(
        base_v2,
        headers=hdrs,
        params={'customDomainId': domain},
        json={}
    )
    print(f'POST v1beta2 criar: HTTP {r_post.status_code}')
    print(r_post.text[:800])

# Status final
r_final = requests.get(f'{base_v2}/{domain}', headers=hdrs)
print(f'\nStatus final: HTTP {r_final.status_code}')
if r_final.status_code == 200:
    info = r_final.json()
    print(f'state: {info.get("state")}')
    print()
    print('=== REGISTROS DNS NECESSARIOS ===')
    cert = info.get('certState', '')
    print(f'certState: {cert}')
    reqs = info.get('requiredDnsUpdates', {})
    for rec in reqs.get('checkDnsRecords', []):
        print(f'CHECK: type={rec.get("type")} domainName={rec.get("domainName")} rdata={rec.get("rdata","")}')
    for rec in reqs.get('desired', []):
        print(f'ADD:   type={rec.get("type")} domainName={rec.get("domainName")} rdata={rec.get("rdata","")}')
    print()
    print('FULL INFO:')
    print(json.dumps(info, indent=2))
else:
    print(r_final.text[:600])
