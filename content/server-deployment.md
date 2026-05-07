# Server Deployment

Server deployment basically tumhari app ko ek Linux box pe live chalu karna hai. AWS EC2 ho ya DigitalOcean ka droplet — process same hai. Tu code likhta hai apne laptop pe, but woh production tabhi banta hai jab ek remote machine pe Node/Python/Go process 24x7 chal raha ho, NGINX uske aage proxy kar raha ho, TLS terminate ho raha ho, aur systemd usko crash hone par auto-restart kar raha ho.

Yeh module IIT-level deep dive hai. Hum teen layers cover karenge — pehle Linux fundamentals (filesystem, processes, permissions, SSH, systemd unit files), phir environment variables ka pura ecosystem (dotenv, HashiCorp Vault, AWS Secrets Manager, runtime vs build-time injection), aur finally NGINX as reverse proxy (load balancing, TLS termination, caching, rate limiting, gzip — pura `nginx.conf` walkthrough).

Interview ke perspective se, product companies (Razorpay, Swiggy, Atlassian, Stripe) yeh expect karti hain ki tu sirf `npm run start` na bole — tujhe pata ho ki kernel kaise process schedule karta hai, `EADDRINUSE` kaise debug karein, secrets ko Docker image mein bake kyun nahi karna chahiye, aur NGINX `worker_processes auto;` ka kya matlab hai. Chal shuru karte hain.

---

## 1. Server setup

### 1.1 Linux basics, SSH, systemd

#### Definition

**Linux** ek Unix-like open-source operating system hai jo production servers pe almost universally chalta hai (Ubuntu, Debian, Amazon Linux, CentOS, Alpine — sab Linux distributions hain). Iska kernel resources manage karta hai — CPU scheduling, memory pages, disk I/O, network sockets — aur user-space processes uske upar chalti hain.

**SSH (Secure Shell)** ek cryptographic network protocol hai jisse tu apne local machine se remote server pe encrypted shell session khol sakta hai. Port 22 default hai. Authentication password-based ya public-key based hota hai (production mein hamesha keys, never password).

**systemd** modern Linux distros ka init system aur service manager hai. PID 1 ke roop mein boot hota hai aur baaki sab services ko spawn, supervise, aur restart karta hai. Unit files (`.service`, `.timer`, `.socket`) declarative config hain jo bataate hain ki kaunsi process kab aur kaise start ho.

#### Why?

Production server pe teen sawaal hamesha aate hain — (1) Mera code kahan rahega aur kaun execute karega? (2) Main usse remotely securely access kaise karunga? (3) Agar process crash ho gayi to phir se kaun start karega aur logs kahan jayenge? Linux + SSH + systemd in teeno ka answer hai.

Linux filesystem hierarchy (`/etc`, `/var`, `/usr`, `/home`, `/opt`) tujhe sikhati hai ki configs kahan rakhna hai, logs kahan rotate hote hain, binaries kahan install hote hain. Permissions (`rwx`, owner/group/other, `chmod`, `chown`) tujhe security boundary deti hain — `node` user ko `/etc/shadow` read nahi karne dena chahiye. Processes ka concept (PID, parent, fork/exec, signals like SIGTERM/SIGKILL) tujhe debugging ki power deta hai.

SSH keys password se infinite times safer hain. Brute-force attacks Internet pe constantly chal rahe hain port 22 pe — ek decent password 24 hours mein crack ho sakta hai, but ek 4096-bit RSA ya Ed25519 key practically uncrackable hai. SSH agent tujhe har baar passphrase type nahi karne deta. `~/.ssh/config` tujhe `ssh prod-web1` jaisi shortcuts deta hai.

systemd ke bina tu kya karega — `node server.js &` chala ke logout? Process terminate ho jayegi. `nohup` use kare to logs `nohup.out` mein dump honge, rotate nahi honge, aur crash hone pe restart nahi hoga. systemd in saari problems ko solve karta hai declaratively.

#### How?

**Linux filesystem aur basic commands:**

```bash
# Filesystem hierarchy samajh — yeh standard FHS hai
ls -la /                # root filesystem dekh
# /etc      -> config files (nginx.conf, systemd units, etc)
# /var/log  -> logs (syslog, nginx, app logs)
# /usr/bin  -> system binaries (node, python, etc)
# /opt      -> third-party software
# /home     -> user home directories
# /tmp      -> temporary files (ephemeral)
# /proc     -> kernel virtual filesystem (process info)

# File permissions samajh
ls -la /etc/passwd
# -rw-r--r-- 1 root root 2891 Apr 30 10:00 /etc/passwd
# pehla char: file type (- file, d dir, l symlink)
# next 9: rwxrwxrwx -> owner/group/other ke liye read/write/execute
# owner: root, group: root

# Permissions change kar
chmod 600 ~/.ssh/id_ed25519     # owner read+write only (SSH keys ke liye must)
chmod 755 deploy.sh              # owner rwx, others rx
chown -R appuser:appgroup /opt/myapp   # ownership change

# Numeric permissions: r=4, w=2, x=1
# 755 = rwx (7) + rx (5) + rx (5)
# 644 = rw  (6) + r  (4) + r  (4)
# 600 = rw  (6) + -  (0) + -  (0)
```

**Process management:**

```bash
# Running processes dekh
ps aux | grep node              # node process dhundh
# USER  PID  %CPU %MEM   VSZ    RSS  TTY  STAT  START  TIME  COMMAND

# Real-time process monitor
top                              # ya htop (better UX)
# CPU/memory usage live dikhta hai

# Specific process kill kar
kill -15 12345                   # SIGTERM bhej (graceful)
kill -9  12345                   # SIGKILL (forceful, last resort)
# Hamesha pehle SIGTERM try kar — process ko cleanup karne ka chance mil

# Process tree dekh
pstree -p

# File descriptors check kar (aksar production mein leak hote hain)
ls -la /proc/12345/fd | wc -l    # PID 12345 ke open FDs count

# System resources
free -h                          # memory usage human-readable
df -h                            # disk usage
iostat -x 2                      # disk I/O stats every 2 sec
vmstat 2                         # virtual memory stats
```

**SSH key generation aur setup:**

```bash
# Local machine pe — Ed25519 generate kar (RSA se behtar, faster, smaller)
ssh-keygen -t ed25519 -C "ratnesh@prod-deploy-key" -f ~/.ssh/prod_ed25519
# passphrase de — yeh key file ko encrypt karega disk pe

# Public key remote server pe copy kar
ssh-copy-id -i ~/.ssh/prod_ed25519.pub ubuntu@52.66.123.45
# ya manually:
cat ~/.ssh/prod_ed25519.pub | ssh ubuntu@52.66.123.45 \
    'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys'

# SSH agent start kar (passphrase ek baar diye, fir cache)
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/prod_ed25519

# ~/.ssh/config — yeh game-changer hai
cat > ~/.ssh/config <<'EOF'
Host prod-web1
    HostName 52.66.123.45
    User ubuntu
    IdentityFile ~/.ssh/prod_ed25519
    Port 22
    ServerAliveInterval 60
    ForwardAgent no            # production mein agent forwarding off rakh

Host prod-db
    HostName 10.0.1.50         # private IP
    User ubuntu
    IdentityFile ~/.ssh/prod_ed25519
    ProxyJump prod-web1        # bastion ke through jump
EOF
chmod 600 ~/.ssh/config

# Ab simply:
ssh prod-web1                   # easy connect
ssh prod-db                     # bastion ke through automatic
```

**Server-side hardening (`/etc/ssh/sshd_config`):**

```bash
# /etc/ssh/sshd_config — production must-haves
sudo vim /etc/ssh/sshd_config

# In settings ko ensure kar:
PermitRootLogin no              # root login band — sudo use kar
PasswordAuthentication no       # sirf keys, password se login nahi
PubkeyAuthentication yes        # public key allow
Port 2222                        # default 22 se change kar (security through obscurity, but reduces noise)
MaxAuthTries 3                   # 3 failed attempts ke baad disconnect
ClientAliveInterval 300          # idle clients ko 5 min mein check
AllowUsers ubuntu deploy         # sirf yeh users login kar sakte hain

# Apply kar
sudo systemctl reload sshd
```

