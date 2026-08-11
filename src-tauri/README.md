# Tauri desktop shell

This directory contains the minimal Tauri 2 Rust shell. The UI remains runnable in Vite while the local data schema, scraper boundary and Windows toolchain are finalized. Rust is not installed in the current environment, so a Windows installer cannot be compiled here yet.

Planned boundaries:

- `src/commands/`: typed commands for local data and update checks;
- `src/storage/`: SQLite migrations and local preference storage;
- `src/updater/`: signed application update configuration;
- `capabilities/`: least-privilege Tauri permissions.

After installing Rust stable and the Tauri CLI, use `npm run tauri dev` to launch the desktop shell.
