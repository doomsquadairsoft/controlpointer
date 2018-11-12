FROM node:8
WORKDIR /app
COPY . ./
CMD ["node", "./src_server"]
