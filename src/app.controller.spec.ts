import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { UserService } from './user.service';

describe('AppController', () => {
  let appController: AppController;

  const timestamp = +new Date();
  const data = {
    name: `User ${timestamp}`,
    email: `${timestamp}@mail.com`,
    password: `${timestamp}`,
    profileImage: `https://image.domain.com/${timestamp}`,
  };

  let token: string;
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, UserService, PrismaService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
    it('user sign-up - success', async () => {
      token = (await appController.signUp(data))?.token || '';
      expect(token).toBeTruthy();
    });
    it('try to get profile image', async () => {
      const result = await appController.getProfileImage({ token });
      expect(result).toHaveProperty('profileImage');
    });
    it('user sign-up: should throw Error cos we use same email ', async () => {
      let success: boolean;
      try {
        const newToken = (await appController.signUp(data))?.token || '';
        success = !!newToken;
      } catch (e) {
        success = false;
      }
      expect(success).toBe(false);
    });
    it('log-in: success ', async () => {
      let success: boolean;
      try {
        const newToken =
          (
            await appController.logIn({
              email: data.email,
              password: data.password,
            })
          )?.token || '';
        success = !!newToken;
      } catch (e) {
        success = false;
      }
      expect(success).toBe(true);
    });
    it('log-in: should fail cos of wrong credentials', async () => {
      let success: boolean;
      try {
        const newToken =
          (
            await appController.logIn({
              email: data.email,
              password: data.password + `123`,
            })
          )?.token || '';
        success = !!newToken;
      } catch (e) {
        success = false;
      }
      expect(success).toBe(false);
    });
  });
});
