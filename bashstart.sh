#!/bin/bash

clear
git add . 
git commit -m 'server debug peter'
git push origin master
sudo docker-compose down
sudo docker-compose pull 
sudo docker image prune
sudo docker-compose up
 

