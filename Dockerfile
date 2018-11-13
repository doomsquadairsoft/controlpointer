FROM node:8
ENV NODE_ENV=production
WORKDIR /app
EXPOSE 4040
EXPOSE 3030
COPY . ./
CMD ["node", "./src_server"]
