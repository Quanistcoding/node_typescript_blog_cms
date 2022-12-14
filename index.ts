import express from "express";
import categories from "./routes/categories"
import config from "config";
import Debug from "debug";
import morgan from "morgan";
import mysql from "mysql";
import cofigCheck from "./startup/config";
import logger from "./startup/logger";
import pageNotFound from "./middleware/pageNotFound";
import errorHandler from "./middleware/errorHandler";
import Category from "./models/category";
import users from "./routes/users";
import User from "./models/user";
import posts from "./routes/posts";
import Post from "./models/post";
import comments from "./routes/comments";
import Comment from "./models/comment";
import auth from "./routes/auth";

const debug = Debug("app:start");
process.on("uncaughtException",ex=>{
    debug(ex.message || ex);
    logger.error(ex.message || ex);
})

cofigCheck();

const app = express();

if(app.get("env") !== "production"){
    debug("morgnan enabled");
    app.use(morgan("tiny"));
}


app.use(express.json())

app.use("/api/categories",categories);
app.use("/api/users",users);
app.use("/api/posts",posts);
app.use("/api/comments",comments)
app.use("/api/auth",auth)


app.use(pageNotFound);
app.use(errorHandler);



const start = async () => {
    const con = mysql.createConnection({
        host:"localhost",
        user:"root",
        password:config.get("db_password"),
        database:config.get("db_name")
    })

    await con.connect();
    debug("Database connected...");
    
    await Category.injectDb(con);
    await User.injectDb(con);
    await Post.injectDb(con);
    await Comment.injectDb(con);


    const port = config.get("port") || 4000;
    const server = app.listen(port,()=>{debug("Server listening on port " + port)});
    return {server,con};
}

module.exports = start();


