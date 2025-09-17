#!/bin/bash

# =============================================================================
# Script: initialize-ecosystem.sh
# Description: Initialize the Parametric Insurance Ecosystem
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
LOG_FILE="$PROJECT_ROOT/ecosystem-init.log"

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

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
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

# Function to initialize the ecosystem
initialize_ecosystem() {
    print_header "Initializing Parametric Insurance Ecosystem"
    
    cd "$PROJECT_ROOT"
    
    print_status "Creating HCS topics for parametric insurance..."
    print_status "- Policy Registry Topic (stores insurance policies)"
    print_status "- Rules Topic (manages insurance rules and payout conditions)"
    print_status "- Triggers Topic (handles weather data and trigger events)"
    
    # Run the config command
    print_status "Executing ecosystem initialization..."
    
    if npm run start -- config --force; then
        print_success "Ecosystem initialized successfully!"
        log_message "Ecosystem initialization completed successfully"
    else
        print_error "Failed to initialize ecosystem"
        log_message "Ecosystem initialization failed"
        exit 1
    fi
}

# Function to display results
display_results() {
    print_header "Initialization Results"
    
    print_success "Parametric Insurance Ecosystem is now ready!"
    print_status "The following HCS topics have been created:"
    print_status "📋 Policy Registry Topic - Stores insurance policy information"
    print_status "📏 Rules Topic - Manages insurance rules and payout conditions"  
    print_status "⚡ Triggers Topic - Handles weather data and trigger events"
    
    print_status "Configuration has been saved to the database."
    print_status "You can now start using the parametric insurance system."
    
    log_message "Initialization results displayed"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -f, --force    Force initialization even if configuration exists"
    echo "  -v, --verbose  Enable verbose output"
    echo ""
    echo "Examples:"
    echo "  $0              # Initialize ecosystem with confirmation prompts"
    echo "  $0 --force      # Force initialization without confirmation"
    echo "  $0 --verbose    # Initialize with verbose output"
}

# Main execution
main() {
    # Parse command line arguments
    FORCE_FLAG=""
    VERBOSE_FLAG=""
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -f|--force)
                FORCE_FLAG="--force"
                shift
                ;;
            -v|--verbose)
                VERBOSE_FLAG="--verbose"
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
    echo "Parametric Insurance Ecosystem Initialization Log" > "$LOG_FILE"
    echo "Started at: $(date)" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
    
    print_header "Parametric Insurance Ecosystem Initializer"
    print_status "Starting ecosystem initialization..."
    log_message "Script started"
    
    # Execute main functions
    check_prerequisites
    initialize_ecosystem
    display_results
    
    print_success "Initialization completed successfully!"
    log_message "Script completed successfully"
    
    echo ""
    print_status "Log file: $LOG_FILE"
    print_status "Next steps:"
    print_status "1. Start the application: npm run start:dev"
    print_status "2. Generate stakeholder wallets: npm run generate-wallets"
    print_status "3. Begin using the parametric insurance system"
}

# Run main function
main "$@"


