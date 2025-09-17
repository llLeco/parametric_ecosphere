#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_FILE="$PROJECT_ROOT/demo-flow.log"

# Print functions
print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

print_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_status() {
    echo -e "${YELLOW}[STATUS]${NC} $1"
}

# Log function
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Simulate delay
simulate_delay() {
    local seconds=${1:-2}
    print_status "Processing... (${seconds}s)"
    sleep $seconds
}

# Main demo flow
run_demo_flow() {
    print_header "Parametric Insurance Flow Demo"
    
    print_info "This demo shows the complete parametric insurance flow step by step:"
    echo ""
    
    # Step 1: Sistema gera seguros e suas regras
    print_step "1. Sistema gera seguros e suas regras"
    print_info "   📋 Creating insurance policy with rules and conditions"
    print_info "   📏 Setting up payout conditions (temperature > 35°C)"
    print_info "   🎯 Defining stop-loss at 80,000 tokens"
    simulate_delay 2
    print_success "✅ Insurance rules and policy structure created"
    echo ""
    
    # Step 2: Contribuidores travam capital no pool
    print_step "2. Contribuidores travam capital no pool"
    print_info "   💰 Liquidity providers deposit 500,000 tokens"
    print_info "   🏦 Pool reserves established for risk coverage"
    print_info "   📊 Pool NAV (Net Asset Value) calculated"
    simulate_delay 2
    print_success "✅ Pool funded with 500,000 tokens"
    echo ""
    
    # Step 3: Resseguradores assinam tratado de participação
    print_step "3. Resseguradores assinam tratado de participação"
    print_info "   🤝 Reinsurers sign participation treaty"
    print_info "   📋 Cession agreement for excess coverage"
    print_info "   💼 25% of premiums allocated to reinsurers"
    simulate_delay 2
    print_success "✅ Reinsurance treaty established"
    echo ""
    
    # Step 4: Agricultor contrata o seguro
    print_step "4. Agricultor contrata o seguro"
    print_info "   👨‍🌾 Farmer (0.0.6801946) purchases insurance policy"
    print_info "   📋 Policy ID: pol_$(date +%s)"
    print_info "   🌾 Coverage for São Paulo, Brazil region"
    print_info "   💰 Sum insured: 100,000 tokens"
    simulate_delay 2
    print_success "✅ Insurance policy purchased by farmer"
    echo ""
    
    # Step 5: Agricultor paga mensalmente 10k
    print_step "5. Agricultor paga mensalmente 10k"
    print_info "   💳 Monthly premium payment: 10,000 tokens"
    print_info "   📅 Payment processed successfully"
    print_info "   🏦 Funds transferred to pool"
    simulate_delay 2
    print_success "✅ Monthly premium paid: 10,000 tokens"
    echo ""
    
    # Step 6: Distribuição: 70% Pool, 25% Resseguradores, 5% Sistema
    print_step "6. Distribuição: 70% Pool, 25% Resseguradores, 5% Sistema"
    print_info "   💰 Premium distribution (10,000 tokens):"
    print_info "      - Pool Reserve: 7,000 tokens (70%)"
    print_info "      - Reinsurer: 2,500 tokens (25%)"
    print_info "      - System Fee: 500 tokens (5%)"
    simulate_delay 2
    print_success "✅ Premium distributed according to allocation"
    echo ""
    
    # Step 7: Agricultor sofre catástrofe climática
    print_step "7. Agricultor sofre catástrofe climática"
    print_info "   🌡️ Extreme weather event detected"
    print_info "   📊 Temperature: 36.5°C (threshold: 35°C)"
    print_info "   ⚠️ Climate catastrophe confirmed"
    simulate_delay 2
    print_success "✅ Climate catastrophe verified"
    echo ""
    
    # Step 8: Oracle registra triggerEvent
    print_step "8. Oracle registra triggerEvent"
    print_info "   🔮 Oracle validates weather data"
    print_info "   📝 Trigger event recorded on HCS"
    print_info "   ✅ Payout conditions met"
    simulate_delay 2
    print_success "✅ Trigger event registered by oracle"
    echo ""
    
    # Step 9: Pool paga 80k (stop-loss)
    print_step "9. Pool paga 80k (stop-loss)"
    print_info "   💸 Pool payout executed: 80,000 tokens"
    print_info "   🛑 Stop-loss limit reached"
    print_info "   👨‍🌾 Farmer receives initial payout"
    simulate_delay 2
    print_success "✅ Pool payout completed: 80,000 tokens"
    echo ""
    
    # Step 10: Resseguradores pagam 20k restante
    print_step "10. Resseguradores pagam 20k restante"
    print_info "   🤝 Cession request: 20,000 tokens excess"
    print_info "   💵 Reinsurer funding: 20,000 tokens"
    print_info "   🎯 Final payout to farmer"
    simulate_delay 2
    print_success "✅ Reinsurer payout completed: 20,000 tokens"
    echo ""
    
    # Summary
    print_header "Flow Summary"
    print_success "✅ Policy Creation: Insurance policy created with beneficiary and rules"
    print_success "✅ Pool Deposit: 500,000 tokens deposited by contributor"
    print_success "✅ Premium Payment: 10,000 tokens paid by farmer"
    print_success "✅ Weather Event: Climate catastrophe triggered by oracle"
    print_success "✅ Pool Payout: 80,000 tokens paid from pool (stop-loss)"
    print_success "✅ Cession Request: 20,000 tokens excess requested from reinsurer"
    print_success "✅ Cession Funding: 20,000 tokens funded by reinsurer"
    print_success "✅ Final Payout: 20,000 tokens paid to farmer from cession"
    
    echo ""
    print_info "💰 Total Payout: 100,000 tokens"
    print_info "   - Pool Contribution: 80,000 tokens (80%)"
    print_info "   - Reinsurer Contribution: 20,000 tokens (20%)"
    print_info ""
    print_info "💳 Premium Distribution (10,000 tokens):"
    print_info "   - Pool Reserve: 7,000 tokens (70%)"
    print_info "   - Reinsurer: 2,500 tokens (25%)"
    print_info "   - System Fee: 500 tokens (5%)"
    
    echo ""
    print_success "🎉 Demo flow completed successfully!"
}

# Main execution
main() {
    # Initialize log file
    echo "Parametric Insurance Flow Demo Log" > "$LOG_FILE"
    echo "Started at: $(date)" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
    
    log_message "Demo started"
    run_demo_flow
    log_message "Demo completed"
    
    echo ""
    print_status "Log file: $LOG_FILE"
}

# Run main function
main "$@"
