const dotenv = require("dotenv");
const mysql = require("mysql2/promise");
const redis = require("redis");
const createClient = redis.createClient;

dotenv.config();

// Redis Metadata
const redisUser = process.env.REDIS_USERNAME || "";
const redisPass = process.env.REDIS_PASSWORD || "";
const redisHost = process.env.REDIS_HOST || "";
const redisPort = process.env.REDIS_PORT || "";
const redisChannel = process.env.REDIS_CHANNEL || "";

// MySQL Metadata
const mysqlHost = process.env.MYSQL_HOST || "";
const mysqlUser = process.env.MYSQL_USERNAME || "";
const mysqlPassword = process.env.MYSQL_PASSWORD || "";
const mysqlDatabase = process.env.MYSQL_DATABASE || "";
const mysqlTable = process.env.MYSQL_TABLE || "";

// Configurations for REDIS AND MYSQL
const redisPath = `redis://${redisUser}:${redisPass}@${redisHost}:${redisPort}`;
const mysqlConfig = {
  host: mysqlHost,
  user: mysqlUser,
  password: mysqlPassword,
  database: mysqlDatabase,
};

// Insert to mysql DB
const insert = async (data) => {
  const connection = await mysql.createConnection(mysqlConfig);
  connection.execute(`INSERT INTO ${mysqlTable} (data) VALUES ('${data}')`);
  connection.end();
  return true;
};

const sub = () => {
  const subscriber = createClient({ url: redisPath });
  subscriber.connect();

  subscriber.on("error", (err) => console.log("Subscriber error", err));
  subscriber.on("connect", () =>
    console.log("\n Connected to the Subscriber \n")
  );
  subscriber.on("reconnecting", () => {
    console.log("\nReconnecting to Subscriber.\n");
  });

  subscriber.on("ready", () => {
    console.log("Subscriber is ready");
    subscriber.subscribe(redisChannel, async (msg) => {
      console.log(" --> subscriber message : ", msg);
      try {
        await insert(msg);
      } catch (error) {
        console.log({ error });
      }
    });
  });
};

sub();
