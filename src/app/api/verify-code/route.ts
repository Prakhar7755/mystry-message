import ConnectDB from "@/lib/ConnectDB";
import UserModel from "@/model/User.model";
// import { usernameValidation } from "@/schemas/signUpSchema";
// import { z } from "zod";

export async function POST(request: Request) {
  await ConnectDB();

  try {
    const { username, code } = await request.json();

    const decodedUsername = decodeURIComponent(username); // decodes the url

    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return Response.json(
        { success: false, message: "User NOT found" },
        { status: 500 }
      );
    }

    const isCodeValid = user.verifyCode === code;

    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();

      return Response.json(
        { success: true, message: "Account Verified" },
        { status: 200 }
      );
    } else if (!isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message: "Verification code has expired, please sign-in again",
        },
        { status: 400 }
      );
    } else {
      return Response.json(
        { success: false, message: "Incorrect Verification code" },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("Error verifying User", err);
    return Response.json(
      { success: false, message: "Error Verifying User" },
      { status: 500 }
    );
  }
}
