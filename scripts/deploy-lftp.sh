#!/bin/bash

# This script can be used to deploy your website from
# the dist/ directory directly to your hosting service
# if you have an ftp account set up.
#
# lftp or ncftp?
#
# This script supercedes deploy-ncftp.sh which I found
# to be unreliable, but may work for you if you can't
# use lftp for any reason.
# 
# Before use:
#   - ensure you have 'lftp' installed
#   - customise before use as follows
#
# From the root directory of this project:
#   copy this template file to 'deploy.sh' and use that file
#   in deploy.sh, edit 'Custom settings' below
#   chmod 600 scripts/* # to protect credentials
#   chmod +x scripts/*.sh
#
# Usage:
#   execute the script from the root of the repo:
#     ./scripts/deploy.sh
#
#   or to build first
#     ./scripts/deploy.sh build

set -e  # Exit on error
set +v  # Don't echo output

# Custom settings
USER='' # FTP username on $HOST
PASS='' # Password
HOST='' # ftp host must start 'ftp://'
SOURCE='./public'  # Local directory to upload
FTP_DIR='/'   # Upload directory for $USER on $HOST

SAFE_DEST=''  # SAFE URI destination (must exist)

if [ "$1" = "build" ]; then
  yarn build
  shift 1
fi

if [ "$1" = "web" -o "$1" = "" ]; then
  echo FTP upload...
  lftp -e "set ftp:ssl-allow no; mirror -e -R $SOURCE $FTP_DIR ; quit" -u $USER,$PASS $HOST
fi

if [ "$1" = "safe" -o "$1" = "" ]; then
  echo Assuming you are logged in to SAFE. Beginning updload...
  safe files sync -r -d -u $SOURCE $SAFE_DEST
fi
