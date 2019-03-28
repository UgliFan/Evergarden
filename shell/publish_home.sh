# cd ~/Documents/GitUgliFan/Violet/
# npm run build:home:prod
# rm -rf ~/Documents/GitUgliFan/Evergarden/WEB_STATIC/home
# cp -r ~/Documents/GitUgliFan/Violet/dist/home ~/Documents/GitUgliFan/Evergarden/WEB_STATIC/home
cd /root/Violet/
git pull
npm install
npm run build:home:prod
rm -rf /root/Evergarden/WEB_STATIC/home
cp -r /root/Violet/dist/home /root/Evergarden/WEB_STATIC/home