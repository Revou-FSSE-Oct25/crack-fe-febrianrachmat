import { translate } from "@/lib/i18n/dictionary";
import type { Language } from "@/lib/i18n/storage";

export type DemoAccount = {
  email: string;
  role: "ADMIN" | "PATIENT" | "PHYSIOTHERAPIST";
  label: string;
  note: string;
};

export const DEMO_DEFAULT_PASSWORD = "password123";

export function getDemoAccounts(language: Language = "id"): DemoAccount[] {
  return [
    {
      email: "admin@demo.local",
      role: "ADMIN",
      label: translate(language, "mkt.demoAccAdminLabel"),
      note: translate(language, "mkt.demoAccAdminNote"),
    },
    {
      email: "patient1@demo.local",
      role: "PATIENT",
      label: translate(language, "mkt.demoAccPatient1Label"),
      note: translate(language, "mkt.demoAccPatient1Note"),
    },
    {
      email: "patient2@demo.local",
      role: "PATIENT",
      label: translate(language, "mkt.demoAccPatient2Label"),
      note: translate(language, "mkt.demoAccPatient2Note"),
    },
    {
      email: "physio1@demo.local",
      role: "PHYSIOTHERAPIST",
      label: translate(language, "mkt.demoAccPhysio1Label"),
      note: translate(language, "mkt.demoAccPhysio1Note"),
    },
    {
      email: "physio2@demo.local",
      role: "PHYSIOTHERAPIST",
      label: translate(language, "mkt.demoAccPhysio2Label"),
      note: translate(language, "mkt.demoAccPhysio2Note"),
    },
    {
      email: "physio3@demo.local",
      role: "PHYSIOTHERAPIST",
      label: translate(language, "mkt.demoAccPhysio3Label"),
      note: translate(language, "mkt.demoAccPhysio3Note"),
    },
  ];
}

export const DEMO_ACCOUNTS: DemoAccount[] = getDemoAccounts();

export type DemoFlowStep = {
  title: string;
  actors: string;
  steps: string[];
  links: { label: string; href: string }[];
};

export function getDemoHappyPaths(language: Language = "id"): DemoFlowStep[] {
  return [
    {
      title: translate(language, "mkt.demoFlow1Title"),
      actors: "physio2 + patient2 + admin",
      steps: [
        translate(language, "mkt.demoFlow1Step1"),
        translate(language, "mkt.demoFlow1Step2"),
        translate(language, "mkt.demoFlow1Step3"),
        translate(language, "mkt.demoFlow1Step4"),
      ],
      links: [
        { label: translate(language, "mkt.demoLinkBooking"), href: "/bookings" },
        {
          label: translate(language, "mkt.demoLinkTransactions"),
          href: "/transactions",
        },
      ],
    },
    {
      title: translate(language, "mkt.demoFlow2Title"),
      actors: "physio1 + patient2 + admin",
      steps: [
        translate(language, "mkt.demoFlow2Step1"),
        translate(language, "mkt.demoFlow2Step2"),
        translate(language, "mkt.demoFlow2Step3"),
      ],
      links: [
        {
          label: translate(language, "mkt.consultationLink"),
          href: "/consultations",
        },
        { label: translate(language, "mkt.demoLinkChat"), href: "/chat" },
      ],
    },
    {
      title: translate(language, "mkt.demoFlow3Title"),
      actors: "admin",
      steps: [
        translate(language, "mkt.demoFlow3Step1"),
        translate(language, "mkt.demoFlow3Step2"),
        translate(language, "mkt.demoFlow3Step3"),
      ],
      links: [
        {
          label: translate(language, "mkt.demoLinkDashboard"),
          href: "/admin/dashboard",
        },
        {
          label: translate(language, "mkt.demoLinkAnalytics"),
          href: "/admin/analytics",
        },
      ],
    },
  ];
}

export const DEMO_HAPPY_PATHS: DemoFlowStep[] = getDemoHappyPaths();

export function getDemoPreflightChecklist(language: Language = "id"): string[] {
  return [
    translate(language, "mkt.demoChecklist1"),
    translate(language, "mkt.demoChecklist2"),
    translate(language, "mkt.demoChecklist3"),
    translate(language, "mkt.demoChecklist4"),
    translate(language, "mkt.demoChecklist5"),
  ];
}

export const DEMO_PREFLIGHT_CHECKLIST = getDemoPreflightChecklist();
