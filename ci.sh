#!/bin/bash

while inotifywait -e close_write authServer.js
do
    scp authServer.js palermo:apps/auth
    ssh palermo 'systemctl --user stop auth_w3b_net.service'
    ssh palermo 'systemctl --user start auth_w3b_net.service'
done
