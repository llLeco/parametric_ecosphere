#!/bin/bash

# =============================================================================
# Script: run-parametric-flow.sh
# Description: Complete Parametric Insurance Flow Demonstration
# Author: Parametric Insurance Team
# Version: 1.0.0
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$PROJECT_ROOT/parametric-flow.log"
API_BASE_URL="http://localhost:8888"

# Test data
POLICY_ID="pol_$(date +%s)"
BENEFICIARY_ACCOUNT="0.0.6801946"  # Farmer wallet
CONTRIBUTOR_ACCOUNT="0.0.6801948"  # Contributor wallet
REINSURER_ACCOUNT="0.0.6801949"    # Reinsurer wallet
ORACLE_ACCOUNT="0.0.6801945"       # Oracle wallet
POOL_ID="pool_1"
CURRENCY_TOKEN="0.0.STABLESIM"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

print_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Function to make API calls
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    local headers=$4
    
    if [ -n "$data" ]; then
        curl -s -X $method \
            -H "Content-Type: application/json" \
            ${headers:+-H "$headers"} \
            -d "$data" \
            "$API_BASE_URL$endpoint"
    else
        curl -s -X $method \
            -H "Content-Type: application/json" \
            ${headers:+-H "$headers"} \
            "$API_BASE_URL$endpoint"
    fi
}

# Function to wait for API to be ready
wait_for_api() {
    print_status "Waiting for API to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$API_BASE_URL/health" > /dev/null 2>&1; then
            print_success "API is ready!"
            return 0
        fi
        
        print_status "Attempt $attempt/$max_attempts - API not ready yet..."
        sleep 2
        ((attempt++))
    done
    
    print_error "API failed to start within expected time"
    exit 1
}

# Function to check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check if we're in the right directory
    if [ ! -f "$PROJECT_ROOT/package.json" ]; then
        print_error "package.json not found. Please run this script from the backend directory."
        exit 1
    fi
    
    # Check if node_modules exists
    if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
        print_warning "node_modules not found. Installing dependencies..."
        cd "$PROJECT_ROOT"
        npm install
        print_success "Dependencies installed"
    fi
    
    # Check if .smart_app.env file exists
    if [ ! -f "$PROJECT_ROOT/.smart_app.env" ]; then
        print_warning ".smart_app.env file not found. Please ensure environment variables are configured."
    fi
    
    print_success "Prerequisites check completed"
    log_message "Prerequisites check completed"
}

# Function to start the application
start_application() {
    print_header "Starting Application"
    
    cd "$PROJECT_ROOT"
    
    print_status "Starting the parametric insurance application..."
    
    # Start the application in background
    npm run start:dev > "$PROJECT_ROOT/app.log" 2>&1 &
    APP_PID=$!
    
    # Wait for API to be ready
    wait_for_api
    
    print_success "Application started successfully (PID: $APP_PID)"
    log_message "Application started with PID: $APP_PID"
}

# Function to initialize ecosystem
initialize_ecosystem() {
    print_header "Initializing Ecosystem"
    
    print_status "Initializing parametric insurance ecosystem..."
    
    # Use echo to automatically answer "y" to the confirmation prompt
    if echo "y" | npm run init-ecosystem-force; then
        print_success "Ecosystem initialized successfully!"
        log_message "Ecosystem initialization completed"
    else
        print_error "Failed to initialize ecosystem"
        log_message "Ecosystem initialization failed"
        exit 1
    fi
}

# Function to generate stakeholder wallets
generate_wallets() {
    print_header "Generating Stakeholder Wallets"
    
    print_status "Generating wallets for all stakeholders..."
    
    if npm run generate-wallets; then
        print_success "Stakeholder wallets generated successfully!"
        log_message "Stakeholder wallets generated"
    else
        print_warning "Failed to generate wallets, using default test accounts"
        log_message "Using default test accounts for wallets"
    fi
}

