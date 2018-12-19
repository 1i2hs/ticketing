const express = require("express");
const compression = require("compression");
const cors = require("cors");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const morgan = require("morgan");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(compression());
app.use(cors());

/**
 * Logging setup
 */
const winston = require("winston");
const { combine, timestamp, printf } = winston.format;

const loggingFormat = printf(info => {
  return `${info.timestamp} [${info.level}]: ${info.message}`;
});

const logger = winston.createLogger({
  format: combine(timestamp(), loggingFormat),
  transports: [new winston.transports.Console()]
});

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
  logger.add(
    new winston.transports.File({ filename: `${process.env.APP_NAME}.log` })
  );
}

/**
 * error handling
 */
app.use((err, req, res, next) => {
  logger.error("=================================================");
  logger.error("time : " + new Date().toString());
  logger.error("name : Exception");
  logger.error("-------------------------------------------------");
  logger.error(err.stack);
  logger.error("=================================================");
  res.statusCode = 500;
  res.send(err.stack);
});

process.on("uncaughtException", err => {
  logger.error("\n\n");
  logger.error("=================================================");
  logger.error("time : " + new Date().toString());
  logger.error("name : UncaughtException");
  logger.error("-------------------------------------------------");
  logger.error(err.stack);
  logger.error("=================================================\n\n");
});

app.listen(process.env.PORT, () =>
  logger.info(`${process.env.APP_NAME} listening at port ${process.env.PORT}`)
);

const QRCode = require("qrcode");

/**
 * body : {
 *   text: String,
 *   baseUri: String,
 * }
 */
app.post("/qrcode", (req, res) => {
  const text = req.body.text;
  QRCode.toString(text, { type: "svg" })
    .then(svgString => {
      res.status(200).send({
        svgString
      });
    })
    .catch(error => {
      logger.error(error.message);
      logger.error(error.stack);
      res.statusMessage = "error occured during creating QR code";
      res.sendStatus(500);
    });
});
