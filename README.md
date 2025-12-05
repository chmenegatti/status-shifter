# Status Shifter

Aplicação Next.js (App Router) que lê configurações de banco no etcd e atualiza o status do outbox. Este guia mostra como preparar o etcd, construir a imagem e subir tudo via Docker Compose na mesma rede do etcd.

## Pré-requisitos
- Docker e Docker Compose instalados.
- Container do etcd já rodando.
- Rede Docker externa compartilhada com o etcd (ex.: `nemesis-starter_nemesis`).
- Warp instalado (Cloudflare Warp). Durante o **primeiro build**, se estiver lento, desconecte (`warp-cli disconnect`). Para **usar** a aplicação, conecte o Warp; para acessar `tece` ou `tesp2`, conecte também às respectivas VPNs.

## Configuração do etcd
As chaves abaixo precisam existir e conter as credenciais corretas do banco (JSON):
- `/nemesis-api/env-tece1`
- `/nemesis-api/env-tesp2`
- `/nemesis-api/env-tesp3`
- `/nemesis-api/env-tesp5`
- `/nemesis-api/env-tesp6`
- `/nemesis-api/env-tesp7`

Formato sugerido para cada chave (ajuste os valores reais):
```json
{
  "host": "db-host",
  "port": 3306,
  "user": "db-user",
  "password": "db-pass",
  "database": "db-name"
}
```

Exemplo para gravar (etcd v3 gateway HTTP — converta a chave para base64):
```sh
curl -X POST "http://<etcd-host>:2379/v3/kv/put" \
  -d '{"key":"L25lbWVzaXMtYXBpL2Vudi10ZXNlYzE=","value":"{\\"host\\":\\"db-host\\",\\"port\\":3306,\\"user\\":\\"db-user\\",\\"password\\":\\"db-pass\\",\\"database\\":\\"db-name\\"}"}'
```

## Subindo com Docker Compose
O `docker-compose.yml` já está configurado para usar a rede externa `nemesis-starter_nemesis` e expor a aplicação em `9000`.

1) Confirme que a rede existe:
```sh
docker network ls | grep nemesis-starter_nemesis
```

2) Se for o primeiro build e estiver lento, desconecte o Warp:
```sh
warp-cli disconnect
```

3) Suba a aplicação (build + run):
```sh
docker compose up -d
```

4) Depois do build, reconecte o Warp e, se for usar `tece` ou `tesp2`, conecte às respectivas VPNs.

5) Acesse: http://localhost:9000

## Variáveis de ambiente principais
O Compose já define valores padrão; sobrescreva se precisar:
- `ETCD_ENDPOINT`: ex. `http://nemesis-etcd:2379`
- `ETCD_API_VERSION`: `v3` (padrão)
- `PORT`: `9000`

## Dicas rápidas
- Logs: `docker compose logs -f`
- Reiniciar serviço: `docker compose restart app`
- Parar tudo: `docker compose down`
