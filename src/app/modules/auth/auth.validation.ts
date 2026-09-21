import { z } from 'zod';

const loginZodSchema = z.object({
  body: z.object({
    email: z
      .string({
        message: 'Email is required',
      })
      .email('Invalid email address'),
    password: z.string({
      message: 'Password is required',
    }),
  }),
});

const refreshTokenZodSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      message: 'Refresh Token is required',
    }),
  }),
});

const changePasswordZodSchema = z.object({
  body: z.object({
    oldPassword: z.string({
      message: 'Old password is required',
    }),
    newPassword: z
      .string({
        message: 'New password is required',
      })
      .min(6, 'Password must be at least 6 characters long'),
  }),
});

const forgotPasswordZodSchema = z.object({
  body: z.object({
    email: z
      .string({
        message: 'Email is required',
      })
      .email('Invalid email address'),
  }),
});

const verifyOtpZodSchema = z.object({
  body: z.object({
    email: z
      .string({
        message: 'Email is required',
      })
      .email('Invalid email address'),
    otp: z.string({
      message: 'OTP is required',
    }),
  }),
});

const resetPasswordZodSchema = z.object({
  body: z.object({
    email: z
      .string({
        message: 'Email is required',
      })
      .email('Invalid email address'),
    otp: z.string({
      message: 'OTP is required',
    }),
    newPassword: z
      .string({
        message: 'New password is required',
      })
      .min(6, 'Password must be at least 6 characters long'),
  }),
});

export const AuthValidation = {
  loginZodSchema,
  refreshTokenZodSchema,
  changePasswordZodSchema,
  forgotPasswordZodSchema,
  verifyOtpZodSchema,
  resetPasswordZodSchema,
};
