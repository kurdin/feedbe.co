git bundle create ./start/webcorrector-app.webpack.2016.bundle --all
echo "Sending Backup to OneDrive"
/bin/cp -rf ./start/webcorrector-app.webpack.2016.bundle /Volumes/RAID1TB/Users/kris/OneDrive/Backups/gits/
echo "Done.."
echo "Sending Backup to DropBox"
/bin/cp -rf ./start/webcorrector-app.webpack.2016.bundle /Volumes/RAID1TB/Users/kris/Dropbox/Backups/gits/
echo "Done.."
echo "Sending Backup to FreeNas"
scp ./start/webcorrector-app.webpack.2016.bundle root@192.168.1.210:/mnt/RaidZ5/Backups/Gits/
echo "Done.."
echo "Deleting local copy"
rm -rf ./start/webcorrector-app.webpack.2016.bundle
echo "All Done.."
