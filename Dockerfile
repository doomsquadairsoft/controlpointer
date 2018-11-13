FROM node:8
ENV NODE_ENV=production
WORKDIR /app
EXPOSE 3030
COPY . ./
CMD ["npm", "run", "start"]
