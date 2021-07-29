## Install

```
cd apps
git clone https://github.com/nkoster/auth
cd auth
npm i
```

Create a unit file:

```
mkdir -p ~/.config/systemd/user
cat > ~/.config/systemd/user/authService.service << UNIT
[Unit]
Description=Auth Server
Documentation=https://github.com/nkoster/auth

[Service]
Type=simple
RemainAfterExit=no
WorkingDirectory=/home/niels/apps/auth
ExecStart=/home/niels/.nvm/versions/node/v14.8.0/bin/node /home/niels/apps/auth/authServer.js

[Install]
WantedBy=default.target
UNIT
```

Configure systemd and start service:

```
systemctl --user enable authService
systemctl --user start authService
```

**ci.sh** does the systemctl stop and start for you, after a change in authServer.js:

```
#!/bin/bash

while inotifywait -e close_write authServer.js
do
    scp authServer.js palermo:apps/auth
    ssh palermo 'systemctl --user stop auth_w3b_net.service'
    ssh palermo 'systemctl --user start auth_w3b_net.service'
done
```

## .env

Create a **.env** file with your keys:

```
ACCESS_TOKEN_SECRET=secretz
REFRESH_TOKEN_SECRET=moresecretz
```