# Function to create a policy
create_policy() {
    print_step "1. Creating Insurance Policy"
    
    local policy_data=$(cat <<EOF
{
    "policyId": "$POLICY_ID",
    "beneficiary": "$BENEFICIARY_ACCOUNT",
    "location": "São Paulo, Brazil",
    "sumInsured": 100000,
    "premium": 10000,
    "retention": 80000,
    "validity": {
        "from": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
        "to": "$(date -u -d '+1 year' +%Y-%m-%dT%H:%M:%SZ)"
    },
    "ruleRef": {
        "topicId": "0.0.123456",
        "ts": "$(date +%s)"
    }
}
EOF
)
    
    print_status "Creating policy: $POLICY_ID"
    local response=$(api_call "POST" "/policy-factory" "$policy_data")
    
    if echo "$response" | grep -q "statusTopicId"; then
        print_success "Policy created successfully!"
        echo "$response" | jq '.'
        log_message "Policy created: $POLICY_ID"
    else
        print_error "Failed to create policy"
        echo "$response"
        exit 1
    fi
}

# Function to make a pool deposit
make_pool_deposit() {
    print_step "2. Making Pool Deposit (Contributor)"
    
    local deposit_data=$(cat <<EOF
{
    "poolId": "$POOL_ID",
    "amount": 500000,
    "currencyTokenId": "$CURRENCY_TOKEN",
    "ref": "deposit_$(date +%s)"
}
EOF
)
    
    print_status "Making pool deposit of 500,000 tokens..."
    local response=$(api_call "POST" "/pool-events/pool/deposit" "$deposit_data" "Authorization: Bearer admin-token")
    
    if echo "$response" | grep -q "jobId"; then
        print_success "Pool deposit queued successfully!"
        echo "$response" | jq '.'
        log_message "Pool deposit made: 500,000 tokens"
    else
        print_error "Failed to make pool deposit"
        echo "$response"
        exit 1
    fi
}

# Function to pay premium
pay_premium() {
    print_step "3. Paying Premium (Farmer)"
    
    local premium_data=$(cat <<EOF
{
    "poolId": "$POOL_ID",
    "policyId": "$POLICY_ID",
    "amount": 10000,
    "currencyTokenId": "$CURRENCY_TOKEN",
    "ref": "premium_$(date +%s)"
}
EOF
)
    
    print_status "Paying premium of 10,000 tokens..."
    local response=$(api_call "POST" "/pool-events/pool/premium" "$premium_data" "Authorization: Bearer admin-token")
    
    if echo "$response" | grep -q "jobId"; then
        print_success "Premium payment queued successfully!"
        echo "$response" | jq '.'
        log_message "Premium paid: 10,000 tokens"
    else
        print_error "Failed to pay premium"
        echo "$response"
        exit 1
    fi
}

# Function to trigger weather event
trigger_weather_event() {
    print_step "4. Triggering Weather Event (Oracle)"
    
    local trigger_data=$(cat <<EOF
{
    "type": "weather",
    "policyId": "$POLICY_ID",
    "location": "São Paulo, Brazil",
    "index": {
        "parameter": "temperature",
        "value": 36.5,
        "unit": "celsius",
        "threshold": 35.0
    },
    "window": {
        "from": "$(date -u -d '-1 hour' +%Y-%m-%dT%H:%M:%SZ)",
        "to": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    },
    "ruleRef": {
        "topicId": "0.0.123456",
        "ts": "$(date +%s)"
    },
    "oracleSig": "oracle_signature_$(date +%s)",
    "smartNodeSig": "smartnode_signature_$(date +%s)"
}
EOF
)
    
    print_status "Triggering weather event (temperature > 35°C)..."
    local response=$(api_call "POST" "/triggers" "$trigger_data" "Authorization: Bearer oracle-token")
    
    if echo "$response" | grep -q "jobId"; then
        print_success "Weather event triggered successfully!"
        echo "$response" | jq '.'
        log_message "Weather event triggered for policy: $POLICY_ID"
    else
        print_error "Failed to trigger weather event"
        echo "$response"
        exit 1
    fi
}

