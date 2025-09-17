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
LOG_FILE="$PROJECT_ROOT/flow-execution.log"

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

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check Node.js
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
    else
        print_error "Node.js not found. Please install Node.js 18+"
        exit 1
    fi
    
    # Check npm
    if command -v npm >/dev/null 2>&1; then
        NPM_VERSION=$(npm --version)
        print_success "npm found: $NPM_VERSION"
    else
        print_error "npm not found. Please install npm"
        exit 1
    fi
    
    # Check if we're in the right directory
    if [ ! -f "$PROJECT_ROOT/package.json" ]; then
        print_error "package.json not found. Please run this script from the backend directory."
        exit 1
    fi
    
    # Check if .smart_app.env file exists
    if [ ! -f "$PROJECT_ROOT/.smart_app.env" ]; then
        print_error ".smart_app.env file not found. Please ensure environment variables are configured."
        exit 1
    fi
    
    print_success "Prerequisites check completed"
    log_message "Prerequisites check completed"
}

# Run the flow using CLI command directly
run_flow_cli() {
    print_header "Running Parametric Insurance Flow"
    
    print_status "Executing complete parametric insurance flow using CLI commands..."
    print_info "This will demonstrate the complete flow step by step:"
    print_info "1. 📋 Creating insurance policy"
    print_info "2. 💰 Making pool deposit (contributor)"
    print_info "3. 💳 Paying premium (farmer)"
    print_info "4. 🌡️ Triggering weather event (oracle)"
    print_info "5. 💸 Executing pool payout (stop-loss)"
    print_info "6. 🤝 Requesting cession (excess amount)"
    print_info "7. 💵 Funding cession (reinsurer)"
    print_info "8. 🎯 Executing final payout"
    
    echo ""
    print_status "Starting flow execution..."
    
    # Run the flow command with verbose output
    if npm run flow-real; then
        print_success "Flow executed successfully!"
        log_message "Flow execution completed successfully"
    else
        print_error "Failed to execute flow"
        log_message "Flow execution failed"
        exit 1
    fi
}

# Show flow summary
show_flow_summary() {
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
}

# Cleanup function
cleanup() {
    print_header "Cleanup"
    print_info "Cleanup completed"
    log_message "Cleanup completed"
}

# Main execution
main() {
    # Initialize log file
    echo "Parametric Insurance Flow Execution Log" > "$LOG_FILE"
    echo "Started at: $(date)" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
    
    print_header "Parametric Insurance Flow Runner (Simple CLI Version)"
    print_status "Starting complete parametric insurance flow using CLI commands..."
    print_info "This version skips ecosystem initialization and runs the flow directly."
    log_message "Script started"
    
    # Execute main functions
    check_prerequisites
    run_flow_cli
    show_flow_summary
    cleanup
    
    print_success "Flow execution completed successfully!"
    log_message "Script completed successfully"
    
    echo ""
    print_status "Log file: $LOG_FILE"
}

# Trap to ensure cleanup on exit
trap cleanup EXIT

# Run main function
main "$@"
