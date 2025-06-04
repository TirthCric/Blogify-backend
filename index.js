
import express from 'express'
import cors from 'cors'
import connectDB from './lib/connectDB.js'
import dotenv from 'dotenv'
dotenv.config()

import postRouter from './routes/post.route.js'
import userRouter from './routes/user.route.js'
import commentRouter from './routes/comment.route.js'
import webhookRouter from './routes/webhook.route.js'
import { clerkMiddleware } from '@clerk/express'

// Connect to MongoDB
connectDB();

const app = express();

app.use(cors(process.env.CORS_ORIGIN));
app.use(clerkMiddleware())
app.use('/webhooks', webhookRouter );

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", 
      "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

// routes
app.use('/users', userRouter);
app.use('/posts', postRouter);
app.use('/comments', commentRouter);


app.use((error, req, res, next) => {
    res.status(error.staus || 500)
    .json({
        message: error.message || 'Internal Server Error',
        status: error.status || 500,
        stack: error.stack || null,
    })
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});