# Function to execute payout
execute_payout() {
    print_step "5. Executing Payout (Pool)"
    
    local payout_data=$(cat <<EOF
{
    "beneficiary": "$BENEFICIARY_ACCOUNT",
    "amount": 80000,
    "source": "POOL",
    "triggerRef": "trigger_$(date +%s)",
    "ruleRef": "rule_$(date +%s)",
    "sourceRef": "pool_$(date +%s)",
    "statusRef": "status_$(date +%s)",
    "txId": "tx_$(date +%s)"
}
EOF
)
    
    print_status "Executing payout of 80,000 tokens (stop-loss limit)..."
    local response=$(api_call "POST" "/payouts/$POLICY_ID/execute" "$payout_data" "Authorization: Bearer admin-token")
    
    if echo "$response" | grep -q "jobId"; then
        print_success "Payout executed successfully!"
        echo "$response" | jq '.'
        log_message "Payout executed: 80,000 tokens to $BENEFICIARY_ACCOUNT"
    else
        print_error "Failed to execute payout"
        echo "$response"
        exit 1
    fi
}

# Function to request cession
request_cession() {
    print_step "6. Requesting Cession (Reinsurer)"
    
    local cession_data=$(cat <<EOF
{
    "policyId": "$POLICY_ID",
    "excessAmount": 20000,
    "triggerRef": "trigger_$(date +%s)",
    "ruleRef": "rule_$(date +%s)",
    "lossCum": 100000,
    "retention": 80000
}
EOF
)
    
    print_status "Requesting cession for excess amount of 20,000 tokens..."
    local response=$(api_call "POST" "/cession/requested" "$cession_data" "Authorization: Bearer admin-token")
    
    if echo "$response" | grep -q "jobId"; then
        print_success "Cession request queued successfully!"
        echo "$response" | jq '.'
        log_message "Cession requested: 20,000 tokens excess"
    else
        print_error "Failed to request cession"
        echo "$response"
        exit 1
    fi
}

# Function to fund cession
fund_cession() {
    print_step "7. Funding Cession (Reinsurer)"
    
    local funding_data=$(cat <<EOF
{
    "policyId": "$POLICY_ID",
    "amount": 20000,
    "reinsurer": "$REINSURER_ACCOUNT",
    "txId": "tx_$(date +%s)",
    "ruleRef": "rule_$(date +%s)",
    "cessionRef": "cession_$(date +%s)"
}
EOF
)
    
    print_status "Funding cession with 20,000 tokens from reinsurer..."
    local response=$(api_call "POST" "/cession/funded" "$funding_data" "Authorization: Bearer reinsurer-token")
    
    if echo "$response" | grep -q "jobId"; then
        print_success "Cession funded successfully!"
        echo "$response" | jq '.'
        log_message "Cession funded: 20,000 tokens from $REINSURER_ACCOUNT"
    else
        print_error "Failed to fund cession"
        echo "$response"
        exit 1
    fi
}

# Function to execute final payout
execute_final_payout() {
    print_step "8. Executing Final Payout (Cession)"
    
    local final_payout_data=$(cat <<EOF
{
    "beneficiary": "$BENEFICIARY_ACCOUNT",
    "amount": 20000,
    "source": "CESSION",
    "triggerRef": "trigger_$(date +%s)",
    "ruleRef": "rule_$(date +%s)",
    "sourceRef": "cession_$(date +%s)",
    "statusRef": "status_$(date +%s)",
    "txId": "tx_$(date +%s)"
}
EOF
)
    
    print_status "Executing final payout of 20,000 tokens from cession..."
    local response=$(api_call "POST" "/payouts/$POLICY_ID/execute" "$final_payout_data" "Authorization: Bearer admin-token")
    
    if echo "$response" | grep -q "jobId"; then
        print_success "Final payout executed successfully!"
        echo "$response" | jq '.'
        log_message "Final payout executed: 20,000 tokens from cession"
    else
        print_error "Failed to execute final payout"
        echo "$response"
        exit 1
    fi
}

