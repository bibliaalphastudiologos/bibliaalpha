import os, sys, json, requests

API_TOKEN = os.environ.get('HOSTINGER_API_TOKEN', '')
DOMAIN = 'studiologos.com.br'
SUBDOMAIN = 'bibliaalpha'
FIREBASE_CNAME = 'sentinela-ai-489015.web.app'

if not API_TOKEN:
    print("AVISO: HOSTINGER_API_TOKEN nao definido — pulando alteracao DNS automatica")
    print("ACAO MANUAL NECESSARIA:")
    print(f"  1. Acesse hPanel Hostinger -> {DOMAIN} -> DNS Zone")
    print(f"  2. Remova: A | {SUBDOMAIN} | 5.183.10.171")
    print(f"  3. Adicione: CNAME | {SUBDOMAIN} | {FIREBASE_CNAME}")
    sys.exit(0)

BASE = "https://api.hostinger.com/v1"
headers = {"Authorization": f"Bearer {API_TOKEN}", "Content-Type": "application/json"}

r = requests.get(f"{BASE}/dns/zones/{DOMAIN}/records", headers=headers)
print(f"Buscar registros DNS: {r.status_code}")
if r.status_code != 200:
    print(f"Erro: {r.text[:300]}")
    sys.exit(1)

records = r.json().get("data", r.json())
old_record = None
for rec in records:
    if SUBDOMAIN in rec.get("name", "") and rec.get("type") == "A":
        old_record = rec
        print(f"Registro A encontrado: {rec}")
        break

if old_record:
    del_r = requests.delete(f"{BASE}/dns/zones/{DOMAIN}/records/{old_record['id']}", headers=headers)
    print(f"Remover A antigo: {del_r.status_code}")

new_record = {"type": "CNAME", "name": SUBDOMAIN, "content": FIREBASE_CNAME, "ttl": 3600}
add_r = requests.post(f"{BASE}/dns/zones/{DOMAIN}/records", headers=headers, json=new_record)
print(f"Adicionar CNAME {SUBDOMAIN} -> {FIREBASE_CNAME}: {add_r.status_code}")
print(add_r.text[:400])
if add_r.status_code in (200, 201):
    print("SUCESSO! Aguarde 1-4h para propagacao DNS.")
else:
    print("FALHA. Realize a alteracao manualmente no hPanel.")
