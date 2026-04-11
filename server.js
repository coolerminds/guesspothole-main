const { createServer: createHttpServer } = require("http");
const { createServer: createHttpsServer } = require("https");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");
const path = require("path");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";
const keyPath = process.env.SSL_KEY_PATH || path.join(__dirname, "localhost.key");
const certPath = process.env.SSL_CERT_PATH || path.join(__dirname, "localhost.crt");
const useHttps = fs.existsSync(keyPath) && fs.existsSync(certPath);

app.prepare().then(() => {
  const requestHandler = (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  };

  const server = useHttps
    ? createHttpsServer(
        {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
        },
        requestHandler
      )
    : createHttpServer(requestHandler);

  server.listen(port, host, (err) => {
    if (err) throw err;

    const protocol = useHttps ? "https" : "http";
    const displayHost = host === "0.0.0.0" ? "localhost" : host;

    if (!useHttps) {
      console.warn(
        "> HTTPS certificates not found. Starting plain HTTP; terminate TLS at your reverse proxy."
      );
    }

    console.log(`> Server started on ${protocol}://${displayHost}:${port}`);
  });
});
