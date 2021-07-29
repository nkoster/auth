#!/bin/bash

while inotifywait -e close_write authServer.js
do
    scp authServer.js palermo:apps/auth
done