# Function to show flow summary
show_flow_summary() {
    print_header "Flow Summary"
    
    print_success "🎉 Complete Parametric Insurance Flow Executed Successfully!"
    echo ""
    print_status "Flow Overview:"
    echo "  📋 Policy Created: $POLICY_ID"
    echo "  💰 Pool Deposit: 500,000 tokens"
    echo "  💳 Premium Paid: 10,000 tokens"
    echo "  🌡️  Weather Event: Temperature > 35°C"
    echo "  💸 Pool Payout: 80,000 tokens (stop-loss limit)"
    echo "  🤝 Cession Request: 20,000 tokens excess"
    echo "  💵 Cession Funding: 20,000 tokens from reinsurer"
    echo "  🎯 Final Payout: 20,000 tokens from cession"
    echo ""
    print_status "Total Payout: 100,000 tokens"
    print_status "  - Pool Contribution: 80,000 tokens (80%)"
    print_status "  - Reinsurer Contribution: 20,000 tokens (20%)"
    echo ""
    print_status "Distribution of Premium (10,000 tokens):"
    print_status "  - Pool Reserve: 7,000 tokens (70%)"
    print_status "  - Reinsurer: 2,500 tokens (25%)"
    print_status "  - System Fee: 500 tokens (5%)"
    
    log_message "Flow summary displayed"
}

# Function to cleanup
cleanup() {
    print_header "Cleanup"
    
    if [ ! -z "$APP_PID" ]; then
        print_status "Stopping application (PID: $APP_PID)..."
        kill $APP_PID 2>/dev/null || true
        print_success "Application stopped"
    fi
    
    print_status "Cleanup completed"
    log_message "Cleanup completed"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -d, --demo     Run in demo mode (no real API calls)"
    echo "  -v, --verbose  Enable verbose output"
    echo "  -c, --cleanup  Cleanup after execution"
    echo ""
    echo "Examples:"
    echo "  $0              # Run complete flow"
    echo "  $0 --demo       # Run in demo mode"
    echo "  $0 --cleanup    # Run and cleanup after"
}

# Function to run demo mode
run_demo_mode() {
    print_header "Demo Mode - Parametric Insurance Flow"
    
    print_status "This is a demonstration of the parametric insurance flow:"
    echo ""
    print_step "1. Sistema gera seguros e suas regras ✅"
    print_step "2. Contribuidores travam capital no pool ✅"
    print_step "3. Resseguradores assinam tratado de participação ✅"
    print_step "4. Agricultor contrata o seguro ✅"
    print_step "5. Agricultor paga mensalmente 10k ✅"
    print_step "6. Distribuição: 70% Pool, 25% Resseguradores, 5% Sistema ✅"
    print_step "7. Agricultor sofre catástrofe climática ✅"
    print_step "8. Oracle registra triggerEvent ✅"
    print_step "9. Pool paga 80k (stop-loss) ✅"
    print_step "10. Resseguradores pagam 20k restante ✅"
    echo ""
    print_success "Demo completed successfully!"
}

# Main execution
main() {
    # Parse command line arguments
    DEMO_MODE=false
    VERBOSE=false
    CLEANUP_AFTER=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -d|--demo)
                DEMO_MODE=true
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -c|--cleanup)
                CLEANUP_AFTER=true
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Initialize log file
    echo "Parametric Insurance Flow Execution Log" > "$LOG_FILE"
    echo "Started at: $(date)" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
    
    print_header "Parametric Insurance Flow Runner"
    print_status "Starting complete parametric insurance flow..."
    log_message "Script started"
    
    # Execute main functions
    check_prerequisites
    
    if [ "$DEMO_MODE" = true ]; then
        run_demo_mode
    else
        initialize_ecosystem
        generate_wallets
        start_application
        
        # Wait a bit for application to fully start
        sleep 5
        
        # Execute the flow
        create_policy
        make_pool_deposit
        pay_premium
        trigger_weather_event
        execute_payout
        request_cession
        fund_cession
        execute_final_payout
        
        show_flow_summary
        
        if [ "$CLEANUP_AFTER" = true ]; then
            cleanup
        fi
    fi
    
    print_success "Flow execution completed successfully!"
    log_message "Script completed successfully"
    
    echo ""
    print_status "Log file: $LOG_FILE"
    if [ "$CLEANUP_AFTER" = false ] && [ "$DEMO_MODE" = false ]; then
        print_status "Application is still running. Use Ctrl+C to stop."
        print_status "Or run with --cleanup to stop automatically."
    fi
}

# Trap to ensure cleanup on exit
trap cleanup EXIT

# Run main function
main "$@"
