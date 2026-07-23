# Hemal's Host Panel

Made by Hemal

A web-based game server management panel with file manager, terminal access, and playit.gg integration.

## Quick Install (Linux)

Run this one-liner on your VPS/server:

```bash
bash <(curl -s https://raw.githubusercontent.com/HemalDas666/Hemals_Host_Panal/main/install.sh)
```

## Manual Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/HemalDas666/Hemals_Host_Panal.git
   cd Hemals_Host_Panal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the application:
   ```bash
   npm run build
   ```

4. Create an admin user:
   ```bash
   npm run createuser
   ```

5. Start the server:
   ```bash
   npm run start
   ```

## Development

To run the panel in development mode with auto-reloading:

```bash
npm run dev
```

## Requirements

- Node.js 20+
- A Linux VPS (Ubuntu/Debian recommended)
