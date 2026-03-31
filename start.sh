cd srcs/frontend
npm install
cd ../backend
rm -rf dist
npm install
npm run build
cd../..
docker compose up -d --build