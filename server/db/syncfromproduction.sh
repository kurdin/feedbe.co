#!/bin/bash
echo "backup current db";
./backup.sh
echo "sync db from production";
rsync -avz -e 'ssh -p 8822' --progress root@parents-night-out.club:'/home/www/parents-night-out/db/*.json*' .