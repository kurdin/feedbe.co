now=$(date +%F_%Hh%Mm)
tar -czvf $now-db-backup.ztar *.json* && mv $now-db-backup.ztar ./localbackups/
if [ -d "/home/db_backup/parents-night-out" ]; then
 yes | cp -rf ./localbackups/$now-db-backup.ztar /home/db_backup/parents-night-out/
fi
