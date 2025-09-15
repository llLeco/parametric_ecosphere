#!/bin/bash

# Script para gerar carteiras dos stakeholders do sistema de seguro paramétrico
# Este script demonstra como usar o comando CLI para gerar as 5 carteiras essenciais

echo "🚀 Gerando carteiras dos stakeholders para o sistema de seguro paramétrico..."
echo "=================================================================="

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script a partir do diretório raiz do backend"
    exit 1
fi

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Erro: Node.js não está instalado"
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ Erro: npm não está instalado"
    exit 1
fi

echo "📋 Verificando dependências..."

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

echo "🔧 Configurando ambiente..."

# Definir variáveis de ambiente para Hedera Testnet
export HEDERA_NETWORK=testnet
export HEDERA_ACCOUNT_ID=0.0.5173509
export HEDERA_PRIVATE_KEY=60062c82f2f6028f7af995ac4642b86e5e9c83f7e9a0b0afdc6bab95486d4b1c

echo "💰 Verificando saldo da conta SmartApp..."
echo "   Account ID: $HEDERA_ACCOUNT_ID"
echo "   Network: $HEDERA_NETWORK"
echo "   Saldo necessário: ~40 HBAR (4 contas × 10 HBAR cada)"

# Criar diretório para as carteiras se não existir
mkdir -p ./stakeholder-wallets

echo ""
echo "🎯 Gerando carteiras dos stakeholders..."
echo "======================================"

# Executar o comando de geração de carteiras
npm run generate-wallets

# Verificar se o comando foi executado com sucesso
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Carteiras geradas com sucesso!"
    echo ""
    echo "📁 Arquivo de saída: ./stakeholder-wallets/stakeholder-wallets.json"
    echo ""
    echo "📋 Resumo das carteiras geradas:"
    echo "================================"
    
    # Mostrar resumo das carteiras (se o arquivo foi criado)
    if [ -f "./stakeholder-wallets/stakeholder-wallets.json" ]; then
        echo "🔮 Oracle: Assina eventos de gatilho (dados climáticos)"
        echo "⚙️  SmartApp (Admin): Gerencia o sistema e políticas"
        echo "🌾 Beneficiário (Farmer): Recebe pagamentos e paga prêmios"
        echo "💰 Contribuidor (Liquidity Provider): Fornece liquidez ao pool"
        echo "🏢 Ressegurador: Atende solicitações de cessão"
        echo ""
        echo "🔐 IMPORTANTE: Mantenha as chaves privadas seguras!"
        echo "   - NUNCA commite chaves privadas no controle de versão"
        echo "   - Use hardware wallets em produção"
        echo "   - Armazene as chaves em local seguro e criptografado"
    fi
    
    echo ""
    echo "🎉 Processo concluído com sucesso!"
    echo ""
    echo "📖 Para mais informações, consulte:"
    echo "   ./src/modules/config/cli/README-wallets.md"
    
else
    echo ""
    echo "❌ Erro ao gerar carteiras. Verifique:"
    echo "   - Se a conta SmartApp tem HBAR suficiente (~40 HBAR necessário)"
    echo "   - Se a conectividade com Hedera Testnet está funcionando"
    echo "   - Se as credenciais estão corretas"
    echo ""
    echo "🔧 Para debug, execute:"
    echo "   npm run start generate-wallets -- --help"
fi
