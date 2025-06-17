# Git Bash Optimizations

# Colors for better visibility
export CLICOLOR=1
export LSCOLORS=GxFxCxDxBxegedabagaced

# Custom prompt with git branch
parse_git_branch() {
    git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/ (\1)/'
}

# Custom prompt with colors and git branch
export PS1="\[\033[32m\]\w\[\033[33m\]\$(parse_git_branch)\[\033[00m\] $ "

# Performance optimizations
export NODE_OPTIONS="--max-old-space-size=8192 --optimize-for-size --max-semi-space-size=128"
export NPM_CONFIG_CACHE="$TMPDIR/npm-cache"
export JEST_CACHE_DIR="$TMPDIR/jest-cache"

# Create necessary directories
mkdir -p "$NPM_CONFIG_CACHE"
mkdir -p "$JEST_CACHE_DIR"

# Git optimizations
git config --global core.fsmonitor true
git config --global core.preloadindex true
git config --global pack.threads 0
git config --global core.autocrlf false
git config --global core.fileMode false
git config --global credential.helper store

# Node.js performance settings
export UV_THREADPOOL_SIZE=128

# Development shortcuts
alias ll='ls -la'
alias gs='git status'
alias ga='git add'
alias gc='git commit'
alias gp='git push'
alias gl='git pull'
alias gd='git diff'
alias gb='git branch'
alias gco='git checkout'

# Node.js specific aliases
alias nr='npm run'
alias ni='npm install'
alias nt='npm test'
alias ns='npm start'
alias nd='npm run dev'

# Performance monitoring
alias meminfo='free -h'
alias cpuinfo='top -bn1'
alias diskusage='df -h'

# Development shortcuts
alias cdp='cd "$(pwd)"'
alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'

# Clear screen with Ctrl+L
bind '"\C-l": clear-screen'

# Enable case-insensitive tab completion
set completion-ignore-case on

# Show all matches if there is ambiguity
set show-all-if-ambiguous on

# Add timestamp to history
export HISTTIMEFORMAT="%F %T "

# Prevent accidental overwrites
set -o noclobber

# Enable better command history search
bind '"\e[A": history-search-backward'
bind '"\e[B": history-search-forward'

# History settings
HISTSIZE=10000
HISTFILESIZE=20000
HISTCONTROL=ignoreboth:erasedups

# Path optimizations
export PATH="$HOME/.npm-global/bin:$PATH"
export PATH="$HOME/.local/bin:$PATH"

# Load any local bash configurations
if [ -f ~/.bashrc.local ]; then
    source ~/.bashrc.local
fi

# RAM disk configuration for temporary files
export TMPDIR="/c/tmp"
if [ ! -d "$TMPDIR" ]; then
    mkdir -p "$TMPDIR"
fi 