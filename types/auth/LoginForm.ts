//export interface LoginForm {
//  username: string;
//  password: string;
//}

import { z } from "zod";

export const LoginFormSchema = z.object({
  username: z.string().nonempty("กรุณาระบุ Username"),
  password: z.string().nonempty("กรุณาระบุ Password").optional(),
});

export type LoginForm = z.infer<typeof LoginFormSchema>;
