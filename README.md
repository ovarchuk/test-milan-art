### Guide: 

This service uses Prisma ORM for postgress DB. 

* install all dependencies using `npm install`
* run `docker-compose up` to run postgress DB in docker
* If required - please update `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mydb?schema=public"` in .env file (depends on postgress instance configuration & credentials)
* Run `npx prisma migrate deploy`. Prisma will check DB scheme and will apply all needed migrations. 
* Run `npm run start:dev` for start 
* Run `npm test` for tests