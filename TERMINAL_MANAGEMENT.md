# 🖥️ Terminal Management & Background Process Prevention

A comprehensive guide to managing terminal proliferation and preventing background process accumulation in development environments.

## 🚨 **The Problem**

Development environments often accumulate:

- Multiple zsh terminals from IDE features
- Background Node.js processes
- Orphaned development servers
- Unused terminal sessions

## 🛠️ **Immediate Solutions**

### **1. Use Cursor's Built-in Terminal Management**

- **Close unused terminals**: Click the "X" on terminal tabs you're not using
- **Use the terminal dropdown**: Click the dropdown arrow next to terminal tabs to see all terminals and close them
- **Limit terminal instances**: Cursor often creates new terminals for different tasks

### **2. Terminal Session Management**

```bash
# Check for orphaned terminals regularly
ps aux | grep zsh | grep -v grep | wc -l

# Quick cleanup script you can run
pkill -f "zsh" && sleep 1 && exec zsh
```

### **3. Use tmux for Better Terminal Management**

```bash
# Install tmux if not already installed
brew install tmux

# Start a tmux session
tmux new-session -s dev

# Split panes instead of multiple terminals
# Ctrl+b % (split vertically)
# Ctrl+b " (split horizontally)
# Ctrl+b arrow (navigate between panes)
```

## 🚫 **Prevention Strategies**

### **4. Cursor Settings**

- **Disable auto-terminal creation**: Check Cursor settings for terminal-related options
- **Set terminal limits**: Look for settings that control how many terminals can be open
- **Use integrated terminal**: Stick to one integrated terminal instead of multiple

### **5. Development Workflow**

```bash
# Use a single terminal with job control
npm run start:dev &  # Run in background
jobs                 # See background jobs
fg                   # Bring to foreground
Ctrl+Z              # Suspend
bg                   # Resume in background
```

### **6. Script-Based Management**

Create a cleanup script (`cleanup.sh`):

```bash
#!/bin/bash
echo "Cleaning up background processes..."
pkill -f "nest start" 2>/dev/null
pkill -f "npm run start" 2>/dev/null
pkill -f "nodemon" 2>/dev/null
echo "Cleanup complete!"
```

### **7. Environment Variables for Better Control**

```bash
# Add to your .zshrc
export NODE_ENV=development
export MAX_TERMINALS=3

# Check terminal count function
check_terminals() {
    count=$(ps aux | grep zsh | grep -v grep | wc -l)
    if [ $count -gt $MAX_TERMINALS ]; then
        echo "Warning: $count terminals running (max: $MAX_TERMINALS)"
    fi
}
```

## 📋 **Best Practices**

### **8. Terminal Hygiene**

- **Close terminals when done**: Don't leave them running
- **Use one terminal per project**: Avoid multiple terminals for the same task
- **Regular cleanup**: Run cleanup scripts periodically

### **9. IDE Configuration**

- **Disable auto-restart**: Prevent Cursor from automatically restarting terminals
- **Limit workspace terminals**: Set maximum terminals per workspace
- **Use workspace-specific terminals**: Don't share terminals across projects

### **10. Monitoring Script**

Create a monitoring script (`monitor-terminals.sh`):

```bash
#!/bin/bash
while true; do
    terminal_count=$(ps aux | grep zsh | grep -v grep | wc -l)
    echo "$(date): $terminal_count terminals running"

    if [ $terminal_count -gt 5 ]; then
        echo "Too many terminals! Consider cleanup."
    fi

    sleep 30
done
```

## ⚡ **Quick Commands for Future Use**

### **Terminal Management**

```bash
# Quick terminal count
ps aux | grep zsh | grep -v grep | wc -l

# Kill all but current terminal
ps aux | grep zsh | grep -v grep | grep -v "$$" | awk '{print $2}' | xargs kill -9

# Kill all Node.js processes
pkill -f "node" && pkill -f "npm" && pkill -f "nest"

# Check what's using port 3000
lsof -i :3000
```

### **Process Cleanup**

```bash
# Kill all development servers
pkill -f "nest start"
pkill -f "npm run start:dev"
pkill -f "nodemon"

# Kill all background processes
pkill -f "zsh" && sleep 1 && exec zsh

# Force kill stubborn processes
kill -9 $(ps aux | grep -E "(node|npm|nest)" | grep -v grep | awk '{print $2}')
```

### **Port Management**

```bash
# Check what's using specific ports
lsof -i :3000  # Check port 3000
lsof -i :3306  # Check MySQL port
lsof -i :8080  # Check common dev port

# Kill process using specific port
kill -9 $(lsof -t -i:3000)
```

