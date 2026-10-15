# Baaraath deployment

Baaraath is deployed as its own systemd service under `/var/www/baaraath`. The service listens only on `127.0.0.1:3107`; the deployment script does not edit Nginx or stop/restart any other application.

## One-time server setup

On the Ubuntu server, install Git, Node.js/npm, PostgreSQL client tools (`pg_dump`), curl, and Nginx if they are not already installed. Then clone the repository:

```bash
sudo mkdir -p /var/www/baaraath
sudo chown "$USER":"$USER" /var/www/baaraath
git clone https://github.com/amarendar0003/baaraath.git /var/www/baaraath
```

Create `/var/www/baaraath/shared/.env` with the production `DATABASE_URL` and a strong `AUTH_SECRET`. Keep it out of Git and restrict access:

```bash
sudo mkdir -p /var/www/baaraath/shared
sudo nano /var/www/baaraath/shared/.env
sudo chmod 600 /var/www/baaraath/shared/.env
```

The PostgreSQL URL must allow the server's `pg_dump` client to connect. Use a `postgres://` or `postgresql://` URL with the database name, username, password and host. Install a PostgreSQL client version compatible with the server.

## Deploy this release and later Git updates

Run the same command after each update has been pushed to the `main` branch:

```bash
sudo bash /var/www/baaraath/scripts/deploy-baaraath.sh
```

The script fetches `origin/main`, creates a timestamped backup **before deployment changes** in `/var/backups/baaraath/`, builds an immutable release, applies pending Prisma migrations, switches only `baaraath.service`, and checks the new release at `http://127.0.0.1:3107/baaraath/login`.

Each backup contains a compressed archive of the complete `/var/www/baaraath` directory and a PostgreSQL custom-format dump of the configured database. Backups are not automatically pruned. If build, migration, service restart, or health check fails, the script restores the previous application release (or stops a failed first deployment). It deliberately does **not** restore the database automatically: restore `database.dump` manually only after assessing writes made since the backup. A failed/partially applied migration may need database recovery even when the old application release is restored.

Commit and push all intended code and Prisma migration files to `main` before deploying. The script applies committed migrations with `prisma migrate deploy`; it does not infer schema changes or use `db push`.

## Enable the public `/baaraath` URL

The script intentionally leaves shared Nginx configuration unchanged. Review `scripts/nginx/baaraath-location.conf` and include its two locations **inside the existing Nginx `server {}` block** that serves `103.169.178.87`. Then run `sudo nginx -t` and reload Nginx using your normal procedure. This forwards only `/baaraath/` to Baaraath on port 3107; other routes and applications are not changed.

The app is built with Next.js `basePath=/baaraath`, including its internal navigation, API calls, and session-cookie path. The trailing slash is optional; Nginx redirects `/baaraath` to `/baaraath/`.

## Operational checks

```bash
sudo systemctl status baaraath.service
sudo journalctl -u baaraath.service -n 100 --no-pager
curl -I http://127.0.0.1:3107/baaraath/login
```

Override the default branch or deployment paths only when needed:

```bash
sudo env BAARAATH_BRANCH=main bash /var/www/baaraath/scripts/deploy-baaraath.sh
```
