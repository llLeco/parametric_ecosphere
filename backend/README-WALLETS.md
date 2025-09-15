# 🎯 Sistema de Carteiras dos Stakeholders - Solução Definitiva

Este é o guia definitivo para gerar as carteiras dos stakeholders do sistema de seguro paramétrico.

## 🚀 Uso Rápido

```bash
# Opção 1: Script automatizado
./scripts/generate-stakeholder-wallets.sh

# Opção 2: Comando direto
npm run generate-wallets
```

## 📋 Stakeholders Gerados

| Stakeholder | Account ID | Saldo | Função |
|-------------|------------|-------|--------|
| **Oracle** | `0.0.6801945` | 10 HBAR | Dados climáticos |
| **Beneficiário (Farmer)** | `0.0.6801946` | 10 HBAR | Cliente final |
| **Contribuidor (Liquidity Provider)** | `0.0.6801948` | 10 HBAR | Fornece liquidez |
| **Ressegurador** | `0.0.6801949` | 10 HBAR | Cobertura adicional |
| **SmartApp (Admin)** | `0.0.5173509` | 1000 HBAR | Operação do sistema |

## 📁 Arquivos

- `scripts/generate-stakeholder-wallets.js` - Script principal
- `scripts/generate-stakeholder-wallets.sh` - Script automatizado
- `stakeholder-wallets.json` - Arquivo de saída (gerado)
- `STAKEHOLDER_WALLETS_GUIDE.md` - Guia completo

## 🔐 Segurança

⚠️ **IMPORTANTE**: Este sistema é para desenvolvimento apenas!

- Chaves privadas incluídas no arquivo de saída
- **NUNCA** commite chaves privadas no controle de versão
- Em produção, use hardware wallets

## ✅ Status

- ✅ Script funcionando perfeitamente
- ✅ Carteiras geradas com sucesso
- ✅ Documentação limpa e organizada
- ✅ Código simplificado e mantível

---

**Pronto para uso!** 🎉

