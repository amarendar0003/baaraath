#!/usr/bin/env bash
set -Eeuo pipefail

APP_ROOT="${BAARAATH_ROOT:-/var/www/baaraath}"
BACKUP_ROOT="${BAARAATH_BACKUP_ROOT:-/var/backups/baaraath}"
BRANCH="${BAARAATH_BRANCH:-main}"
SERVICE_NAME="baaraath.service"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}"
SERVICE_MARKER="# Managed by Baaraath deployment script"
SERVICE_USER="baaraath-web"
SERVICE_TMP=""
PORT="${BAARAATH_PORT:-3107}"
BASE_PATH="/baaraath"
HEALTH_URL="http://127.0.0.1:${PORT}${BASE_PATH}/login"
DEPLOY_ID="$(date -u +%Y%m%dT%H%M%SZ)-$$"
BACKUP_DIR="${BACKUP_ROOT}/${DEPLOY_ID}"
RELEASE_DIR="${APP_ROOT}/releases/${DEPLOY_ID}"
CURRENT_LINK="${APP_ROOT}/current"
PREVIOUS_RELEASE=""
SWITCHED_RELEASE=0
MIGRATIONS_STARTED=0
SERVICE_CONFIG_CHANGED=0

log() {
  printf '[baaraath-deploy] %s\n' "$*"
}

fail() {
  log "ERROR: $*"
  exit 1
}

on_error() {
  local status="$1"
  local line="$2"
  trap - ERR
  set +e
  log "Deployment failed at line ${line} (exit ${status})."

  if (( SERVICE_CONFIG_CHANGED )) && [[ -n "$PREVIOUS_RELEASE" ]] &&
    [[ -f "${BACKUP_DIR}/baaraath.service.previous" ]]; then
    local restore_unit="${SERVICE_FILE}.rollback-${DEPLOY_ID}"
    cp -p "${BACKUP_DIR}/baaraath.service.previous" "$restore_unit"
    mv -f "$restore_unit" "$SERVICE_FILE"
    systemctl daemon-reload
    SERVICE_CONFIG_CHANGED=0
    log "Restored the previous Baaraath systemd unit."
  fi

  if (( SWITCHED_RELEASE )); then
    if [[ -n "$PREVIOUS_RELEASE" ]]; then
      local rollback_link="${APP_ROOT}/.current-rollback-${DEPLOY_ID}"
      ln -s "$PREVIOUS_RELEASE" "$rollback_link"
      mv -Tf "$rollback_link" "$CURRENT_LINK"
      log "Restored application release: ${PREVIOUS_RELEASE}"
      systemctl restart "$SERVICE_NAME"
    else
      rm -f "$CURRENT_LINK"
      systemctl disable --now "$SERVICE_NAME"
      log "No prior release existed; stopped the failed first deployment."
    fi
  elif (( MIGRATIONS_STARTED )); then
    if [[ -n "$PREVIOUS_RELEASE" ]]; then
      systemctl restart "$SERVICE_NAME"
    else
      systemctl disable --now "$SERVICE_NAME"
    fi
  fi

  if (( SERVICE_CONFIG_CHANGED )); then
    rm -f "$SERVICE_TMP" "$SERVICE_FILE"
    systemctl daemon-reload
    log "Removed the failed first-deployment systemd unit."
  fi

  if (( MIGRATIONS_STARTED )); then
    log "The database was NOT automatically restored. Backup for manual recovery: ${BACKUP_DIR}/database.dump"
  fi

  log "Full pre-deployment application backup: ${BACKUP_DIR}/application.tar.gz"
  exit "$status"
}
trap 'on_error "$?" "$LINENO"' ERR

[[ "$EUID" -eq 0 ]] || fail "Run this script as root (for example: sudo $APP_ROOT/scripts/deploy-baaraath.sh)."
[[ -d "$APP_ROOT/.git" ]] || fail "No Git checkout found at $APP_ROOT. Clone the Baaraath repository there first."
[[ -x /usr/bin/systemctl ]] || fail "systemd is required for this isolated service deployment."
command -v flock >/dev/null || fail "flock is required to prevent overlapping deployments."
exec 9>/var/lock/baaraath-deploy.lock
flock -n 9 || fail "Another Baaraath deployment is already running."

