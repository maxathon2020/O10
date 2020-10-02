#!/bin/bash

git add . 
sudo docker-compose down
sudo docker-compose pull 
sudo docker-compose up -d
sudo docker-image prune 

