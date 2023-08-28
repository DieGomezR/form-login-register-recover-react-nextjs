import { NextResponse } from "next/server";
import { messages } from "@/utils/message";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import { connectMongoDB } from "@/libs/mongodb";
import bdcrypt from "bcryptjs";
import User from "@/models/User";

export async function POST(req) {
  try {
    const body = await req.json();
    const { newPassword, confirmPassword } = body;

    if (!newPassword || !confirmPassword) {
      return NextResponse.json(
        { message: messages.error.needProps },
        { status: 400 }
      );
    }

    await connectMongoDB();

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

      const userFind = await User.findById(data.userId);
      if (!userFind) {
        return NextResponse.json(
          {
            message: messages.error.userNotFound,
          },
          {
            status: 400,
          }
        );
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { message: messages.error.passwordsNotMatch },
          { status: 400 }
        );
      }

      const hashedPassword = await bdcrypt.hash(newPassword, 10);

      userFind.password = hashedPassword;

      await userFind.save();

      return NextResponse.json(
        { message: messages.success.passwordChanged },
        { status: 200 }
      );

      
    } catch (error) {
      return NextResponse.json(
        {
          message: messages.error.tokenInvalid,
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
