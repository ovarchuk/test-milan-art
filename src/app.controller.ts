import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import * as Joi from 'joi';
import { AppService } from './app.service';
import { UserService } from './user.service';
import * as jwt from 'jsonwebtoken';
import { comparePassword, cryptPassword } from './utils/password';

interface SignUp {
  name: string;
  email: string;
  password: string;
  profileImage: string;
}
const signUpScheme = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
  profileImage: Joi.string().required(),
});

interface LoginData {
  email: string;
  password: string;
}
const loginScheme = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

type TokenPayload = { id: number; email: string };

const getToken = (payload: TokenPayload) => {
  return jwt.sign(payload, process.env.JWT_KEY);
};

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly userService: UserService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('sign-up')
  async signUp(@Body() signupData: SignUp): Promise<any> {
    const validationResult = signUpScheme.validate(signupData, {
      abortEarly: false,
    });
    const isValid = !validationResult.error;
    if (!isValid) {
      const response = validationResult.error.details.map((e) => e.message);
      throw new BadRequestException(response);
    }
    try {
      const hashedPassword = await cryptPassword(signupData.password);
      const data = await this.userService.createUser({
        ...signupData,
        password: hashedPassword,
      });
      const { id, email } = data;
      return { token: getToken({ id, email }) };
    } catch (error) {
      throw new BadRequestException({ code: error?.code, data: error?.meta });
    }
  }

  @Post('log-in')
  async logIn(@Body() loginData: LoginData): Promise<any> {
    const validationResult = loginScheme.validate(loginData, {
      abortEarly: false,
    });
    const isValid = !validationResult.error;
    if (!isValid) {
      const response = validationResult.error.details.map((e) => e.message);
      throw new BadRequestException(response);
    }
    try {
      const user = await this.userService.findUser({
        email: loginData.email,
      });
      const { id, email, password } = user;
      const isValidPassword = await comparePassword(
        loginData.password,
        password,
      );
      if (!isValidPassword) {
        throw new UnauthorizedException();
      }
      return { token: getToken({ id, email }) };
    } catch (error) {
      throw new BadRequestException({ error: error?.message });
    }
  }

  @Get('profile-image')
  async getProfileImage(@Headers() headers): Promise<any> {
    const { token } = headers;
    let userId = 0;
    try {
      jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        if (err) {
          throw new UnauthorizedException();
        } else {
          const { id } = decoded as TokenPayload;
          userId = id;
        }
      });
    } catch (e) {
      throw new UnauthorizedException();
    }
    try {
      const data = await this.userService.findUser({ id: userId });
      return { profileImage: data?.profileImage };
    } catch (error) {
      throw new BadRequestException({ code: error?.code, data: error?.meta });
    }
  }
}
