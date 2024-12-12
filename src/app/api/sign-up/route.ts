import ConnectDB from "@/lib/ConnectDB";
import UserModel from "@/model/User.model";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
  await ConnectDB();

  try {
    // always use await with this
    const { username, email, password } = await request.json();

    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      return Response.json(
        { success: false, message: "Username is already taken" },
        { status: 400 }
      );
    }

    const existingUserByEmail = await UserModel.findOne({ email });

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "User already exist with this email",
          },
          { status: 400 }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);

        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 36000000);

        await existingUserByEmail.save();
      }

    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser =await new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });

      await newUser.save();
    }

    // send verification email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );
    if (!emailResponse.success) {
      Response.json(
        { success: false, message: emailResponse.message },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "User registered successfully, Please verify your email",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error registering User | ", error.message);
    } else {
      console.error("An unknown error occurred");
    }
    return Response.json(
      {
        success: false,
        message: "Error registering User",
      },
      { status: 500 }
    );
  }
}

/* 
Summary of the Flow:
- Connect to the database.
- Extract username, email, and password from the request body.
- Check if a user with the provided username or email already exists and handle accordingly (return a 400 status if a verified user with the username exists, or update an unverified user with the given email).
- Create a new user if no existing user is found.
- Send a verification email with a generated code.
- Return a success message if everything succeeds.
- Handle errors gracefully and respond with an error message if an issue occurs.

This code provides user registration functionality, including checks for existing users, password hashing, and email verification.
*/
