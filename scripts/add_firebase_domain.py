import json, os, requests
import google.oauth2.service_account as sa
import google.auth.transport.requests

creds_info = json.loads(os.environ['SA_JSON'])
creds = sa.Credentials.from_service_account_info(
    creds_info,
    scopes=[
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/firebase',
        'https://www.googleapis.com/auth/webmasters',
    ]
)
auth_req = google.auth.transport.requests.Request()
creds.refresh(auth_req)
token = creds.token

project_number = '188238488601'
project_id = 'sentinela-ai-489015'
site = 'sentinela-ai-489015'
new_domain = 'bibliaalpha.org'
old_domain = 'bibliaalpha.studiologos.com.br'
hdrs = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

# Tentar endpoint v1beta1/projects/{project}/sites/{site}/customDomains
base_cd = f'https://firebasehosting.googleapis.com/v1beta1/projects/{project_number}/sites/{site}/customDomains'
print(f'=== TESTE: customDomains via projects path ===')
r_list = requests.get(base_cd, headers=hdrs)
print(f'LIST customDomains: HTTP {r_list.status_code}')
print(r_list.text[:600])

# DELETE domínio antigo via customDomains
print(f'\n=== DELETE {old_domain} via customDomains ===')
r_del = requests.delete(f'{base_cd}/{old_domain}', headers=hdrs)
print(f'HTTP {r_del.status_code}: {r_del.text[:200]}')

# POST novo domínio via customDomains
print(f'\n=== POST {new_domain} via customDomains ===')
r_post = requests.post(base_cd, headers=hdrs,
    params={'customDomainId': new_domain},
    json={'hostingConfig': {}})
print(f'HTTP {r_post.status_code}')
print(r_post.text[:600])

# Tentar também sem params
if r_post.status_code not in [200, 201]:
    print('\nTentando sem customDomainId param...')
    r_post2 = requests.post(base_cd, headers=hdrs, json={'name': f'{base_cd}/{new_domain}'})
    print(f'HTTP {r_post2.status_code}')
    print(r_post2.text[:400])

# Google Site Verification API para obter TXT token
print(f'\n=== Google Site Verification Token para {new_domain} ===')
sv_url = 'https://www.googleapis.com/siteVerification/v1/token'
sv_body = {
    'verificationMethod': 'DNS_TXT',
    'site': {'type': 'INET_DOMAIN', 'identifier': new_domain}
}
r_sv = requests.post(sv_url, headers=hdrs, json=sv_body)
print(f'HTTP {r_sv.status_code}')
print(r_sv.text[:400])