**systemd unit file — production-grade Node.js app:**

```ini
# /etc/systemd/system/myapp.service
# Yeh systemd unit file Node.js Express app ko manage karegi

[Unit]
Description=MyApp Node.js Production Server
Documentation=https://docs.myapp.com
After=network.target           # network ready hone ke baad start kar
Wants=network-online.target

[Service]
Type=simple                    # process foreground mein chalti hai (Node default)
User=appuser                   # security: non-root user ke under chala
Group=appgroup
WorkingDirectory=/opt/myapp
Environment="NODE_ENV=production"
Environment="PORT=3000"
EnvironmentFile=/etc/myapp/env # secrets file (chmod 600, root:appuser)

# Main command — node binary ka full path use kar
ExecStart=/usr/bin/node /opt/myapp/dist/server.js

# Reload signal — graceful reload ke liye
ExecReload=/bin/kill -HUP $MAINPID

# Restart policy — yeh production mein critical hai
Restart=always                 # crash hone pe always restart
RestartSec=5                   # 5 sec wait kar restart se pehle
StartLimitInterval=60          # 60 sec window mein
StartLimitBurst=3              # max 3 restarts (prevents crash loop)

# Resource limits — prevent runaway process
LimitNOFILE=65536              # max open file descriptors
LimitNPROC=4096                # max processes
MemoryMax=2G                   # 2GB se zyada use kare to OOM kill

# Security hardening
NoNewPrivileges=true           # process kabhi privileges escalate nahi kar sakti
PrivateTmp=true                # apna /tmp namespace
ProtectSystem=strict           # /usr, /boot read-only
ProtectHome=true               # /home invisible
ReadWritePaths=/var/log/myapp /opt/myapp/uploads  # sirf yeh writable
CapabilityBoundingSet=         # saari Linux capabilities drop

# Logging — systemd journald mein automatic log capture
StandardOutput=journal
StandardError=journal
SyslogIdentifier=myapp

[Install]
WantedBy=multi-user.target     # boot pe enable
```

**Service manage karna:**

```bash
# Unit file likhne ke baad reload kar systemd ko
sudo systemctl daemon-reload

# Service start kar
sudo systemctl start myapp

# Boot pe auto-start enable kar
sudo systemctl enable myapp

# Status check kar — yeh tera primary debug tool hai
sudo systemctl status myapp
# Active: active (running) since Tue 2026-04-30 10:23:45 IST; 5min ago
# Main PID: 14523 (node)
# Memory: 145.2M
# CPU: 2.341s

# Restart kar
sudo systemctl restart myapp

# Logs dekh — journalctl is your friend
sudo journalctl -u myapp                  # saare logs
sudo journalctl -u myapp -f               # follow (tail -f jaisa)
sudo journalctl -u myapp -n 100           # last 100 lines
sudo journalctl -u myapp --since "10 minutes ago"
sudo journalctl -u myapp -p err           # sirf errors
sudo journalctl -u myapp --since today --until "1 hour ago"

# Output JSON mein — programmatic parsing ke liye
sudo journalctl -u myapp -o json-pretty
```

#### Real-life Example

Mera last project tha — Indian fintech startup, B2B lending platform, ~50k requests/min peak. Stack: Node.js (NestJS), Postgres, Redis. Production environment AWS EC2 pe — 4x `c5.xlarge` instances behind ALB.

**Setup process tha:**

1. **Base AMI**: Ubuntu 22.04 LTS — Packer ke through bake kiya custom AMI jismein Node 20 LTS, monitoring agents (Datadog), aur baseline security policies (auditd, fail2ban) pre-installed the.

2. **User isolation**: Deployment ke liye dedicated `deploy` user banaya, app runtime ke liye `appuser` (no shell, `nologin`). Code `/opt/lendapp/` mein clone hota tha by `deploy` user, but `appuser` ka ownership tha runtime files pe.

3. **SSH access**: Sirf bastion host (`bastion.lendapp.internal`) se SSH possible tha. Production EC2s ka security group sirf bastion ke private IP se port 22 allow karta tha. Har engineer ke apne Ed25519 keys the (rotate every 90 days). My `~/.ssh/config`:
   ```
   Host bastion
       HostName bastion.lendapp.internal
       User ratnesh
   Host prod-web*
       User deploy
       ProxyJump bastion
   ```

4. **systemd unit**: Upar wala template directly use kiya. Plus, ek `myapp-healthcheck.timer` banaya jo every 30 sec health endpoint ping karta tha aur Datadog ko metric bhejta tha.

5. **Log aggregation**: `journald` se logs CloudWatch Logs Agent through forward hote the, retention 30 days. Production mein `journalctl` se direct debug karna critical tha — ek baar 3 AM ko Postgres connection pool exhaust hua tha, `journalctl -u lendapp -p err --since "10 minutes ago"` se issue 5 min mein isolate kar liya.

6. **Crash safety**: `Restart=always` + `StartLimitBurst=3` ne ek incident bachaya tha — ek bad deploy ne app ko boot ke 200ms baad crash karaya, systemd ne 3 retries ke baad rukke alert fire kiya, hum revert kar liye. Without `StartLimitBurst`, woh infinite crash loop ho jata aur logs disk fill kar dete.

#### Diagram

```mermaid
flowchart TB
    subgraph Local["Engineer Laptop"]
        L1[ssh-agent]
        L2[~/.ssh/config]
        L3[Ed25519 private key]
    end

    subgraph Bastion["Bastion Host (Public Subnet)"]
        B1[sshd :22]
        B2[authorized_keys]
    end

    subgraph Prod["Production EC2 (Private Subnet)"]
        P1[sshd :22]
        P2[systemd PID 1]
        P3[myapp.service]
        P4[Node.js process]
        P5[journald]
        P6[/var/log/journal/]
    end

    L1 -->|SSH key auth| B1
    L2 -->|ProxyJump| B1
    B1 -->|Forward connection| P1
    P1 -->|Spawn shell| P2
    P2 -->|systemctl start| P3
    P3 -->|ExecStart=node| P4
    P4 -->|stdout/stderr| P5
    P5 -->|persist| P6
    P6 -->|journalctl -u myapp| Local
```

#### Interview Q&A

**Q1: SIGTERM aur SIGKILL mein kya difference hai? Production mein kab kaunsa use karna chahiye?**

SIGTERM (signal 15) ek "polite request" hai jo process ko bolti hai ki cleanup karke exit kar — connections close kar, in-flight requests complete kar, file handles flush kar. Process iss signal ko catch kar sakti hai aur custom shutdown logic chala sakti hai (Node mein `process.on('SIGTERM', ...)`)

SIGKILL (signal 9) kernel-level forceful termination hai — process ko notify nahi kiya jaata, kernel directly memory free kar deta hai aur PID reclaim. Process iss signal ko catch nahi kar sakti. Result mein open connections leak ho sakti hain, in-flight DB transactions partial commit ho sakti hain, aur disk pe corrupt files reh sakti hain.

Production mein hamesha SIGTERM pehle. systemd `systemctl stop` SIGTERM bhejta hai pehle, fir `TimeoutStopSec` (default 90 sec) wait karta hai, fir SIGKILL. Tu apni unit file mein `KillSignal=SIGTERM` aur `TimeoutStopSec=30` set kar sakta hai based on your app's graceful shutdown time. SIGKILL sirf tab use kar jab process truly stuck ho — usually kernel-level deadlock ya runaway memory.

Real example — humare ek microservice ne 60 sec graceful shutdown ke baad bhi exit nahi kiya (open WebSocket connections the). Hum `TimeoutStopSec=120` kar diye, aur app code mein WebSocket force-close logic add kiya jab SIGTERM aaye.

**Q2: SSH key authentication public-key cryptography pe kaise kaam karta hai? Yeh password se safer kyun hai?**

SSH key auth asymmetric cryptography (RSA, Ed25519) pe based hai. Tu ek key-pair generate karta hai — ek private key (tere paas, encrypted with passphrase) aur ek public key (server pe `~/.ssh/authorized_keys` mein). Login process — server ek random nonce generate karta hai, tera client uss nonce ko apni private key se sign karta hai aur server ko bhejta hai. Server tere public key se signature verify karta hai. Agar match ho to authentication successful, varna reject.

