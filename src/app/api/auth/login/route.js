import { connectMongoDB } from "@/libs/mongodb";
import { NextResponse } from "next/server";
import { messages } from "@/utils/message";
import  User from "@/models/User";
import bcrypt from "bcryptjs/dist/bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req){
try {
        await connectMongoDB();
        const body = await req.json();
        const {email, password} = body;
        //Enviar los datos
    if(!email || !password){
        return NextResponse.json({
            message: messages.error.needProps,
        })

    }

    const userFind = await User.findOne({email});

    if(!userFind){
        return NextResponse.json(
            {
            message: messages.error.userNotFound
        },
            {
                status: 400
        })
    }

    const isCorrectPassword = await bcrypt.compare(
        password,
        userFind.password
    );
 //Validar contraseña correcta
    if(!isCorrectPassword){
        return NextResponse.json(
            {
            message: messages.error.passwordNotMatch
        },
            {
                status: 400
        })
    }

    const {password: userPass, ...rest} = userFind._doc;    
    const token = jwt.sign({date:rest}, "secreto",{
        expiresIn: 86400
    });

    const response = NextResponse.json(
        {
          userLogged: rest,
          message: messages.success.userLogged,
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
    }
 catch (error) {
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

