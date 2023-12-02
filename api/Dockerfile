FROM denoland/deno:alpine-1.38.4
WORKDIR /app
COPY . .
ENV PORT=80
CMD ["run", "--allow-net", "--allow-env", "./index.ts"]