## 🔧 **Automated Scripts**

### **Quick Cleanup Script** (`quick-cleanup.sh`)

```bash
#!/bin/bash
echo "🧹 Quick Cleanup Starting..."

# Kill development servers
echo "Stopping development servers..."
pkill -f "nest start" 2>/dev/null
pkill -f "npm run start" 2>/dev/null
pkill -f "nodemon" 2>/dev/null

# Kill excess terminals (keep current one)
echo "Cleaning up terminals..."
current_pid=$$
ps aux | grep zsh | grep -v grep | grep -v "$current_pid" | awk '{print $2}' | xargs kill -9 2>/dev/null

# Check results
terminal_count=$(ps aux | grep zsh | grep -v grep | wc -l)
echo "✅ Cleanup complete! $terminal_count terminals remaining."
```

### **Development Environment Reset** (`dev-reset.sh`)

```bash
#!/bin/bash
echo "🔄 Development Environment Reset"

# Stop all development processes
echo "Stopping all development processes..."
pkill -f "nest" 2>/dev/null
pkill -f "npm" 2>/dev/null
pkill -f "node" 2>/dev/null
pkill -f "nodemon" 2>/dev/null

# Clean up terminals
echo "Cleaning up terminals..."
current_pid=$$
ps aux | grep zsh | grep -v grep | grep -v "$current_pid" | awk '{print $2}' | xargs kill -9 2>/dev/null

# Wait for processes to stop
sleep 2

# Check Docker services
echo "Checking Docker services..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo "✅ Environment reset complete!"
echo "Ready to start fresh development session."
```

### **Terminal Monitor** (`terminal-monitor.sh`)

```bash
#!/bin/bash
echo "📊 Terminal Monitor Started"
echo "Press Ctrl+C to stop monitoring"

while true; do
    clear
    echo "=== Terminal Monitor ==="
    echo "Time: $(date)"
    echo ""

    # Terminal count
    terminal_count=$(ps aux | grep zsh | grep -v grep | wc -l)
    echo "📱 Terminals: $terminal_count"

    # Node processes
    node_count=$(ps aux | grep -E "(node|npm|nest)" | grep -v grep | wc -l)
    echo "🟢 Node Processes: $node_count"

    # Port usage
    echo ""
    echo "🔌 Port Usage:"
    lsof -i :3000 2>/dev/null | head -3
    lsof -i :3306 2>/dev/null | head -3

    # Warnings
    if [ $terminal_count -gt 5 ]; then
        echo ""
        echo "⚠️  WARNING: Too many terminals ($terminal_count)"
        echo "   Run: ./quick-cleanup.sh"
    fi

    if [ $node_count -gt 3 ]; then
        echo ""
        echo "⚠️  WARNING: Too many Node processes ($node_count)"
        echo "   Run: pkill -f 'node'"
    fi

    sleep 5
done
```

## 🎯 **Daily Workflow Recommendations**

### **Morning Routine**

1. **Check terminal count**: `ps aux | grep zsh | grep -v grep | wc -l`
2. **Clean up if needed**: Run quick cleanup script
3. **Start fresh**: Begin development with clean environment

### **During Development**

1. **Use job control**: `npm run start:dev &` then `fg` when needed
2. **Monitor processes**: Keep an eye on terminal count
3. **Close unused terminals**: Don't accumulate terminals

### **End of Day**

1. **Stop all servers**: `pkill -f "nest" && pkill -f "npm"`
2. **Clean up terminals**: Run cleanup script
3. **Verify clean state**: Check process count

## 🚀 **Advanced Solutions**

### **Docker Development Environment**

Consider using Docker for development to isolate processes:

```bash
# Docker Compose for development
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
    command: npm run start:dev
```

### **Process Manager (PM2)**

Use PM2 for better process management:

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start npm --name "nestjs-app" -- run start:dev

# Monitor processes
pm2 list
pm2 stop nestjs-app
pm2 restart nestjs-app
```

## 📝 **Troubleshooting**

### **Common Issues**

- **Can't kill processes**: Use `kill -9` for force kill
- **Port already in use**: Use `lsof -i :PORT` to find process
- **Terminals keep spawning**: Check IDE settings for auto-terminal creation

### **Emergency Cleanup**

```bash
# Nuclear option - kill everything
pkill -f "zsh" && pkill -f "node" && pkill -f "npm" && pkill -f "nest"
sleep 2
exec zsh  # Restart shell
```

---

## 📚 **Additional Resources**

- [tmux Documentation](https://github.com/tmux/tmux/wiki)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Docker Development Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

_Last updated: $(date)_
_Use these strategies to maintain a clean and efficient development environment!_
