# Ambiente Docker - Conexão Saudável

Este diretório contém a configuração Docker para o ambiente de desenvolvimento do Conexão Saudável.

## Requisitos

- Docker
- Docker Compose
- Git

## Estrutura

```
docker/
├── postgres/
│   └── init/
│       └── 01-init.sql    # Script de inicialização do banco
├── README.md              # Este arquivo
└── docker-compose.yml     # Configuração dos containers
```

## Como Usar

1. Copie o arquivo `.env.example` para `.env` na raiz do projeto:
   ```bash
   cp .env.example .env
   ```

2. Ajuste as variáveis de ambiente no arquivo `.env` conforme necessário.

3. Inicie os containers:
   ```bash
   docker-compose up -d
   ```

4. Para verificar se os containers estão rodando:
   ```bash
   docker-compose ps
   ```

5. Para parar os containers:
   ```bash
   docker-compose down
   ```

## Acessando o Banco de Dados

### PostgreSQL

- **Host**: localhost
- **Porta**: 5432 (ou a porta definida em DB_PORT)
- **Usuário**: postgres (ou o valor de DB_USERNAME)
- **Senha**: postgres (ou o valor de DB_PASSWORD)
- **Banco**: conexao_saudavel (ou o valor de DB_DATABASE)

### PgAdmin

- **URL**: http://localhost:5050 (ou a porta definida em PGADMIN_PORT)
- **Email**: admin@conexaosaudavel.com (ou o valor de PGADMIN_EMAIL)
- **Senha**: admin (ou o valor de PGADMIN_PASSWORD)

Para conectar ao banco via PgAdmin:
1. Acesse a interface web do PgAdmin
2. Adicione um novo servidor
3. Use as credenciais do PostgreSQL definidas acima

## Volumes

Os dados são persistidos através de volumes Docker:
- `postgres_data`: Dados do PostgreSQL
- `pgadmin_data`: Dados do PgAdmin

## Comandos Úteis

### Ver logs dos containers
```bash
docker-compose logs -f
```

### Reiniciar containers
```bash
docker-compose restart
```

### Remover containers e volumes (cuidado: isso apagará todos os dados)
```bash
docker-compose down -v
```

### Acessar o shell do PostgreSQL
```bash
docker-compose exec postgres psql -U postgres -d conexao_saudavel
```

## Troubleshooting

### Container não inicia
1. Verifique os logs:
   ```bash
   docker-compose logs postgres
   ```
2. Verifique se a porta não está em uso:
   ```bash
   netstat -an | findstr "5432"
   ```

### Erro de conexão
1. Verifique se os containers estão rodando:
   ```bash
   docker-compose ps
   ```
2. Verifique se as variáveis de ambiente estão corretas
3. Tente reiniciar os containers:
   ```bash
   docker-compose restart
   ```

### Dados perdidos
Os dados são persistidos em volumes Docker. Se você precisar resetar o banco:
1. Pare os containers
2. Remova os volumes
3. Inicie novamente

```bash
docker-compose down -v
docker-compose up -d
```

## Desenvolvimento

### Adicionando novas migrações
1. Crie um novo arquivo SQL em `docker/postgres/init/`
2. Use o padrão de nomenclatura: `XX-descricao.sql` (onde XX é um número sequencial)
3. Os scripts são executados em ordem alfabética

### Modificando a estrutura do banco
1. Faça backup dos dados importantes
2. Modifique os scripts de inicialização
3. Reconstrua os containers:
   ```bash
   docker-compose down -v
   docker-compose up -d
   ``` 