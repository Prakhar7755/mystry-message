import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import ConnectDB from "@/lib/ConnectDB";
import UserModel from "@/model/User.model";
import { User } from "next-auth";

export async function POST(request: Request) {
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
  const userId = user._id;
  const { acceptMessages } = await request.json();

  // Validate the acceptMessages field
  if (typeof acceptMessages !== "boolean") {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Invalid input for acceptMessages",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessage: acceptMessages },
      { new: true }
    );

    if (!updatedUser) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to update message acceptance settings",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Message acceptance status updated successfully",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Failed to update user status to accept messages", err);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to update user status to accept messages",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

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
  const userId = user._id;

  try {
    const foundUser = await UserModel.findById(userId);

    if (!foundUser) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User NOT found",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        isAcceptingMessages: foundUser.isAcceptingMessage,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in getting message acceptance status", err);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error in getting message acceptance status",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
