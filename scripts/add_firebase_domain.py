import json, os, requests
import google.oauth2.service_account as sa
import google.auth.transport.requests

creds_info = json.loads(os.environ['SA_JSON'])
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
new_domain = 'bibliaalpha.org'
old_domain = 'bibliaalpha.studiologos.com.br'
hdrs = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
base_cd = f'https://firebasehosting.googleapis.com/v1beta1/projects/{project_number}/sites/{site}/customDomains'

# 1. Remover domínio antigo do Auth config
print('=== Remover old domain do Auth ===')
auth_url = f'https://identitytoolkit.googleapis.com/v2/projects/{site}/config'
r_cfg = requests.get(auth_url, headers=hdrs)
if r_cfg.status_code == 200:
    cfg = r_cfg.json()
    domains = cfg.get('authorizedDomains', [])
    if old_domain in domains:
        domains.remove(old_domain)
        r_p = requests.patch(auth_url, headers=hdrs,
            params={'updateMask': 'authorizedDomains'},
            json={'authorizedDomains': domains})
        print(f'PATCH remove old: HTTP {r_p.status_code}')
    else:
        print(f'{old_domain} nao estava na lista de auth domains')

# 2. POST bibliaalpha.org com body vazio {} e customDomainId como param
print(f'\n=== POST {new_domain} — body vazio + customDomainId param ===')
r_post = requests.post(
    base_cd,
    headers=hdrs,
    params={'customDomainId': new_domain},
    json={}
)
print(f'HTTP {r_post.status_code}')
try:
    print(json.dumps(r_post.json(), indent=2))
except Exception:
    print(r_post.text[:600])

# 3. GET status
print(f'\n=== GET status {new_domain} ===')
r_get = requests.get(f'{base_cd}/{new_domain}', headers=hdrs)
print(f'HTTP {r_get.status_code}')
if r_get.status_code == 200:
    info = r_get.json()
    print(f'state: {info.get("state")}')
    prov = info.get('provisioning', info)
    print(json.dumps(info, indent=2))
else:
    print(r_get.text[:400])

# 4. Lista final
print(f'\n=== LISTA FINAL customDomains ===')
r_list = requests.get(base_cd, headers=hdrs)
print(f'HTTP {r_list.status_code}')
print(json.dumps(r_list.json(), indent=2)[:600])
