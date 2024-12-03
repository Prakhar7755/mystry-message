import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

/* use the same connection if its available */
const connection: ConnectionObject = {};


async function ConnectDB(): Promise<void> {
  if (connection.isConnected) {
    /* use the same connection if its available */
    console.log("Already connected to database");
    return;
  }
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || "", {});
    //  console.log(db)
    connection.isConnected = db.connections[0].readyState;
    console.log("DB connected successfully");
  } catch (err) {
    console.error("Database connection failed", err);
    process.exit(1);
  }
}

export default ConnectDB;
