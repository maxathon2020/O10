#!/bin/bash

git add . 
git commit -m 'debug changes'
git push origin peterdebugserver
sudo docker-compose down
sudo docker-compose pull 
sudo docker-image prune
sudo docker-compose up 

