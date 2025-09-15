# 🚀 Parametric Insurance Ecosystem Initialization

Este guia explica como inicializar o ecossistema de seguro paramétrico com os 3 tópicos HCS essenciais.

## 📋 Tópicos HCS Criados

O sistema inicializa automaticamente 3 tópicos HCS essenciais:

### 1. 📋 Policy Registry Topic
- **Função**: Armazena informações das apólices de seguro
- **Interface**: `insurance.registry`
- **Propriedades**: policyId, beneficiary, location, sumInsured, premium, retention, validity, ruleRef, payoutsTopicId
- **Segurança**: `partial` (requer tokens de admin)

### 2. 📏 Rules Topic  
- **Função**: Gerencia regras de seguro e condições de pagamento
- **Interface**: `insurance.rules`
- **Propriedades**: type, ruleId, version, policyScope, indexDef, payout, validity
- **Segurança**: `full` (requer tokens de SmartNode e NFT validator)

### 3. ⚡ Triggers Topic
- **Função**: Processa dados climáticos e eventos de gatilho
- **Interface**: `insurance.triggers`
- **Propriedades**: type, policyId, location, index, window, ruleRef, oracleSig, smartNodeSig
- **Segurança**: `partial` (requer tokens de Oracle e SmartNode)

## 🚀 Inicialização Rápida

### Opção 1: Script Automatizado
```bash
# Inicialização com confirmação
npm run init-ecosystem

# Inicialização forçada (sem confirmação)
npm run init-ecosystem-force
```

### Opção 2: Script Direto
```bash
# Com confirmação
./scripts/initialize-ecosystem.sh

# Forçado
./scripts/initialize-ecosystem.sh --force

# Verboso
./scripts/initialize-ecosystem.sh --verbose
```

### Opção 3: Comando NestJS
```bash
# Com confirmação
npm run start -- config

# Forçado
npm run start -- config --force
```

## 🔧 Pré-requisitos

### 1. Dependências
```bash
npm install
```

### 2. Configuração do Ambiente
- Arquivo `.env` configurado
- Conta Hedera Testnet com HBAR suficiente
- SmartNode SDK configurado

### 3. Credenciais Hedera
- Account ID configurado
- Private Key configurada
- Acesso à rede Hedera Testnet

## 📊 Saída da Inicialização

O sistema gera:

### 1. Tópicos HCS
- **Policy Registry Topic ID**: `0.0.XXXXXXX`
- **Rules Topic ID**: `0.0.XXXXXXX`  
- **Triggers Topic ID**: `0.0.XXXXXXX`

### 2. Configuração no Banco
```json
{
  "dao_hcs": "0.0.XXXXXXX",
  "policyRegistryTopicId": "0.0.XXXXXXX",
  "rulesTopicId": "0.0.XXXXXXX", 
  "triggersTopicId": "0.0.XXXXXXX",
  "customMetadata": {
    "ecosystem": "parametric-insurance",
    "version": "1.0.0",
    "topics": {
      "policyRegistry": "0.0.XXXXXXX",
      "rules": "0.0.XXXXXXX",
      "triggers": "0.0.XXXXXXX"
    }
  }
}
```

## 🔐 Segurança

### Validação de Consenso
- Cada tópico tem seu próprio validador de consenso
- Validação baseada em tokens e NFTs
- Controle de acesso granular

### Tokens Necessários
- **Policy Registry**: `0.0.TOKEN_ADMIN`, `0.0.NFT_ADMIN`
- **Rules**: `0.0.TOKEN_SMARTNODE`, `0.0.NFT_VALIDATOR`
- **Triggers**: `0.0.TOKEN_ORACLE`, `0.0.TOKEN_SMARTNODE`, `0.0.NFT_ORACLE`, `0.0.NFT_VALIDATOR`

## 🧪 Testando

### 1. Verificar Tópicos
```bash
# Verificar informações do tópico
hedera-cli topic info 0.0.XXXXXXX
```

### 2. Verificar Configuração
```bash
# Verificar configuração no banco
npm run start -- config:list
```

### 3. Testar Publicação
```bash
# Publicar mensagem de teste
hedera-cli topic submit 0.0.XXXXXXX "test message"
```

## 🐛 Troubleshooting

### Erro: "Consensus validator creation failed"
- **Causa**: Problemas com SmartNode SDK
- **Solução**: Verificar configuração do SmartNode

### Erro: "Topic creation failed"
- **Causa**: Problemas de conectividade ou credenciais
- **Solução**: 
  - Verificar conectividade com Hedera
  - Confirmar credenciais da conta
  - Verificar saldo de HBAR

### Erro: "Configuration already exists"
- **Causa**: Configuração já existe no banco
- **Solução**: Usar flag `--force` ou confirmar substituição

## 📁 Arquivos

- `scripts/initialize-ecosystem.sh` - Script de inicialização
- `src/modules/config/cli/config-cli.ts` - Comando NestJS
- `src/modules/config/validators/` - Validadores dos tópicos
- `ECOSYSTEM_INITIALIZATION.md` - Este guia

## 🎉 Próximos Passos

Após inicializar o ecossistema:

1. **Gerar carteiras dos stakeholders**: `npm run generate-wallets`
2. **Iniciar a aplicação**: `npm run start:dev`
3. **Configurar tokens necessários** para os tópicos
4. **Implementar lógica de negócio** usando os tópicos
5. **Testar fluxo completo** do seguro paramétrico

---

**⚠️ Lembre-se**: Este sistema é para desenvolvimento. Para produção, implemente todas as medidas de segurança necessárias.

