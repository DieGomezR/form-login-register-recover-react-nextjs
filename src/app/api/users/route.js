import { connectMongoDB } from "@/libs/mongodb";
import User from "@/models/User";
import { messages } from "@/utils/message";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectMongoDB();
    const users = await User.find();
    return NextResponse.json({ users }, { status: 200 });
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