cd "$APP_ROOT"
git -C "$APP_ROOT" rev-parse --is-inside-work-tree >/dev/null

if [[ -e "$SERVICE_FILE" ]] && ! grep -Fq "$SERVICE_MARKER" "$SERVICE_FILE"; then
  fail "$SERVICE_FILE already exists and is not managed by this Baaraath script; refusing to replace it."
fi
[[ ! -L "$SERVICE_FILE" ]] || fail "$SERVICE_FILE is a symlink; refusing to replace its target."

if systemctl is-active --quiet "$SERVICE_NAME" 2>/dev/null &&
  ! grep -Fq "$SERVICE_MARKER" "$SERVICE_FILE" 2>/dev/null; then
  fail "$SERVICE_NAME is active but is not managed by this script; refusing to restart it."
fi

NODE_BIN="$(command -v node)" || fail "Node.js is required."
NPM_BIN="$(command -v npm)" || fail "npm is required."
command -v git >/dev/null || fail "Git is required."
command -v pg_dump >/dev/null || fail "PostgreSQL client tools (pg_dump) are required."
command -v curl >/dev/null || fail "curl is required for the release health check."
command -v tar >/dev/null || fail "tar is required for application backups."
command -v ss >/dev/null || fail "ss is required to verify that the Baaraath port is unused."
[[ "$PORT" =~ ^[0-9]{1,5}$ ]] || fail "BAARAATH_PORT must be a TCP port between 1024 and 65535."
PORT=$((10#$PORT))
(( PORT >= 1024 && PORT <= 65535 )) || fail "BAARAATH_PORT must be a TCP port between 1024 and 65535."

LISTENERS="$(ss -H -ltn "sport = :${PORT}")"
if [[ -n "$LISTENERS" ]]; then
  if ! systemctl is-active --quiet "$SERVICE_NAME" 2>/dev/null ||
    ! grep -Fq "$SERVICE_MARKER" "$SERVICE_FILE" 2>/dev/null; then
    fail "TCP port ${PORT} is already in use by another service; refusing to interfere with it."
  fi
fi

if [[ -L "$CURRENT_LINK" ]]; then
  PREVIOUS_RELEASE="$(readlink -f "$CURRENT_LINK")"
  [[ -n "$PREVIOUS_RELEASE" && -d "$PREVIOUS_RELEASE" ]] || fail "$CURRENT_LINK points to a missing release."
  case "$PREVIOUS_RELEASE" in
    "${APP_ROOT}/releases/"*) ;;
    *) fail "$CURRENT_LINK points outside ${APP_ROOT}/releases; refusing to switch it." ;;
  esac
elif [[ -e "$CURRENT_LINK" ]]; then
  fail "$CURRENT_LINK exists but is not a symlink; refusing to replace it."
fi

ENV_FILE="${APP_ROOT}/shared/.env"
ENV_SOURCE="$ENV_FILE"
if [[ ! -f "$ENV_FILE" && -f "${APP_ROOT}/.env" ]]; then
  ENV_SOURCE="${APP_ROOT}/.env"
fi
[[ -f "$ENV_SOURCE" ]] || fail "Create $ENV_FILE with DATABASE_URL and AUTH_SECRET before deploying."

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_ROOT" "$BACKUP_DIR"
log "Creating PostgreSQL backup before deployment."

