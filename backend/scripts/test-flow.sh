#!/bin/bash

# =============================================================================
# Script: test-flow.sh
# Description: Quick test script for parametric insurance flow
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
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
    else
        print_error "Node.js not found. Please install Node.js 18+"
        exit 1
    fi
    
    # Check npm
    if command_exists npm; then
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
    
    # Check if node_modules exists
    if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
        print_warning "node_modules not found. Installing dependencies..."
        cd "$PROJECT_ROOT"
        npm install
        print_success "Dependencies installed"
    fi
    
    print_success "Prerequisites check completed"
}

# Function to test CLI commands
test_cli_commands() {
    print_header "Testing CLI Commands"
    
    cd "$PROJECT_ROOT"
    
    # Test config command
    print_status "Testing config command..."
    if npm run commander -- config --help > /dev/null 2>&1; then
        print_success "Config command working"
    else
        print_error "Config command failed"
        return 1
    fi
    
    # Test flow command
    print_status "Testing flow command..."
    if npm run commander -- flow --help > /dev/null 2>&1; then
        print_success "Flow command working"
    else
        print_error "Flow command failed"
        return 1
    fi
    
    print_success "CLI commands test completed"
}

# Function to test demo flow
test_demo_flow() {
    print_header "Testing Demo Flow"
    
    cd "$PROJECT_ROOT"
    
    print_status "Running demo flow..."
    if npm run flow-demo > /dev/null 2>&1; then
        print_success "Demo flow completed successfully"
    else
        print_error "Demo flow failed"
        return 1
    fi
}

# Function to test script execution
test_script_execution() {
    print_header "Testing Script Execution"
    
    cd "$PROJECT_ROOT"
    
    # Test script help
    print_status "Testing script help..."
    if ./scripts/run-parametric-flow.sh --help > /dev/null 2>&1; then
        print_success "Script help working"
    else
        print_error "Script help failed"
        return 1
    fi
    
    # Test demo mode
    print_status "Testing script demo mode..."
    if ./scripts/run-parametric-flow.sh --demo > /dev/null 2>&1; then
        print_success "Script demo mode working"
    else
        print_error "Script demo mode failed"
        return 1
    fi
}

# Function to show test results
show_test_results() {
    print_header "Test Results Summary"
    
    print_success "✅ Prerequisites check passed"
    print_success "✅ CLI commands test passed"
    print_success "✅ Demo flow test passed"
    print_success "✅ Script execution test passed"
    
    echo ""
    print_status "🎉 All tests passed! The parametric insurance flow is ready to use."
    echo ""
    print_status "Next steps:"
    print_status "1. Run demo flow: npm run run-flow-demo"
    print_status "2. Run real flow: npm run run-flow"
    print_status "3. Use CLI commands: npm run flow-demo"
    print_status "4. Read the guide: cat FLOW_EXECUTION_GUIDE.md"
}

# Main execution
main() {
    print_header "Parametric Insurance Flow Test Suite"
    print_status "Running comprehensive tests..."
    
    # Execute tests
    check_prerequisites
    test_cli_commands
    test_demo_flow
    test_script_execution
    
    # Show results
    show_test_results
}

# Run main function
main "$@"
