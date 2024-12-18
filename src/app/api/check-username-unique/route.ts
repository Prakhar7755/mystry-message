import ConnectDB from "@/lib/ConnectDB";
import UserModel from "@/model/User.model";
import { usernameValidation } from "@/schemas/signUpSchema";
import { z } from "zod";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  /* 
          // TODO: USE THIS IN  ALL OTHER ROUTES
          if (request.method !== "GET") {
            return Response.json(
              { success: false, message: "ONLY GET METHOD IS ALLOWED!" },
              { status: 405 }
            );
          } 
  */

  await ConnectDB();

  try {

    // http://localhost:3000/api/cuu?username=prakh?phone=android
    const { searchParams } = new URL(request.url);
    const queryParam = {
      username: searchParams.get("username"),
    };

    // validate with zod
    const result = UsernameQuerySchema.safeParse(queryParam);
    //TODO:remove console.log(result)

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];

      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(", ")
              : "Invalid query parameters",
        },
        { status: 400 }
      );
    }

    const { username } = result.data;

    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Username is unique",
      },
      { status: 400 }
    );
  } catch (err) {
    console.error("Error checking username", err);
    return Response.json(
      { success: false, message: "Error checking username" },
      { status: 500 }
    );
  }
}
