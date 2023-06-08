# NodeJS Redis Cache and Pub/Sub Sample Project

### Workflow:

1. Frontend App, First make http request to Redis pub/sub on Backend App.
2. Backend App publish the request.
3. Worker app act as a subscriber, while get data from publisher that store the data on MySQL Database also remove redis cache.
4. On the Get Data request, first check the redis cache. If found then return data from cache. If not found get data from MySQL database also store these data on redis cache server.

Components:

1. Frontend
2. Backend
3. Worker
4. Redis Pub/Sub and Cache
5. MySQL

```bash
git clone https://github.com/limon636/js-redis-pubsub.git
cd js-redis-pubsub
docker-compose up
```

Now visit:

http://localhost:3000/

Thanks for reading...
