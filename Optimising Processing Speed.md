# Optimising Processing Speed

A comprehensive checklist and summary to fully optimize processing speed and quality for all your future development projects, including IDE, system, network, and development environment best practices.

---

## 1. Cursor IDE & Editor Optimizations
- **Disable unused AI models**: Enable only the model(s) you use most (e.g., `gpt-4o`).
- **Turn off MAX Mode** unless you need a larger context window.
- **Clear Cursor cache**:
  - Press `Ctrl + Shift + P`, type `Clear Cache`, and execute.
  - Restart Cursor after clearing cache.
- **Disable unnecessary extensions** to reduce overhead and potential conflicts.
- **Install essential extensions** for your workflow (e.g., Git Bash, ESLint, Prettier, Docker, database tools).
- **Reduce context window size** if available in settings.
- **Enable GPU acceleration** if available in settings.
- **Keep your editor and extensions up to date** for best performance and security.

---

## 2. System & Hardware Optimizations
- **Use a wired Ethernet connection** for lowest latency and highest stability.
- **If using Wi-Fi, use 5GHz band** for faster, less congested wireless.
- **Move closer to your router** to improve signal strength.
- **Upgrade to SSD storage** for faster file access and project load times.
- **Increase RAM** if possible for better multitasking and larger projects.
- **Update graphics drivers** for best GPU performance:
  - Open Device Manager > Display adapters > Right-click your GPU > Update driver.
  - Or download from NVIDIA, AMD, or Intel's official site.
- **Set Windows to High Performance mode**:
  - Windows Settings > System > Power & sleep > Additional power settings > High Performance.
- **Close unnecessary background applications** to free up CPU and RAM.
- **Restart your computer regularly** to clear memory and apply updates.

---

## 3. File System & Disk Optimizations
- **Run file system check**:
  - Open Command Prompt as Administrator
  - Run: `chkdsk C: /f`
  - Restart your computer if prompted
- **Keep project files on SSD** for best speed.
- **Regularly clean up temporary files** and unused programs.
- **Defragment HDDs (if not using SSDs)** for better performance.

---

## 4. Development Environment Optimizations
- **Use RAM disk for temp/cache directories** (advanced):
  - Set up a RAM disk and point npm, Jest, and temp files to it for ultra-fast access.
- **Optimize MongoDB (or other DB) settings** for development:
  - Increase memory limits, enable query profiling, and add indexes for common queries.
- **Use Git optimizations**:
  - Enable fsmonitor and preloadindex for faster git status.
  - Run `git gc --prune=now` to optimize repository size.
- **Configure environment variables** for performance (e.g., `NODE_OPTIONS`, `UV_THREADPOOL_SIZE`).

---

## 5. Extensions & Tools Management (Template)
- [ ] Remove unused extensions after project setup.
- [ ] Install only essential extensions:
  - [ ] Git Bash or integrated terminal
  - [ ] ESLint & Prettier (for code quality)
  - [ ] Docker & Dev Containers (for isolated environments)
  - [ ] Database tools (MongoDB, SQL, etc.)
  - [ ] Testing tools (Jest, Mocha, etc.)
  - [ ] Any project-specific tools
- [ ] Keep a list of recommended extensions for each project type.

---

## 6. Tracking & Benchmarking
- **Keep a checklist in your project** (like this file) to track optimizations.
- **Benchmark before and after** (e.g., with disk speed tools or Node.js scripts) to measure impact.
- **Document any project-specific tweaks** for future reference.

---

## Example Checklist

- [x] Using 5GHz Wi-Fi
- [x] Cleared Cursor cache
- [x] Disabled unused AI models
- [x] Updated graphics drivers
- [x] Set Windows to High Performance
- [x] Closed background apps
- [x] Ran file system check (chkdsk)
- [x] Using SSD for project files
- [x] Set up RAM disk for cache/temp
- [x] Optimized MongoDB for dev
- [x] Enabled Git performance settings
- [x] Installed essential extensions

---

**Copy this file to any project to keep your workflow fully optimized for speed and efficiency!** 