Yeh password se infinitely safer hai do reasons se — pehla, private key network pe kabhi nahi jati, sirf signature jaati hai jo replay-proof hai (har baar new nonce). Doosra, key entropy bahut zyada hai — Ed25519 256-bit hai, RSA-4096 ka equivalent strength. Ek 12-character password ke against brute force attack practical hai, but 256-bit key ke against bilkul nahi.

Plus, server-side `PasswordAuthentication no` set karke tu pure brute-force attack vector eliminate kar deta hai. fail2ban ki bhi zarurat kam ho jaati hai. Production mein Ed25519 prefer kar — RSA se faster, smaller (68 char vs 800), aur quantum-resistant nahi hai but classical security bahut strong hai.

Ek subtle point — passphrase-protected private key ka matlab hai key file disk pe encrypted hai. Agar tera laptop chori ho, attacker ko passphrase bhi crack karna padega. ssh-agent passphrase memory mein cache karta hai for session lifetime, isliye repeatedly type nahi karna padta. ForwardAgent option carefully use kar — agent forwarding through bastion convenient hai but bastion compromised hua to saari downstream servers compromised.

**Q3: systemd `Type=simple`, `Type=forking`, `Type=notify`, `Type=oneshot` — kab kaunsa use karein?**

`Type=simple` (default) — ExecStart wali process foreground mein chalti hai aur systemd usse hi main PID samajhta hai. Modern apps (Node, Python with `python app.py`, Go binaries) yeh use karte hain. Drawback — systemd assume karta hai service "ready" hai jaise hi process spawn ho gayi, but actually app abhi initialize ho rahi hogi (DB connect, cache warm-up). Dependencies ke liye yeh galat ready signal de sakta hai.

`Type=forking` — traditional Unix daemons jaise Apache, classic init scripts. Process fork karti hai aur parent exit ho jaati hai, child background mein chalti rehti hai. systemd `PIDFile=` option se child ka PID track karta hai. Modern apps mein avoid kar — forking model debugging difficult banata hai aur container-friendly nahi hai.

`Type=notify` — best option for production-grade services. Process `sd_notify(READY=1)` system call karke explicitly bolti hai "main ready hoon". systemd dependencies ko tab tak hold karta hai. Node mein `sd-notify` npm package use kar sakta hai. Iska benefit — `systemctl start myapp` tabhi return karega jab app actually traffic accept karne ke liye ready ho. Health checks aur rolling deploys ke liye must.

`Type=oneshot` — short-lived tasks ke liye, jaise migrations, cleanup scripts. Process run hoti hai, exit ho jaati hai, aur systemd usse "successful" maan leta hai. `RemainAfterExit=yes` set kare to systemd state mein "active" dikhayega exit ke baad bhi (useful for declarative state — "yeh task ho gaya hai"). Cron-like scheduling ke liye `Type=oneshot` + `.timer` unit combine karte hain.

Real example — humne lending app ke liye `Type=notify` use kiya. App startup mein 8-10 sec lagti thi (Postgres connection pool warm-up, Redis cluster connect, JWT key load from KMS). `Type=simple` se rolling deploy mein traffic uss instance ko jaata pehle ki app ready ho — 503 errors. `Type=notify` se ALB health check correctly behave kiya.

---

## 2. Environment variables

### 2.1 dotenv, vault, runtime vs build-time injection

#### Definition

**Environment variables** OS-level key-value pairs hain jo running process ke environment mein inject hote hain. Process unhe `process.env.X` (Node), `os.environ['X']` (Python), `os.Getenv("X")` (Go) se read karti hai. Yeh process-local hain — child processes inherit karti hain parent ka environment.

**dotenv** ek convention hai jismein development/local environment ke liye `.env` file project root mein rakhi jaati hai aur runtime mein library (jaise `dotenv` npm package) usse `process.env` mein load karti hai.

**HashiCorp Vault** ek secrets management tool hai jo secrets ko encrypted store karta hai, fine-grained access control deta hai, aur dynamic secrets generate kar sakta hai (jaise on-the-fly Postgres credentials with TTL).

**AWS Secrets Manager** AWS ka managed equivalent hai — secrets KMS-encrypted store hote hain, IAM-based access, automatic rotation Lambda functions ke through.

**Runtime injection** matlab secrets process start hone ke time pe inject hote hain (env vars ya API call se fetch). **Build-time injection** matlab secrets compile ya build step pe code/bundle mein bake ho jaate hain. Yeh distinction frontend (React/Next.js) mein critical hai.

#### Why?

Twelve-Factor App methodology bolti hai — config code se separate hona chahiye. Same code Docker image dev, staging, production teeno mein chalna chahiye, sirf env vars different. Hardcoded secrets in code is the cardinal sin — Git history mein chala jaata hai, force-push se bhi remove karna bahut painful hai (BFG Repo-Cleaner ya `git filter-branch`), aur attacker ko credential rotation karna padta hai sab jagah.

dotenv local development ke liye perfect hai — har developer ka apna `.env` file (gitignored), shared template `.env.example` (committed). Production mein dotenv use karna bad practice hai — secrets disk pe plaintext mein, multiple processes share karte hain agar same file read karein, file permissions galat ho to leak.

Vault aur Secrets Manager production-grade reasons solve karte hain — (1) audit trail (kaun ne kab secret access kiya), (2) automatic rotation (DB password 30 days mein rotate ho), (3) dynamic secrets (per-process unique credentials with TTL), (4) fine-grained policies (lendapp-prod role sirf prod-db secrets read kar sakti hai), (5) revocation (compromised secret turant invalidate). Manual rotation 200 microservices mein practically impossible hai.

Runtime vs build-time critical hai for security. Frontend bundlers (Webpack, Vite, Next.js) build time pe `process.env.NEXT_PUBLIC_API_KEY` ko literally bundle mein replace karte hain. Yeh JavaScript public hai — client browser ko ship hoti hai. Agar tune `process.env.STRIPE_SECRET_KEY` ko frontend code mein use kiya, woh build mein bake ho gayi, aur har user ke browser mein readable hai. Backend-only secrets ko hamesha runtime pe inject kar (server-side only).

#### How?

**Local dev with dotenv (Node.js):**

```bash
# .env.example — yeh git mein commit kar (template)
cat > .env.example <<'EOF'
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://user:pass@localhost:5432/myapp
REDIS_URL=redis://localhost:6379
JWT_SECRET=replace-me-with-strong-random-string
STRIPE_SECRET_KEY=sk_test_xxx
EOF

# .env — yeh actual values, gitignored
cat > .env <<'EOF'
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://ratnesh:devpass@localhost:5432/lendapp_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=devsecret-not-for-prod-12345xyz
STRIPE_SECRET_KEY=sk_test_51HabcXYZ...
EOF

# .gitignore mein add kar — yeh CRITICAL hai
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore
```

```javascript
// app.js — dotenv load kar entrypoint pe
require('dotenv').config();   // .env file ko process.env mein load
// ya ESM mein:
// import 'dotenv/config';

// Validation must hai — early fail karo agar critical env missing
const requiredEnvs = ['DATABASE_URL', 'JWT_SECRET', 'STRIPE_SECRET_KEY'];
for (const env of requiredEnvs) {
    if (!process.env[env]) {
        console.error(`Missing required env var: ${env}`);
        process.exit(1);
    }
}

// Use kar
const port = parseInt(process.env.PORT || '3000', 10);
const dbUrl = process.env.DATABASE_URL;
```

**Better — use `zod` ya `envalid` for type-safe env validation:**

```javascript
// config.js — type-safe env validation
const { cleanEnv, str, port, url } = require('envalid');

const env = cleanEnv(process.env, {
    NODE_ENV: str({ choices: ['development', 'staging', 'production'] }),
    PORT: port({ default: 3000 }),
    DATABASE_URL: url(),
    JWT_SECRET: str({ devDefault: 'devsecret' }),
    STRIPE_SECRET_KEY: str(),
});

module.exports = env;
// Ab strongly-typed config milta hai, missing/invalid env app crash kar dega start pe
```

