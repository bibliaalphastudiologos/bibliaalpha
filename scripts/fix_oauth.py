#!/usr/bin/env python3
"""Adiciona https://bibliaalpha.org/__/auth/handler como redirect URI autorizado no OAuth client."""
import json, sys
import google.auth.transport.requests
from google.oauth2 import service_account
import requests

SA_FILE = '/tmp/sa.json'
PROJECT_ID = 'sentinela-ai-489015'

with open(SA_FILE) as f:
    sa = json.load(f)

creds = service_account.Credentials.from_service_account_info(
    sa,
    scopes=['https://www.googleapis.com/auth/cloud-platform'],
)
creds.refresh(google.auth.transport.requests.Request())
token = creds.token
hdrs = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

# 1. Listar OAuth clients do projeto
r = requests.get(
    f'https://identitytoolkit.googleapis.com/v2/projects/{PROJECT_ID}/defaultSupportedIdpConfigs',
    headers=hdrs,
)
print('IdP configs:', r.status_code, r.text[:500])

# 2. Buscar config do Identity Platform
r2 = requests.get(
    f'https://identitytoolkit.googleapis.com/v2/projects/{PROJECT_ID}/config',
    headers=hdrs,
)
print('\nProject config:', r2.status_code)
if r2.ok:
    cfg = r2.json()
    print(json.dumps(cfg, indent=2)[:2000])

# 3. Listar Authorized Domains
r3 = requests.get(
    f'https://identitytoolkit.googleapis.com/v2/projects/{PROJECT_ID}/config',
    headers=hdrs,
)
if r3.ok:
    current = r3.json()
    domains = current.get('authorizedDomains', [])
    print('\nAuthorized domains:', domains)

    new_domains = list(set(domains + ['bibliaalpha.org', 'www.bibliaalpha.org']))
    patch = {'authorizedDomains': new_domains}
    r4 = requests.patch(
        f'https://identitytoolkit.googleapis.com/v2/projects/{PROJECT_ID}/config',
        json=patch,
        headers=hdrs,
        params={'updateMask': 'authorizedDomains'},
    )
    print('\nUpdate authorized domains:', r4.status_code, r4.text[:300])

# 4. Buscar OAuth Web Client ID via Cloud Resource Manager
r5 = requests.get(
    f'https://iamcredentials.googleapis.com/v1/projects/{PROJECT_ID}:generateIdToken',
    headers=hdrs,
)
print('\n--- Buscando OAuth clients via API ---')

r6 = requests.get(
    'https://www.googleapis.com/oauth2/v3/tokeninfo',
    params={'access_token': token},
)
print('Token info:', r6.text[:300])

# 5. Tentar via Cloud Console API
r7 = requests.get(
    f'https://console.cloud.google.com/m/api/projects/{PROJECT_ID}/oauthclients',
    headers=hdrs,
)
print('OAuth clients via console API:', r7.status_code, r7.text[:300])

print('\nDONE')
