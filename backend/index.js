const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");
const redis = require("redis");
const createClient = redis.createClient;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

dotenv.config();
const appPort = process.env.PORT || 8001;

// Redis Metadata
const redisUser = process.env.REDIS_USERNAME || "";
const redisPass = process.env.REDIS_PASSWORD || "";
const redisHost = process.env.REDIS_HOST || "";
const redisPort = process.env.REDIS_PORT || "";
const redisChannel = process.env.REDIS_CHANNEL || "";

// Mysql Metadata
const mysqlHost = process.env.MYSQL_HOST || "";
const mysqlUser = process.env.MYSQL_USERNAME || "";
const mysqlPassword = process.env.MYSQL_PASSWORD || "";
const mysqlDatabase = process.env.MYSQL_DATABASE || "";
const mysqlTable = process.env.MYSQL_TABLE || "";

// Configuration
const redisUrl = `redis://${redisUser}:${redisPass}@${redisHost}:${redisPort}`;
const mysqlConfig = {
  host: mysqlHost,
  user: mysqlUser,
  password: mysqlPassword,
  database: mysqlDatabase,
};

const redisClient = createClient({ url: redisUrl });
const setRedisCache = async (data) => {
  const value = JSON.stringify({ isCached: "yes", data: data });
  await redisClient.connect();
  await redisClient.set("key", value);
  return redisClient.disconnect();
};

const getRedisCache = async () => {
  await redisClient.connect();
  const cachedData = await redisClient.get("key");
  await redisClient.disconnect();
  return cachedData;
};

const deleteRedisCache = async () => {
  await redisClient.connect();
  await redisClient.del("key");
  return redisClient.disconnect();
};

const publishToRedis = async (data) => {
  await redisClient.connect();
  const subscriberCount = await redisClient.publish(redisChannel, data);
  await redisClient.disconnect();
  return subscriberCount;
};

const getMysqlData = async () => {
  const connection = await mysql.createConnection(mysqlConfig);
  const result = await connection.execute(`SELECT data FROM ${mysqlTable}`);
  connection.end();
  return result;
};

// api endpoints
app.get("/", (_, res) =>
  res.status(200).send("connected to the backend server!")
);

app.get("/data", async (_, res) => {
  try {
    const redisData = await getRedisCache();
    if (redisData) {
      const results = JSON.parse(redisData);
      res.status(200).json({ message: "success", ...results });
      return;
    }

    const [data, _] = await getMysqlData();
    await setRedisCache(data);
    res.status(200).json({ message: "success", isCached: "no", data });
  } catch (error) {
    res.status(500).json({ message: "failure", error });
  }
});

app.post("/create", async (req, res) => {
  const { data } = req.body;
  if (!data) throw new Error("data is required");
  try {
    await publishToRedis(data);
    await deleteRedisCache();
    res.status(200).json({ message: "success" });
  } catch (error) {
    res.status(500).json({ message: "failure", error });
  }
});

app.listen(appPort, () =>
  console.log(`application is running on port ${appPort}`)
);
