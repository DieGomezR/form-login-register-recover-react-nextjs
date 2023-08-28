import { connectMongoDB } from "@/libs/mongodb";
import { Resend } from "resend";
import { messages } from "@/utils/message";
import { NextResponse } from "next/server";
import User from "@/models/User";
import jwt from "jsonwebtoken";
const resend = new Resend('re_gpaCizAb_7q3NNGTazQGsVbqGrkPVmNNi');

export async function POST(req) {
  try {
    const body = await req.json();
    const { email } = body;

    await connectMongoDB();
    const userFind = await User.findOne({ email });

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

    const tokenData = {
      email: userFind.email,
      userId: userFind._id,
    };

    const token = jwt.sign({ data: tokenData }, "secreto", {
      expiresIn: 86400,
    });

    const forgetUrl = `http://localhost:3000/forget-passowrd/?token=${token}`;
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Recuperar contraseña',
      html: `<h1>Recuperar contraseña</h1><p>Haz click en el siguiente enlace para recuperar tu contraseña.</p><a href=${forgetUrl}>Recuperar contraseña</a>`,
    });

    return NextResponse.json(
      {
        message: messages.success.emailSent,
      },
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
}