if ! ENV_FILE="$ENV_SOURCE" BACKUP_FILE="${BACKUP_DIR}/database.dump" "$NODE_BIN" --input-type=module <<'NODE'
import { chmod, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const envFile = process.env.ENV_FILE;
const backupFile = process.env.BACKUP_FILE;
const contents = await readFile(envFile, "utf8");
const line = contents.split(/\r?\n/).find((entry) => /^\s*DATABASE_URL\s*=/.test(entry));
if (!line) {
  console.error("DATABASE_URL is missing from the deployment environment file.");
  process.exit(2);
}

let rawUrl = line.slice(line.indexOf("=") + 1).trim();
if (
  (rawUrl.startsWith('"') && rawUrl.endsWith('"')) ||
  (rawUrl.startsWith("'") && rawUrl.endsWith("'"))
) {
  rawUrl = rawUrl.slice(1, -1);
}

let url;
try {
  url = new URL(rawUrl);
} catch {
  console.error("DATABASE_URL is not a valid PostgreSQL connection URL.");
  process.exit(2);
}

if (!["postgres:", "postgresql:"].includes(url.protocol)) {
  console.error("DATABASE_URL must use the postgres:// or postgresql:// scheme.");
  process.exit(2);
}

const database = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
const username = decodeURIComponent(url.username);
const password = decodeURIComponent(url.password);
if (!url.hostname || !database || !username) {
  console.error("DATABASE_URL must include a host, database name, and username.");
  process.exit(2);
}

const escapePassfile = (value) => value.replaceAll("\\", "\\\\").replaceAll(":", "\\:");
const tempDir = await mkdtemp(join(tmpdir(), "baaraath-pgpass-"));
const passFile = join(tempDir, "pgpass");
await writeFile(
  passFile,
  `${[
    escapePassfile(url.hostname),
    url.port || "5432",
    escapePassfile(database),
    escapePassfile(username),
    escapePassfile(password),
  ].join(":")}\n`,
  { mode: 0o600 },
);
await chmod(passFile, 0o600);

const sslParams = ["sslmode", "sslrootcert", "sslcert", "sslkey", "sslcrl"];
const childEnv = { ...process.env, PGPASSFILE: passFile };
for (const key of sslParams) {
  const value = url.searchParams.get(key);
  if (value) {
    childEnv[`PG${key.toUpperCase()}`] = value;
  }
}

if (
  url.searchParams.get("sslmode") === "verify-full" &&
  !url.searchParams.has("sslrootcert")
) {
  const systemCaBundle = "/etc/ssl/certs/ca-certificates.crt";
  try {
    await readFile(systemCaBundle);
    childEnv.PGSSLROOTCERT = systemCaBundle;
  } catch {
    console.error(
      `sslmode=verify-full requires a CA certificate; ${systemCaBundle} is not available.`,
    );
    await rm(tempDir, { recursive: true, force: true });
    process.exit(2);
  }
}

try {
  const result = spawnSync(
    "pg_dump",
    [
      "--no-password",
      "--format=custom",
      `--file=${backupFile}`,
      `--host=${url.hostname}`,
      `--port=${url.port || "5432"}`,
      `--username=${username}`,
      `--dbname=${database}`,
    ],
    { env: childEnv, stdio: "inherit" },
  );
  if (result.error) {
    console.error("Could not run pg_dump:", result.error.message);
    process.exitCode = 1;
  } else if (result.status !== 0) {
    process.exitCode = result.status ?? 1;
  }
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
NODE
then
  fail "PostgreSQL backup failed; no application changes have been made."
fi

[[ -s "${BACKUP_DIR}/database.dump" ]] || fail "PostgreSQL backup is empty; no application changes have been made."
chmod 600 "${BACKUP_DIR}/database.dump"

log "Creating a complete pre-deployment archive of ${APP_ROOT}."
tar --acls --xattrs -czpf "${BACKUP_DIR}/application.tar.gz" -C "$APP_ROOT" .
chmod 600 "${BACKUP_DIR}/application.tar.gz"
if [[ -e "$SERVICE_FILE" ]]; then
  cp -p "$SERVICE_FILE" "${BACKUP_DIR}/baaraath.service.previous"
fi

mkdir -p "${APP_ROOT}/shared"
if [[ "$ENV_SOURCE" != "$ENV_FILE" ]]; then
  cp -p "$ENV_SOURCE" "$ENV_FILE"
fi

log "Fetching origin/${BRANCH}."
git -C "$APP_ROOT" fetch --prune origin "$BRANCH"
COMMIT="$(git -C "$APP_ROOT" rev-parse --verify "origin/${BRANCH}^{commit}")"
mkdir -p "$RELEASE_DIR"
git -C "$APP_ROOT" archive "$COMMIT" | tar -xf - -C "$RELEASE_DIR"

mkdir -p "${APP_ROOT}/shared"
chmod 750 "${APP_ROOT}/shared"
if ! id "$SERVICE_USER" >/dev/null 2>&1; then
  useradd --system --home-dir "$APP_ROOT" --shell /usr/sbin/nologin "$SERVICE_USER"
fi
[[ "$(id -u "$SERVICE_USER")" -ne 0 ]] || fail "The dedicated service account $SERVICE_USER must not be root."
chown root:"$SERVICE_USER" "${APP_ROOT}/shared" "$ENV_FILE"
chmod 640 "$ENV_FILE"
ln -s "$ENV_FILE" "${RELEASE_DIR}/.env"

log "Installing dependencies and building commit ${COMMIT}."
cd "$RELEASE_DIR"
"$NPM_BIN" ci
NEXT_PUBLIC_BASE_PATH="$BASE_PATH" "$NPM_BIN" exec -- prisma generate
NEXT_PUBLIC_BASE_PATH="$BASE_PATH" "$NPM_BIN" run build

chown -R "$SERVICE_USER":"$SERVICE_USER" "$RELEASE_DIR"

SERVICE_TMP="${SERVICE_FILE}.tmp-${DEPLOY_ID}"
cat > "$SERVICE_TMP" <<UNIT
${SERVICE_MARKER}
[Unit]
Description=Baaraath Next.js application
After=network.target

[Service]
Type=simple
User=${SERVICE_USER}
Group=${SERVICE_USER}
WorkingDirectory=${CURRENT_LINK}
Environment=NODE_ENV=production
Environment=NEXT_PUBLIC_BASE_PATH=${BASE_PATH}
Environment=PORT=${PORT}
Environment=HOSTNAME=127.0.0.1
Environment=PATH=$(dirname "$NODE_BIN"):$(dirname "$NPM_BIN"):/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ExecStart=${NPM_BIN} run start -- --hostname 127.0.0.1 --port ${PORT}
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
UNIT
chmod 644 "$SERVICE_TMP"
mv -f "$SERVICE_TMP" "$SERVICE_FILE"
SERVICE_CONFIG_CHANGED=1
systemctl daemon-reload

log "Applying pending Prisma migrations. The database backup will be retained on failure."
MIGRATIONS_STARTED=1
NEXT_PUBLIC_BASE_PATH="$BASE_PATH" "$NPM_BIN" exec -- prisma migrate deploy

log "Switching the dedicated Baaraath service to the new release."
NEXT_LINK="${APP_ROOT}/.current-${DEPLOY_ID}"
ln -s "$RELEASE_DIR" "$NEXT_LINK"
mv -Tf "$NEXT_LINK" "$CURRENT_LINK"
SWITCHED_RELEASE=1

systemctl enable "$SERVICE_NAME"
systemctl restart "$SERVICE_NAME"

log "Checking the local application health endpoint."
HEALTHY=0
for ((attempt = 0; attempt < 60; attempt++)); do
  if curl --fail --silent --output /dev/null "$HEALTH_URL"; then
    HEALTHY=1
    break
  fi
  sleep 2
done
if (( ! HEALTHY )); then
  log "ERROR: The new release did not return HTTP 200 from ${HEALTH_URL}."
  on_error 1 "$LINENO"
fi

SWITCHED_RELEASE=0
MIGRATIONS_STARTED=0
trap - ERR
log "Deployment succeeded."
log "Release: ${RELEASE_DIR}"
log "Database backup: ${BACKUP_DIR}/database.dump"
log "Complete application backup: ${BACKUP_DIR}/application.tar.gz"
log "Nginx has not been changed. Use the supplied /baaraath location snippet when ready."
