import ConnectDB from "@/lib/ConnectDB";
import UserModel, { Message } from "@/model/User.model";

export async function POST(request: Request) {
  await ConnectDB();

  const { username, content } = await request.json();

  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User NOT found",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // is user accepting messages

    if (!user.isAcceptingMessage) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User NOT ACCEPTING MESSAGES",
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const newMessage = { content, createdAt: new Date() };

    user.messages.push(newMessage as Message);
    await user.save();

    return new Response(
      JSON.stringify({
        success: true,
        message: "message sent successfully",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("error adding messages ", err);
    return new Response(
      JSON.stringify({
        success: false,
        message: "INTERNAL SERVER ERROR :: error adding messages ",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
