rsync -avlz --delete --partial --stats --progress -e "ssh -p 8822" root@5.9.145.34:/home/sites/vhosts/dncarch.com/ production_backup/
