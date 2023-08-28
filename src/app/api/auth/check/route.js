import { messages } from "@/utils/message";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectMongoDB } from "@/libs/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    const headersList = headers();
    const token = headersList.get("token");
    if (!token) {
      return NextResponse.json(
        { message: messages.error.notAuthorized },
        { status: 400 }
      );
    }

    try {
      const isTokenValid = jwt.verify(token, "secreto");
      const { data } = isTokenValid;

      await connectMongoDB();
      const userFind = await User.findById(data._id);
      if (!userFind) {
        return NextResponse.json(
          { message: messages.error.userNotFound },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { isAuthorized: true, message: messages.success.authorized },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        {
          message: messages.error.serverError,
        },
        {
          status: 500,
        }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        message: messages.error.serverError,
      },
      {
        status: 500,
      }
    );
  }
}
