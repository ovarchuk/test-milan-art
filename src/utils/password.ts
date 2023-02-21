import * as bcrypt from 'bcrypt';

export const cryptPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(6);
  const hashed = (await bcrypt.hash(password, salt)).toString() as string;
  return hashed;
};

export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  const validPassword = await bcrypt.compare(password, hashedPassword);
  return validPassword;
};