**HashiCorp Vault setup aur usage:**

```bash
# Vault server install (production mein HA cluster + Consul backend)
# Dev mode ke liye:
vault server -dev -dev-root-token-id="root"

# Authenticate
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='root'

# KV secrets engine enable kar (v2 with versioning)
vault secrets enable -path=secret kv-v2

# Secret store kar
vault kv put secret/lendapp/prod \
    database_url="postgres://prod_user:supersecret@prod-db:5432/lendapp" \
    jwt_secret="prod-jwt-key-xyz789" \
    stripe_secret_key="sk_live_realProductionKey"

# Read kar
vault kv get secret/lendapp/prod
vault kv get -format=json secret/lendapp/prod | jq '.data.data'

# Policy banao — least-privilege access
cat > lendapp-prod-policy.hcl <<'EOF'
# lendapp-prod role sirf prod secrets read kar sakti hai, write nahi
path "secret/data/lendapp/prod" {
    capabilities = ["read"]
}
path "secret/metadata/lendapp/prod" {
    capabilities = ["read", "list"]
}
EOF
vault policy write lendapp-prod lendapp-prod-policy.hcl

# AppRole authentication enable kar (machine-to-machine)
vault auth enable approle
vault write auth/approle/role/lendapp-prod \
    token_policies="lendapp-prod" \
    token_ttl=1h \
    token_max_ttl=4h

# Role ID aur Secret ID generate kar — yeh app ko denge
vault read auth/approle/role/lendapp-prod/role-id
vault write -f auth/approle/role/lendapp-prod/secret-id
```

**Node.js mein Vault se secrets fetch karna at startup:**

```javascript
// vault-loader.js
const vault = require('node-vault')({
    apiVersion: 'v1',
    endpoint: process.env.VAULT_ADDR,    // env se sirf address aur role ids
});

async function loadSecrets() {
    // AppRole auth — Role ID + Secret ID se token milega
    const auth = await vault.approleLogin({
        role_id: process.env.VAULT_ROLE_ID,
        secret_id: process.env.VAULT_SECRET_ID,
    });
    vault.token = auth.auth.client_token;

    // Secrets fetch kar
    const result = await vault.read('secret/data/lendapp/prod');
    const secrets = result.data.data;

    // process.env mein inject kar
    process.env.DATABASE_URL = secrets.database_url;
    process.env.JWT_SECRET = secrets.jwt_secret;
    process.env.STRIPE_SECRET_KEY = secrets.stripe_secret_key;

    console.log('Secrets loaded from Vault');
}

// Bootstrap mein use kar
(async () => {
    await loadSecrets();
    // Ab app start kar
    require('./server.js');
})();
```

**AWS Secrets Manager (alternative — AWS-native):**

```bash
# AWS CLI se secret create kar
aws secretsmanager create-secret \
    --name lendapp/prod/database \
    --description "Production DB credentials" \
    --secret-string '{"username":"prod_user","password":"supersecret","host":"prod-db.xyz.rds.amazonaws.com","port":5432,"dbname":"lendapp"}' \
    --region ap-south-1

# Rotation enable kar (Lambda function rotate karega every 30 days)
aws secretsmanager rotate-secret \
    --secret-id lendapp/prod/database \
    --rotation-lambda-arn arn:aws:lambda:ap-south-1:123:function:SecretsManagerRotation \
    --rotation-rules AutomaticallyAfterDays=30
```

```javascript
// AWS SDK v3 se fetch
const { SecretsManagerClient, GetSecretValueCommand } =
    require('@aws-sdk/client-secrets-manager');

const client = new SecretsManagerClient({ region: 'ap-south-1' });

async function getSecret(secretName) {
    const cmd = new GetSecretValueCommand({ SecretId: secretName });
    const data = await client.send(cmd);
    return JSON.parse(data.SecretString);
}

// EC2 instance role IAM policy se authenticate hota hai automatic
// No explicit credentials needed — instance metadata service deti hai
const dbCreds = await getSecret('lendapp/prod/database');
process.env.DATABASE_URL =
    `postgres://${dbCreds.username}:${dbCreds.password}@${dbCreds.host}:${dbCreds.port}/${dbCreds.dbname}`;
```

**systemd ke through env injection:**

```ini
# /etc/systemd/system/myapp.service mein
[Service]
# Direct env var
Environment="NODE_ENV=production"
Environment="PORT=3000"

# File se load kar (chmod 600, root:appuser)
EnvironmentFile=/etc/myapp/env

# Multiple files chain kar sakta hai
EnvironmentFile=/etc/myapp/base.env
EnvironmentFile=-/etc/myapp/local.env   # - prefix matlab optional
```

```bash
# /etc/myapp/env — production secrets file
sudo tee /etc/myapp/env <<'EOF'
DATABASE_URL=postgres://prod_user:realpass@prod-db:5432/lendapp
JWT_SECRET=actual-prod-jwt-key
STRIPE_SECRET_KEY=sk_live_realKey
EOF

# Permissions set kar — yeh CRITICAL hai
sudo chown root:appuser /etc/myapp/env
sudo chmod 640 /etc/myapp/env             # appuser read kar sakta hai, others nahi
```

**Build-time vs runtime — Next.js example:**

```bash
# .env.production
# Yeh build-time pe bake hoti hain (NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_API_BASE_URL=https://api.lendapp.com    # public OK
NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIza...                  # public OK

# Yeh runtime-only (server-side rendering ke time)
DATABASE_URL=postgres://...                          # NEVER public
STRIPE_SECRET_KEY=sk_live_...                        # NEVER public
SESSION_SECRET=...                                   # NEVER public
```

```javascript
// pages/api/checkout.js — server-side, OK
export default async function handler(req, res) {
    // Yeh runtime pe read hota hai, bundle mein nahi jaata
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    // ...
}

