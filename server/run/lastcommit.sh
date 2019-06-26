# create lastcommit file
git log -n 1 --no-color --pretty=format:'%H:: %an:: %s:: %ci' --abbrev-commit > ./config/lastcommit

# create lastcommit short number for static assests
git rev-parse --short HEAD > ./config/lastcommitshort

# let out put last commit short for info
cat ./config/lastcommitshort