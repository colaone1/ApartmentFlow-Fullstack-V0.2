# Load .bashrc if it exists
if [ -f ~/.bashrc ]; then
    source ~/.bashrc
fi

# Set default editor
export EDITOR=vim

# Set language
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# Set terminal type
export TERM=xterm-256color

# Set npm global path
export PATH="$HOME/.npm-global/bin:$PATH"

# Create npm global directory if it doesn't exist
if [ ! -d "$HOME/.npm-global" ]; then
    mkdir -p "$HOME/.npm-global"
fi

# Set npm cache directory
export NPM_CONFIG_CACHE="$HOME/.npm-cache"

# Create npm cache directory if it doesn't exist
if [ ! -d "$NPM_CONFIG_CACHE" ]; then
    mkdir -p "$NPM_CONFIG_CACHE"
fi

# Welcome message
echo "Welcome to your optimized Git Bash environment!"
echo "Current directory: $(pwd)"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)" 