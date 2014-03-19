#!/bin/bash

# exit on error
set -e

famous build -o focus/www/
rm focus/www/original_project
cp indexScript.html focus/www/index.html
cd focus
cordova build ios
