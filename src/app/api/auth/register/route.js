import { connectMongoDB } from "@/libs/mongodb";
import { isValidEmail } from "@/utils/isValidEmail";
import { messages } from "@/utils/message";
import { NextResponse } from "next/server";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await connectMongoDB();
    const body = await req.json();
    const { email, password, confirmPassword } = body;
    //Validar todos los campos
    if (!email || !password || !confirmPassword) {
      return NextResponse.json(
        {
          message: messages.error.needProps,
        },
        {
          status: 400,
        }
      );
    }
    //Validar email
    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          message: messages.error.email,
        },
        {
          status: 400,
        }
      );
    }
    //Validar contraseñas
    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          message: messages.error.passwordsNotMatch,
        },
        {
          status: 400,
        }
      );
    }

    const userFind = await User.findOne({ email });

    if (userFind) {
      return NextResponse.json(
        {
          message: messages.error.userExists,
        },
        {
          status: 400,
        }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
    });

    const { password: userPass, ...rest } = newUser._doc;
    await newUser.save()
    console.log(newUser);

    
    const token = jwt.sign({ data: rest }, "secreto", { expiresIn: 86400 });

    const response = NextResponse.json(
      {
        newUser: rest,
        
        message: messages.success.userCreated,
      },
      {
        status: 200,
      }
    );


    response.cookies.set("auth_cookies", token, {
      secure: process.env.NODE_ENV !== "production",
      sameSite: "strict",
      path: "/",
      maxAge: 86400,
    });

    return response;
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
