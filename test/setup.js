const dotenv = require("dotenv")
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
dotenv.config({ path: envFile })

process.env.DEFAULT_BLOCK_SIZE = 10;