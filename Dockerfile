FROM node:8
WORKDIR /app
EXPOSE 4040
EXPOSE 3030
COPY . ./
CMD ["node", "./src_server"]
