import type { Language } from "./storage";
import { admin } from "./messages/admin";
import { auth } from "./messages/auth";
import { booking } from "./messages/booking";
import { chat } from "./messages/chat";
import { common } from "./messages/common";
import { marketing } from "./messages/marketing";
import { notifications } from "./messages/notifications";
import { physio } from "./messages/physio";
import { profile } from "./messages/profile";
import { reviews } from "./messages/reviews";
import { therapists } from "./messages/therapists";
import { ui } from "./messages/ui";
import type { MessageModule } from "./messages/types";

const modules: MessageModule[] = [
  common,
  auth,
  marketing,
  booking,
  therapists,
  chat,
  profile,
  reviews,
  notifications,
  admin,
  physio,
  ui,
];

function mergeLanguage(language: Language): Record<string, string> {
  return modules.reduce<Record<string, string>>(
    (acc, mod) => Object.assign(acc, mod[language]),
    {},
  );
}

export const translations: Record<Language, Record<string, string>> = {
  id: mergeLanguage("id"),
  en: mergeLanguage("en"),
};

export function translate(language: Language, key: string): string {
  return translations[language]?.[key] ?? translations.id[key] ?? key;
}
