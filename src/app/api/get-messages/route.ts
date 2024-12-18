import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import ConnectDB from "@/lib/ConnectDB";
import UserModel from "@/model/User.model";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET(request: Request) {
  await ConnectDB();

  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Not authenticated",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  const user: User = session.user as User;

  const userId = new mongoose.Types.ObjectId(user._id);
  try {
    const user = await UserModel.aggregate([
      { $match: { id: userId } },
      { $unwind: "$messages" },

      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]);

    if (!user || user.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User NOT found",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        message: user[0].messages,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("an unexpected error occured: ", err);
    return new Response(
      JSON.stringify({
        success: false,
        message: "an unexpected error occured: ",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