// components/Map.js — client-side, danger zone
export default function Map() {
    // NEXT_PUBLIC_ prefix matlab build mein literally inline ho jaayega
    // Yeh OK hai kyunki Google Maps API key public hai with referer restrictions
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

    // SECRET_KEY use kiya yahan to woh bundle mein expose ho jaayegi!
    // const secret = process.env.STRIPE_SECRET_KEY; // BUG: undefined in browser
}
```

#### Real-life Example

Lendapp pe humara environment management evolve hua tha three phases mein:

**Phase 1 (early days, MVP)**: Sab kuch `.env` files mein. Production EC2 pe SSH karke manually `.env` create karte the. Problem — naye engineer ke liye onboarding pain (Slack pe credentials share, no audit), aur ek baar stripe key rotate karna pada to 5 microservices pe manually update karna pada.

**Phase 2 (scaling, ~30 services)**: AWS Secrets Manager adopt kiya. Har microservice ka apna secret namespace (`lendapp/prod/payments`, `lendapp/prod/loans`, etc). EC2 instance roles ke through IAM policies — `payments-service-role` sirf `lendapp/prod/payments/*` read kar sakti thi. Bootstrap script secrets fetch karta tha aur env vars mein inject karta tha. Audit trail CloudTrail mein, automatic rotation Lambda ke through enable kiya for DB credentials.

**Phase 3 (current, multi-region)**: HashiCorp Vault adopt kiya for advanced features. Dynamic database credentials — har service request kar Vault se aur ek 1-hour TTL Postgres credential paati. Yeh huge security win — agar credential leak ho to TTL ke baad automatically invalid. Plus, transit encryption engine se field-level encryption (Aadhaar numbers, PAN) — application code Vault se encrypt/decrypt request karta hai, plaintext kabhi disk pe nahi.

Specific config — production pods (Kubernetes) Vault Agent sidecar use karte the. Sidecar Vault se secrets fetch karta tha aur tmpfs (in-memory volume) mein write karta tha as `.env` file. Application sidecar uss file ko `dotenv` se load karti. TTL expire hone se pehle sidecar refresh kar deta tha. Application restart ki zarurat nahi.

Frontend (Next.js consumer app) ka strict separation tha — `NEXT_PUBLIC_*` prefix wale env vars hi build mein bake hote the (analytics ID, public API URL, public maps key). Saare backend secrets server-side API routes mein `process.env` se direct read hote the at runtime, never exposed to client bundle. CI mein eslint rule tha jo `process.env.*` ko `useEffect` ya client component mein use karne pe error throw karta tha.

#### Diagram

```mermaid
flowchart LR
    subgraph Dev["Development"]
        D1[.env file]
        D2[dotenv package]
        D1 -->|load on startup| D2
        D2 -->|inject| D3[process.env]
    end

    subgraph Prod["Production"]
        V1[HashiCorp Vault]
        V2[AWS Secrets Manager]
        S1[Vault Agent Sidecar]
        S2[App Bootstrap]
        S3[systemd EnvironmentFile]
        V1 -->|AppRole auth| S1
        V2 -->|IAM role| S2
        S1 -->|tmpfs| S3
        S2 -->|inject| P1[process.env]
        S3 -->|inject| P1
    end

    subgraph Build["Frontend Build"]
        B1[Next.js build]
        B2[NEXT_PUBLIC_* vars]
        B3[Client bundle]
        B4[Backend secrets]
        B5[Server runtime]
        B2 -->|baked in| B1 --> B3
        B4 -.->|NEVER bundled| B3
        B4 -->|runtime only| B5
    end
```

#### Interview Q&A

**Q1: `.env` file ko production server pe rakhna kab acceptable hai aur kab nahi?**

Acceptable hai for low-stakes scenarios — small startups with single server, internal tools, dev/staging environments. systemd `EnvironmentFile=/etc/myapp/env` with `chmod 600` and proper ownership ek decent baseline hai. File root-owned, app user ko sirf read access, encrypted disk (LUKS) pe — yeh threat model mein "physical disk theft" aur "lateral movement on host" se reasonable protection deta hai.

Acceptable nahi hai for — multi-server deployments (rotate karna 50 servers pe manual painful), regulated industries (PCI-DSS, HIPAA, RBI compliance audit trail demand karta hai), services with rotation requirements (DB credentials hourly rotate ho), aur teams with churn (departing engineer ne agar production access kabhi kiya tha to all secrets compromised). In cases mein Vault ya cloud secrets manager mandatory hai.

Critical anti-pattern — `.env` ko Docker image mein `COPY .env /app/.env` se include karna. Image registries (ECR, DockerHub) often shared hain, layer cache mein secret persist ho jaata hai, aur `docker history` se anyone with image access secrets pull kar sakta hai. Hamesha runtime injection use kar — `docker run --env-file=...` ya orchestrator (Kubernetes secrets, ECS task definitions) ke through.

Real interview signal — agar candidate bole "production mein .env use karte hain" without nuance, woh red flag hai. Ideal answer — context-dependent, baseline acceptable with proper file permissions, but Vault/Secrets Manager preferred for scale, compliance, ya rotation requirements.

**Q2: Build-time vs runtime injection — frontend application mein yeh distinction kyun matter karta hai?**

Frontend bundlers (Webpack, Vite, Next.js, Create React App) build phase pe source code transform karte hain. Jab tu likhta hai `process.env.API_KEY` aur build chalata hai, bundler literally string replacement karta hai — `process.env.API_KEY` ko `"actual-key-value"` se replace kar deta hai final JavaScript bundle mein. Yeh JavaScript file CDN pe upload hoti hai aur har user ke browser mein download hoti hai. View Source ya DevTools Network tab se anyone read kar sakta hai.

Iska matlab — koi bhi backend secret (DB password, Stripe secret key, AWS credentials, JWT signing secret) frontend code mein use karna means woh public hai. Maine real-world breach dekhi hai jahan startup ne `process.env.STRIPE_SECRET_KEY` ko React component mein accidentally use kar diya — 6 hours mein attacker ne $50k ka fraud charge kiya before key rotate hui.

Solution — strict separation. Next.js mein `NEXT_PUBLIC_` prefix convention hai — sirf yeh env vars build mein bake hote hain (publishable Stripe key, Google Maps API with referer restrictions, public analytics IDs OK hain). Backend-only secrets `process.env.X` ke through API routes (server-side functions) mein hi use ho. Server runtime pe yeh `process.env` directly read hoti hain Node process se, bundle mein nahi jaati.

CI mein guardrails lagana smart hai — eslint rule `no-process-env` with allowlist for public vars. Build artifact scanner (`grep` for known patterns like `sk_live_`, `AKIA*`) jo bundle mein secrets detect kare aur build fail kar de. Trufflehog ya gitleaks ko CI pipeline mein integrate kar.

**Q3: HashiCorp Vault ke "dynamic secrets" feature kya hain aur yeh static secrets se kaise behtar hain?**

Static secrets traditional model hai — ek fixed credential (DB password) Vault mein store karte ho, applications usse fetch karti hain, aur woh credential database pe valid rehta hai jab tak tu manually rotate na kare. Risks — agar credential leak ho (memory dump, log file, stolen backup), woh long-lived hai aur attacker indefinitely use kar sakta hai. Rotation manual aur disruptive — coordinate karna padta hai sab consumers ke saath.

Dynamic secrets revolutionary hain — Vault on-demand credentials generate karta hai with short TTL. Example — `vault read database/creds/lendapp-readonly` execute kare to Vault Postgres ko `CREATE USER tmp_xyz123 WITH PASSWORD '...' VALID UNTIL '2026-04-30 11:30:00'` execute karta hai aur tujhe woh credentials return karta hai. Application uss credential se 1 hour use karti hai, fir Vault automatically `DROP USER` kar deta hai. Next request pe new credential.

Benefits massive hain — (1) Blast radius minimal — leaked credential 1 hour mein invalid, (2) Per-process credentials — agar payments-service-pod-3 ka credential leak ho to sirf woh affected, (3) Audit trail crystal clear — Vault logs mein har credential issuance recorded, (4) No rotation pain — automatic. Database, AWS IAM, RabbitMQ, MongoDB, Consul — Vault inn sab ke liye dynamic secrets engines provide karta hai.

Production setup mein humne `database/creds/lendapp-readwrite` (1 hour TTL) aur `database/creds/lendapp-admin` (5 min TTL, breakglass only) define kiye the. Postgres pe Vault ka admin role tha jo `CREATE USER` permissions rakhta tha. Application Vault Agent sidecar ke through credentials lease karti aur expiration se 10 min pehle renew karti. Initial setup complex tha but operational benefits huge — incident response mein "saari credentials rotate karo" 30 sec ka command hai (`vault lease revoke -prefix database/creds/`), na ki 4-hour outage with 200-engineer coordination.

---

## 3. Reverse proxy (NGINX)

### 3.1 Load balancing, TLS termination, caching, rate limiting, gzip — full nginx.conf walkthrough

#### Definition

**Reverse proxy** ek server hai jo client requests accept karta hai, unhe backend servers (origins) pe forward karta hai, aur backend ka response client ko return karta hai. Client ko lagta hai woh ek single server se baat kar raha hai, but actual mein requests multiple backend instances pe distribute ho rahi hain. Forward proxy iska opposite hai (client ke behalf pe outbound traffic proxy karta hai, jaise corporate proxy).

**NGINX** ek high-performance web server aur reverse proxy hai jo event-driven, asynchronous architecture pe based hai. Single worker process thousands of concurrent connections handle kar sakta hai (C10k problem ka solution). Production internet ka backbone hai — Cloudflare, Netflix, Airbnb, Dropbox sab NGINX (ya iska fork) use karte hain.

**Load balancing** — incoming requests ko multiple backend servers pe distribute karna using algorithms (round-robin, least connections, IP hash, weighted).

**TLS termination** — HTTPS encryption proxy pe khulta hai, backend ko HTTP plain mein forward (internal network mein, secure VPC). CPU-intensive cryptographic work proxy pe centralized hota hai.

**Caching** — frequently-requested responses ko proxy pe store karna (memory ya disk) taaki same request dubara aaye to backend hit na ho.

**Rate limiting** — per-client request rate ko cap karna, abuse aur DDoS prevent karna.

**Gzip** — response body ko compress karna before sending (bandwidth save, faster page loads).

#### Why?

Bare-metal backend pe directly internet expose karna multiple problems create karta hai. Single server hai to single point of failure — restart hua to outage. Multiple servers hain to client ko kaise pata kis pe connect kare? DNS round-robin unreliable hai (TTL caching, no health awareness). TLS certificates har backend pe deploy karna painful hai. Static files (images, CSS) backend Node process se serve karna wasteful — Node sync I/O slow hai, NGINX disk se directly serve kar sakta hai 10x faster.

Reverse proxy yeh sab solve karta hai. Single NGINX instance (ya ek HA pair behind ELB) public-facing hota hai, behind woh 100 backend instances ho sakte hain. NGINX health checks karta hai, dead backends ko traffic nahi bhejta, retries handle karta hai. TLS sirf NGINX pe configured, single certificate file (Let's Encrypt auto-renew). Backend HTTP-only — simple, faster.

Caching massive performance unlock hai. Imagine `/api/products/list` endpoint hits database, takes 300ms. NGINX `proxy_cache` configure kare to first request DB hit karega, subsequent requests (within TTL) NGINX se hi serve hongi in 1ms. Backend load 99% drop kar sakta hai for cacheable endpoints.

Rate limiting production sanity ke liye must hai. Bots scrape karte hain, mobile app bug ho jaaye to retry storm aati hai, ek malicious user 10k req/sec maar sakta hai. `limit_req_zone` se per-IP rate cap lagaya jaa sakta hai. Real example — humare lending app pe ek bug ki wajah se mobile app loop mein OTP request karne lagi, NGINX rate limit ne 429 throw kiye, backend bach gaya.

Gzip simple compression hai but huge impact. JSON responses 80% smaller ho jaate hain (text data redundant patterns rakhta hai), HTML/CSS/JS 70%+ compress hote hain. Indian users with slower 3G/4G connections ke liye yeh page load time mein 500ms-2s improvement deta hai. Brotli (gzip ka modern alternative) aur better hai (20-30% extra compression) but nginx mein module install karna padta hai.

#### How?

**NGINX install karna (Ubuntu):**

```bash
# Latest stable NGINX (default Ubuntu repos pe purana hota hai)
sudo apt update
sudo apt install -y curl gnupg2 ca-certificates lsb-release

# Official nginx repo add kar
curl https://nginx.org/keys/nginx_signing.key | \
    sudo gpg --dearmor -o /usr/share/keyrings/nginx-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] \
    http://nginx.org/packages/ubuntu $(lsb_release -cs) nginx" | \
    sudo tee /etc/apt/sources.list.d/nginx.list

sudo apt update
sudo apt install -y nginx

# Service enable kar
sudo systemctl enable nginx
sudo systemctl start nginx

# Test config syntax — yeh deploy se pehle hamesha kar
sudo nginx -t

# Reload config without downtime
sudo systemctl reload nginx
# ya
sudo nginx -s reload
```

**Full production `nginx.conf` walkthrough:**

```nginx
# /etc/nginx/nginx.conf — main config file

# user — NGINX worker processes konse user ke under chalein
# nginx user pre-create hota hai apt package se
user nginx;

# worker_processes — kitne worker processes spawn kare
# auto matlab CPU cores ke equal — production mein default best
worker_processes auto;

# Worker processes ko specific CPU cores pe pin kar — cache locality benefit
worker_cpu_affinity auto;

# Process limits
worker_rlimit_nofile 65535;     # max open files per worker (high traffic ke liye must)

# PID file location
pid /var/run/nginx.pid;

# Error log — yeh tera primary debug source hai
error_log /var/log/nginx/error.log warn;

# Events block — connection handling
events {
    # Per worker max connections — total = worker_processes * worker_connections
    worker_connections 4096;

    # Linux pe epoll best — efficient I/O multiplexing
    use epoll;

    # Multi-accept — ek event mein multiple connections accept kar
    multi_accept on;
}

# HTTP block — main config
http {
    # MIME types include kar (Content-Type headers ke liye)
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging format — production mein detailed format use kar
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time uct="$upstream_connect_time" '
                    'uht="$upstream_header_time" urt="$upstream_response_time"';
    # rt = total request time, urt = upstream (backend) response time
    # In dono ka difference NGINX overhead batata hai

    access_log /var/log/nginx/access.log main buffer=32k flush=5s;

    # Performance optimizations
    sendfile on;                    # kernel-level file send (zero-copy)
    tcp_nopush on;                  # full packets bhejne ka attempt
    tcp_nodelay on;                 # low-latency mode (Nagle algorithm off)

    # Connection keepalive — TCP handshake bachata hai
    keepalive_timeout 65;
    keepalive_requests 1000;        # ek connection pe max 1000 requests

    # Client request limits
    client_max_body_size 10M;       # max upload size (10MB)
    client_body_timeout 30s;
    client_header_timeout 30s;
    client_body_buffer_size 128k;

    # Hash table sizes — large server names ke liye
    server_names_hash_bucket_size 128;
    types_hash_max_size 2048;

    # Hide NGINX version (security — attackers ko version-specific exploits avoid)
    server_tokens off;

    ##################
    # GZIP COMPRESSION
    ##################
    gzip on;
    gzip_vary on;                   # Vary: Accept-Encoding header bheje
    gzip_proxied any;               # proxied requests bhi compress
    gzip_comp_level 6;              # 1-9, 6 best balance (CPU vs compression)
    gzip_min_length 1024;           # 1KB se chhote files mat compress (overhead)
    gzip_buffers 16 8k;
    gzip_http_version 1.1;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml
        font/woff
        font/woff2;
    # Note: image/jpeg, image/png compress mat kar — already compressed hain

    ##################
    # RATE LIMITING
    ##################
    # Zone definition — IP-based rate limit
    # 10m memory ~160k unique IPs track kar sakta hai
    # rate=10r/s matlab 10 requests per second per IP
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;
    # login endpoint ke liye stricter — 5 per minute

    # Connection limit — per IP max simultaneous connections
    limit_conn_zone $binary_remote_addr zone=conn_limit:10m;

    # Status code rate limit ke liye
    limit_req_status 429;
    limit_conn_status 429;

    ##################
    # CACHING
    ##################
    # Cache zone — disk-based cache
    # keys_zone=app_cache:100m matlab 100MB metadata zone (~800k cached items)
    # max_size=10g matlab 10GB max disk usage
    # inactive=60m matlab 60 min mein agar access nahi hua to evict
    proxy_cache_path /var/cache/nginx/app_cache
                     levels=1:2
                     keys_zone=app_cache:100m
                     max_size=10g
                     inactive=60m
                     use_temp_path=off;

    # Cache key define kar (default scheme + method + host + uri)
    proxy_cache_key "$scheme$request_method$host$request_uri";

    # Stale content serve kar agar backend down ho — graceful degradation
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
    proxy_cache_lock on;            # cache miss pe sirf ek request backend hit kare (thundering herd prevent)
    proxy_cache_revalidate on;      # If-Modified-Since support

    ##################
    # UPSTREAM (Backend pool)
    ##################
    upstream backend_app {
        # Load balancing algorithm
        # least_conn — kam connections wala server pe bheje (default round_robin)
        least_conn;

        # Backend servers
        server 10.0.1.10:3000 max_fails=3 fail_timeout=30s weight=1;
        server 10.0.1.11:3000 max_fails=3 fail_timeout=30s weight=1;
        server 10.0.1.12:3000 max_fails=3 fail_timeout=30s weight=1;
        server 10.0.1.13:3000 max_fails=3 fail_timeout=30s weight=1 backup;
        # backup server tabhi use ho jab primary saare down

        # Keepalive connections to backend — TCP handshake save
        keepalive 32;
        keepalive_requests 1000;
        keepalive_timeout 60s;
    }

    ##################
    # HTTP -> HTTPS REDIRECT
    ##################
    server {
        listen 80;
        listen [::]:80;
        server_name lendapp.com www.lendapp.com;

        # Let's Encrypt ACME challenge ke liye yeh path serve kar
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        # Baaki sab HTTPS pe redirect
        location / {
            return 301 https://$host$request_uri;
        }
    }

    ##################
    # MAIN HTTPS SERVER
    ##################
    server {
        listen 443 ssl http2;
        listen [::]:443 ssl http2;
        server_name lendapp.com www.lendapp.com;

        # TLS certificates (Let's Encrypt se)
        ssl_certificate /etc/letsencrypt/live/lendapp.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/lendapp.com/privkey.pem;

        # TLS configuration — modern config (Mozilla intermediate)
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305';
        ssl_prefer_server_ciphers off;
        ssl_session_timeout 1d;
        ssl_session_cache shared:SSL:50m;
        ssl_session_tickets off;

        # OCSP stapling — certificate validation faster
        ssl_stapling on;
        ssl_stapling_verify on;
        resolver 1.1.1.1 8.8.8.8 valid=300s;
        resolver_timeout 5s;

        # Security headers
        add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
        add_header X-Frame-Options DENY always;
        add_header X-Content-Type-Options nosniff always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'" always;

        # Connection limit per IP (DDoS prevention)
        limit_conn conn_limit 50;

        # Logs
        access_log /var/log/nginx/lendapp.access.log main;
        error_log /var/log/nginx/lendapp.error.log warn;

        ##################
        # STATIC ASSETS
        ##################
        location /static/ {
            alias /var/www/lendapp/static/;
            # Aggressive caching — assets are versioned (e.g. app.abc123.js)
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }

        # Specific file types ke liye long-term cache
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff2)$ {
            expires 30d;
            add_header Cache-Control "public, no-transform";
            access_log off;
        }

        ##################
        # API endpoints
        ##################
        location /api/ {
            # Rate limiting — burst=20 matlab 20 requests tak burst allowed
            # nodelay matlab burst requests instantly process ho, queue nahi
            limit_req zone=api_limit burst=20 nodelay;

            # Proxy headers — backend ko real client info de
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Request-ID $request_id;

            # HTTP/1.1 + keepalive backend ke saath
            proxy_http_version 1.1;
            proxy_set_header Connection "";

            # Timeouts
            proxy_connect_timeout 5s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;

            # Buffering — large responses memory mein buffer kar
            proxy_buffering on;
            proxy_buffer_size 4k;
            proxy_buffers 8 4k;
            proxy_busy_buffers_size 8k;

            # Forward to upstream
            proxy_pass http://backend_app;
        }

        ##################
        # Cacheable GET endpoint
        ##################
        location /api/products {
            limit_req zone=api_limit burst=20 nodelay;

            # Cache configuration
            proxy_cache app_cache;
            proxy_cache_valid 200 5m;        # 200 responses 5 min cache
            proxy_cache_valid 404 1m;         # 404 1 min cache (avoid backend hammer)
            proxy_cache_valid any 30s;
            proxy_cache_methods GET HEAD;     # only GET/HEAD cache
            proxy_cache_bypass $http_pragma $http_authorization;
            # Authenticated requests cache mat kar

            # Cache status header (debugging ke liye)
            add_header X-Cache-Status $upstream_cache_status;
            # HIT, MISS, BYPASS, EXPIRED, STALE — kaunsa hua dikhayega

            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_pass http://backend_app;
        }

        ##################
        # LOGIN — strict rate limit
        ##################
        location /api/auth/login {
            # 5 requests per minute, burst 2
            limit_req zone=login_limit burst=2 nodelay;

            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_pass http://backend_app;
        }

        ##################
        # WEBSOCKET endpoint
        ##################
        location /ws/ {
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;

            # WebSocket upgrade headers
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";

            # Long timeouts for persistent connections
            proxy_read_timeout 3600s;
            proxy_send_timeout 3600s;

            proxy_pass http://backend_app;
        }

        ##################
        # HEALTH CHECK
        ##################
        location /health {
            access_log off;             # health checks log mat kar (noise)
            return 200 "OK\n";
            add_header Content-Type text/plain;
        }

        ##################
        # SPA fallback (React/Vue)
        ##################
        location / {
            root /var/www/lendapp/dist;
            try_files $uri $uri/ /index.html;
        }

        # Hide hidden files
        location ~ /\. {
            deny all;
            access_log off;
            log_not_found off;
        }
    }
}
```

**Let's Encrypt TLS setup with certbot:**

```bash
# certbot install kar
sudo apt install -y certbot python3-certbot-nginx

# Cert generate kar (interactive)
sudo certbot --nginx -d lendapp.com -d www.lendapp.com

# Auto-renew test kar
sudo certbot renew --dry-run

# systemd timer auto-renew handle karta hai
sudo systemctl status certbot.timer
```

**NGINX debugging tools:**

```bash
# Config syntax check
sudo nginx -t

# Detailed config dump
sudo nginx -T | less

# Live access log monitor
sudo tail -f /var/log/nginx/access.log

# Real-time stats (ngx_status module needed)
curl http://localhost/nginx_status
# Active connections: 234
# server accepts handled requests
#  150234 150234 982341
# Reading: 5 Writing: 12 Waiting: 217

# Specific upstream debug
sudo tail -f /var/log/nginx/error.log | grep upstream

# Cache HIT rate dekh
awk '{print $NF}' /var/log/nginx/access.log | sort | uniq -c
# X-Cache-Status header se HIT/MISS count

# Reload without downtime
sudo nginx -s reload
# Old workers existing connections complete karte hain, naye config naye connections ke liye
```

#### Real-life Example

Lendapp pe humara NGINX layer architecture-defining hai. Setup tha — AWS ALB sirf TLS termination aur AZ failover ke liye, peeche ek NGINX cluster (3 instances, Auto Scaling Group), aur uske peeche application servers (20+ Node.js instances).

**Why two layers** — ALB easy aur managed hai, but advanced caching aur rate limiting ALB pe limited hai. NGINX layer humein full control deta tha — request routing rules, response transformation, cache invalidation logic, custom rate limit zones per endpoint type.

**Specific configurations** —

1. **Static assets**: React app ka build (~5MB JS bundle, 2MB CSS, fonts, images) S3 pe upload hota tha aur CloudFront se serve hota tha. NGINX layer sirf API traffic handle karta tha. CloudFront edge locations India mein 5+ locations pe hain — Bangalore se request Bangalore edge se serve hoti, 5ms latency.

2. **API rate limiting**: Different endpoints ke liye different zones —
   - `/api/loan/apply` — 1 req/min per IP (loan applications spam-prone)
   - `/api/auth/login` — 5 req/min per IP
   - `/api/loan/status/*` — 30 req/min per IP (legitimate polling)
   - General `/api/` — 100 req/min per IP

3. **Caching strategy**: `/api/loan/products`, `/api/lenders/list` jaise read-heavy endpoints 5 min cache. Cache key mein query params include kiye but `Authorization` header bypass set tha (authenticated user-specific data cache nahi). `X-Cache-Status` header se debugging — Postman se HIT/MISS verify karte the.

4. **Backend health checks**: NGINX `max_fails=3 fail_timeout=30s` — agar backend 30 sec mein 3 failures de to woh out of rotation. Plus we ran `nginx_upstream_check_module` (third-party) jo active health checks karta tha — har 5 sec backends ka `/health` ping.

5. **Real incident — Black Friday 2025**: Marketing ne SMS campaign 1 lakh users ko bheji bina warning. App bombarded — 50x normal traffic in 5 min. NGINX rate limits ne backend ko save kar liya — 429 returns the for excess requests, but legitimate users (within rate limit) ko full service. Backend Node servers normal load pe rahe. Without NGINX layer, backend crash ho jaata aur 100% downtime hota.

6. **TLS performance**: TLS 1.3 + session resumption + OCSP stapling se handshake median 80ms se 25ms aaya. Critical for India where mobile users 4G pe high RTT face karte hain.

7. **gzip impact**: API JSON responses average 30KB, gzip ke baad 4KB — 87% reduction. Mobile users ke liye yeh page load 800ms se 150ms aaya 3G pe.

#### Diagram

```mermaid
flowchart TB
    Client[Mobile/Web Client]
    DNS[Route 53 DNS]
    ALB[AWS ALB - TLS termination, AZ failover]

    subgraph NginxLayer["NGINX Reverse Proxy Cluster"]
        N1[NGINX-1]
        N2[NGINX-2]
        N3[NGINX-3]
    end

    subgraph Cache["NGINX Local Disk Cache"]
        C1[/var/cache/nginx/app_cache/]
    end

    subgraph Backend["Backend App Pool"]
        B1[Node app:3000]
        B2[Node app:3000]
        B3[Node app:3000]
        B4[Node app:3000 backup]
    end

    DB[(Postgres + Redis)]

    Client --> DNS
    DNS --> ALB
    ALB --> N1
    ALB --> N2
    ALB --> N3
    N1 -->|cache HIT| Cache
    N2 -->|cache HIT| Cache
    N1 -->|cache MISS / no-cache| Backend
    N2 -->|cache MISS / no-cache| Backend
    N3 -->|cache MISS / no-cache| Backend
    N1 -.->|rate limit 429| Client
    Backend --> DB
    Cache -->|stored response| Client
```

#### Interview Q&A

**Q1: NGINX worker_processes auto kya karta hai aur yeh thread-based servers (Apache) se kaise different hai?**

`worker_processes auto` NGINX ko bolti hai ki number of CPU cores ke equal worker processes spawn kare. Har worker single-threaded process hai jo event loop chala raha hai (Linux pe `epoll`, FreeBSD pe `kqueue`). Ek worker process thousands of concurrent connections handle kar sakta hai because connections async hain — koi connection slow read kar raha hai to worker uss connection ko block nahi karta, queue mein daal deta hai aur dusri ready connections process karta hai.

Apache (default mpm_prefork) thread-per-connection ya process-per-connection model use karta tha — 1000 concurrent connections matlab 1000 threads/processes. Memory overhead massive (~5MB per thread), context switching CPU eat kar deta tha. C10k problem (10,000 concurrent connections) Apache ke liye unsolvable tha, NGINX ke liye trivial.

NGINX architecture matlab — agar tu 4-core server pe `worker_processes auto` set kare, 4 worker processes spawn honge. Each handling ~10k connections comfortably. Total ~40k concurrent. Apache pe same kaam ke liye 40k threads spawn karne padte — 200GB+ RAM chahiye sirf threads ke liye. Yeh scalability gap hi reason hai NGINX dominant ban gaya.

Subtle point — NGINX worker single-threaded hai aur CPU-bound work (TLS handshakes, gzip compression) worker ko block kar sakta hai. Production tuning mein hum worker_processes auto + `worker_cpu_affinity auto` set karte hain taaki workers specific cores pe pinned ho. CPU cache locality benefit milta hai. SSL hardware acceleration (AES-NI) bhi modern Intel CPUs auto-use karte hain.

**Q2: `proxy_cache_lock on` aur `proxy_cache_use_stale` features kya solve karte hain? Real production mein impact kya hai?**

`proxy_cache_lock on` thundering herd problem solve karta hai. Imagine `/api/products` endpoint cached hai with 5 min TTL. Cache expire hone ke moment 1000 simultaneous requests aa jaaye — without locking, NGINX 1000 requests backend ko forward karega ek saath (sab cache MISS dekhenge). Backend simultaneously 1000 same DB queries fire karega — DB CPU spike, possibly crash.

Lock enabled hone se NGINX intelligent banta hai — first request backend ko jaati hai aur lock acquire kar leti hai. Other 999 requests lock wait karte hain (with `proxy_cache_lock_timeout`, default 5s). First request response milte hi cache update hota hai aur lock release. Baaki 999 requests cache se serve hote hain. Backend ne 1000 ki jagah 1 query handle ki — 99.9% load reduction at exactly the worst moment.

`proxy_cache_use_stale` graceful degradation provides karta hai. Configure kare to bole — agar backend down hai (`error timeout http_500`) ya cache update ho raha hai (`updating`), to expired (stale) cached content serve kar do. User ko thoda purana data milta hai but service available rehti hai. Ye uptime ka huge win hai — backend deploy ke 30-second window mein bhi users ko 503 nahi dikhta.

Real production impact — humare `/api/lenders/list` endpoint pe one day hum found that DB connection pool exhaust ho gaya tha bug ki wajah se. Backend 60 sec ke liye unable to respond. NGINX `proxy_cache_use_stale` enabled tha to users ko slightly stale list dikhi (5 min purani), but service up. Without yeh feature, 60 sec total outage hota. Status page incident-free reha. Combined with `proxy_cache_lock on`, woh 60 sec mein backend pe sirf single request gaya (jo 60 sec timeout pe fail hua), not 50,000.

**Q3: TLS termination NGINX pe karna vs end-to-end TLS — trade-offs kya hain? Production mein kab kya use karein?**

TLS termination at proxy means client-NGINX HTTPS hai, NGINX-backend HTTP plain. Benefits — (1) Single certificate management — Let's Encrypt sirf NGINX pe, backends pe nothing, (2) CPU cost centralized — TLS handshakes expensive hain, NGINX dedicated resource use karta hai (with AES-NI hardware acceleration), backends untouched, (3) Layer-7 inspection — NGINX request body, headers see kar sakta hai for caching, rate limiting, WAF rules. Encrypted traffic visible nahi hota inspection ko, (4) Simpler debugging — backend pe `tcpdump` kare to plaintext request body dikhega.

End-to-end TLS (NGINX bhi backend ke saath HTTPS use kare) compliance ke liye chahiye hota hai — PCI-DSS, HIPAA, RBI guidelines bolti hain ki sensitive data network pe kabhi plaintext nahi flow karna chahiye, even within VPC. AWS VPC private subnet "secure" hai but defense-in-depth principle bolta hai — encrypt everywhere. Backends pe khud certificates manage karne padenge (mutual TLS bhi often, jisme client cert verify ho).

Practical decision matrix — agar tu AWS VPC mein hai aur regulated industry mein nahi, TLS termination at NGINX standard hai. Internal traffic VPC private subnet mein hai, security groups strict hain — risk acceptable. Agar fintech/healthcare/insurance hai aur compliance audit face karna hai, end-to-end TLS mandatory. Service mesh (Istio, Linkerd) automated mTLS deta hai with sidecar proxies — yeh modern Kubernetes setups mein common pattern hai.

Real lendapp setup — humare paas hybrid tha. Client ↔ NGINX TLS 1.3, NGINX ↔ Backend pe TLS 1.2 (mTLS with internal CA-signed certs). Performance overhead measured tha — latency increase ~3ms per request, CPU 8% higher on backends. RBI audit ne yeh setup approve kiya. Cost-benefit positive tha given regulatory environment. For pure-play tech startups without compliance burden, NGINX-terminated TLS sufficient hai.

---

## Resources & further reading

- **Linux & systemd**:
  - "How Linux Works" by Brian Ward (3rd edition) — kernel se userspace tak deep dive
  - `man systemd.unit`, `man systemd.service`, `man systemd.exec` — official docs always authoritative
  - Lennart Poettering's blog (systemd lead developer) — design rationale
  - Brendan Gregg's "Systems Performance" (2nd edition) — Linux performance tools

- **SSH**:
  - "SSH Mastery" by Michael W Lucas — practical bible
  - OpenSSH documentation: https://www.openssh.com/manual.html
  - Mozilla OpenSSH Guidelines: https://infosec.mozilla.org/guidelines/openssh

- **Environment & Secrets**:
  - The Twelve-Factor App: https://12factor.net/config
  - HashiCorp Vault docs: https://developer.hashicorp.com/vault/docs
  - "Vault Up & Running" by Yevgeniy Brikman
  - AWS Secrets Manager User Guide
  - OWASP Secrets Management Cheat Sheet

- **NGINX**:
  - "NGINX Cookbook" by Derek DeJonghe (O'Reilly)
  - Official docs: https://nginx.org/en/docs/
  - Mozilla SSL Configuration Generator: https://ssl-config.mozilla.org/
  - "High Performance Browser Networking" by Ilya Grigorik (free online)
  - NGINX Plus blog — even community version readers benefit

- **General deployment**:
  - "Site Reliability Engineering" by Google (free online)
  - "The Site Reliability Workbook"
  - Julia Evans' zines (wizard zines) — Linux/networking debugging
  - Cindy Sridharan's writings on observability
