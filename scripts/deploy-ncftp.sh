#!/bin/bash

# This script can be used to deploy your website from
# the dist/ directory directly to your hosting service
# if you have an ftp account set up.
#
# ncftp or lftp?
#
# This script uses ncftp to do the transfers but I have
# found it can sometimes 'hang' when transferring
# directories. So I recommend trying the deploy-lftp.sh
# alternative script first if you can.
#
# Before use:
#   - ensure you have 'ncftp' installed
#   - customise before use as follows
#
# From the root directory of this project:
# 
#   copy scripts/ncftp.config to scripts/<yoursite>.ncftp
#   edit scripts/<yoursite>.ncftp with ftp host and account login
#
#   copy this template file to 'deploy.sh' and use that file
#   in deploy.sh, edit as follows:
#     modify the source and destination paths below
#     set NCFTP_CONFIG to the name <yoursite>.ncftp
#
#   chmod 600 scripts/* # to protect credentials
#   chmod +x scripts/*.sh
#   execute the script:
#     ./scripts/deploy.sh
#   or to build first
#     ./scripts/deploy.sh build
#
set -e  # Exit on error
set +v  # Don't echo output
SOURCE='./public'  # Directory holding production website
FTP_DIR='/'   # Upload directory on ftp account
NCFTP_CONFIG=''

yarn build
if [ "$1" = "web" -o "$1" = "" ]; then
  echo FTP upload...
  ncftpput -R -f scripts/$NCFTP_CONFIG $FTP_DIR $SOURCE/*
fi

#if [ "$1" = "safe" -o "$1" = "" ]; then
  # TODO modify the following to use the SAFE-CLI
  #
  # Deploy via SAFE Drive to an existing SAFE Network public name (website)
  # SAFE_DIR=~/SAFE/_public/dweb/root-www
  # if [ "$1" == "mock" ]; then
  #   SAFE_DIR=~/SAFE/_public/tests/data1/dweb
  #   mkdir -p $SAFE_DIR
  # fi

  # read -p "Mount SAFE Drive and press ENTER to sync..."
  # echo Syncing via SAFE Drive...
  # UPLOAD=$SOURCE-upload
  # rsync -rc --delete $SOURCE/ $UPLOAD/ && \
  # cp -ruv $UPLOAD/* $SAFE_DIR/ && \
  # rsync -ru --delete $UPLOAD/ $SAFE_DIR/
#fi
