const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))


app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

const userRoutes = require("./routes/user.routes.js");
const houseRoutes = require("./routes/house.routes.js");
const roomRouter = require("./routes/room.routes.js")
// const bookingRouter = require("./routes/booking.routes.js")

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/house", houseRoutes);
app.use("/api/v1/room", roomRouter);
// app.use('api/v1/book', bookingRouter)

module.exports = app;