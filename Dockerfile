FROM node:8-alpine
WORKDIR /app
COPY . ./
CMD ["node", "./src_server"]
