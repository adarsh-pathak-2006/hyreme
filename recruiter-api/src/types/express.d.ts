import type { AuthUser } from "@hyreme/shared";
import type { Multer } from "multer";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      sessionId?: string;
      file?: Multer.File;
    }
  }
}

export {};
