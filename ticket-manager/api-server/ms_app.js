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

const uuidV4 = require("uuid/v4");
const axios = require("axios");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const config = require("./config.json");

if (!config.databaseURL) {
  throw new Error("no databseURL given. please check config.json file");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.databaseURL
});

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
  logger.add(
    new winston.transports.File({ filename: `${process.env.APP_NAME}.log` })
  );
  admin.database.enableLogging(true);
}

const db = admin.database();
var connectedRef = db.ref(".info/connected");
connectedRef.on("value", snapshot => {
  if (snapshot.val() === true) {
    logger.verbose("Firebase Realtime Database connected.");
  } else {
    logger.error("Firebase Realtime Database connected.");
  }
});

const ticketRef = db.ref("tickets/");
ticketRef.onDisconnect().cancel();

let tickets;
ticketRef.on(
  "value",
  snapshot => {
    logger.info('"Tickets" data updated.');
    tickets = snapshot.val() || [];
  },
  errorObject => {
    logger.error(`The read failed: ${errorObject.code}`);
  }
);

/**
 * Authorization part
 */
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
      // Authorization: Bearer g1jipjgi1ifjioj
      // Handle token presented as a Bearer token in the Authorization header
      const idToken = req.headers.authorization.split(" ")[1];
      admin
        .auth()
        .verifyIdToken(idToken)
        .then(() => {
          next();
        })
        .catch(error => {
          logger.error(error.message);
          logger.error(error.stack);
          res.sendStatus(401);
        });
    } else {
      res.statusMessage = "You must provide authorization token.";
      res.sendStatus(401);
    }
  });
}

const respondWithDisconnectedFromDBMessage = res => {
  const message = "Not connected to Firebase Realtime Database";
  logger.error(message);
  res.statusMessage = message;
  res.sendStatus(500);
};

const respondWith500ErrorMessage = res => error => {
  logger.error(error.message);
  logger.error(error.stack);
  res.statusMessage = error.message;
  res.sendStatus(500);
};

/**
 * create a ticket
 */
app.post("/tickets", (req, res) => {
  const name = req.body.username;
  const contact = req.body.userContact;

  if (!name || !contact) {
    res.statusMessage =
      'Missing "username" or "userContact" inside HTTP request body.';
    return res.sendStatus(400);
  }

  if (ticketRef) {
    const ticketPushRef = ticketRef.push();
    const ticketId = ticketPushRef.key;
    axios
      .post(`${process.env.QRCODE_GENERATOR_ADDRESS}/qrcode`, {
        stringText: `jtm://tickets/${ticketId}`
      })
      .then(response => {
        const newTicket = {
          name,
          contact,
          dateCreated: Date.now(),
          svg: response.data.svgString,
          used: false
        };

        return ticketPushRef.set(newTicket).then(() => {
          res.status(201).send({
            id: ticketId,
            ...newTicket
          });
        });
      })
      .catch(respondWith500ErrorMessage(res));
  } else {
    respondWithDisconnectedFromDBMessage(res);
  }
});

/**
 * read a ticket and tickets
 */
app.get("/tickets/:id", (req, res) => {
  const ticketId = req.params.id;
  if (tickets && tickets[ticketId]) {
    res.status(200).send({
      ticket: {
        id: ticketId,
        ...tickets[ticketId]
      }
    });
  } else {
    res.status(200).send({
      ticket: {}
    });
  }
});

app.get("/tickets", (req, res) => {
  if (tickets) {
    let ticketList = [];
    for (let ticketId in tickets) {
      ticketList.push({
        id: ticketId,
        ...tickets[ticketId]
      });
    }
    res.status(200).send({ tickets: ticketList });
  } else {
    res.status(200).send({ tickets: [] });
  }
});

/**
 * update a ticket
 */
app.put("/tickets/:id", (req, res) => {
  const ticketId = req.params.id;
  const name = req.body.username;
  const contact = req.body.userContact;
  const used = req.body.ticketUsed;

  if (!ticketId) {
    res.statusMessage = 'Missing "ticketId" inside HTTP request param.';
    return res.sendStatus(400);
  }

  if (!name || !contact) {
    res.statusMessage =
      'Missing "username" or "userContact" inside HTTP request body.';
    return res.sendStatus(400);
  }

  if (ticketRef) {
    ticketRef
      .child(ticketId)
      .update(
        used
          ? {
              name,
              contact,
              used,
              timeUsed: Date.now()
            }
          : { name, contact, used }
      )
      .then(() => {
        res.sendStatus(200);
      })
      .catch(respondWith500ErrorMessage(res));
  } else {
    respondWithDisconnectedFromDBMessage(res);
  }
});

/**
 * delete a ticket || tickets
 */
app.delete("/tickets/:id", (req, res) => {
  const ticketId = req.params.id;

  if (!ticketId) {
    res.statusMessage = 'Missing "ticketId" inside HTTP request param.';
    return res.sendStatus(400);
  }

  if (ticketRef) {
    ticketRef
      .child(ticketId)
      .set(null)
      .then(() => {
        res.sendStatus(200);
      })
      .catch(respondWith500ErrorMessage(res));
  } else {
    respondWithDisconnectedFromDBMessage(res);
  }
});

app.delete("/tickets", (req, res) => {
  const ticketIdList = req.body.ticketIdList;

  if (!ticketIdList || ticketIdList.length == 0) {
    res.statusMessage =
      'Missing or empty "ticketIdList" inside HTTP request body.';
    return res.sendStatus(400);
  }

  if (ticketRef) {
    const ticketIdCount = ticketIdList.length;
    let ticketsToBeDeleted = {};
    for (let i = 0; i < ticketIdCount; i++) {
      ticketsToBeDeleted[ticketIdList[i]] = null;
    }
    ticketRef
      .update(ticketsToBeDeleted)
      .then(() => {
        res.sendStatus(200);
      })
      .catch(respondWith500ErrorMessage(res));
  } else {
    respondWithDisconnectedFromDBMessage(res);
  }
});
