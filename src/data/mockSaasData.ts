import type { Tone } from "@/components/ui/ToneBadge";
import type {
  BillingCycle,
  CustomDomain,
  CustomDomainStatus,
  FeatureKey,
  Institution,
  InstitutionSource,
  InstitutionType,
  InvoiceStatus,
  LimitKey,
  PaymentMethod,
  Plan,
  PlanId,
  SaasActor,
  SaasEvent,
  SaasEventType,
  SaasInvoice,
  SaasStore,
  SubscriptionStatus,
  TierPlanId,
} from "@/types/saas";
import { SAAS_CNAME_TARGET } from "@/types/saas";

/**
 * Deterministic mock data for the SaaS layer (mulberry32 seed), with every date relative to "now".
 *
 * - 4 plans: Starter $29/$290, Growth $79/$790 (highlighted), Pro $199/$1,990, Enterprise (custom-priced,
 *   not public; each Enterprise subscriber carries a negotiated `subscription.customPrice`).
 * - 42 institutions created over the last ~14 months: 26 ACTIVE (one cancelling at period end), 6 TRIALING
 *   (2 ending within 3 days), 4 PAST_DUE, 4 CANCELLED (2 paid churns + 2 expired trials), 2 SUSPENDED (> 30 days ago).
 * - Usage sits inside plan limits; a few are deliberately ≥ 90 % (`SEED_NEAR_LIMIT`) and one is over
 *   (`SEED_OVER_LIMIT`, Summit Prep storage).
 * - 7 custom domains, only on Pro / Enterprise (5 VERIFIED, 1 PENDING_DNS, 1 FAILED).
 * - One invoice per paid period (monthly or yearly), including a prior plan for upgraded institutions.
 *   PAST_DUE → latest invoice FAILED or OPEN; trials → none; one REFUNDED and one VOID invoice for variety.
 * - Event timeline per institution (signup, trial, payments, upgrades, domains, cancellation, suspension, notes).
 * - The admin panel's own tenant is "EduPro Academy" (`inst-edupro`, Growth MONTHLY ACTIVE).
 *
 * No timestamp lies in the future except subscription period ends, trial ends and OPEN invoice due dates.
 */

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const CURRENT_INSTITUTION_ID = "inst-edupro";
export const SAAS_TRIAL_DAYS = 14;

const MIN = 60_000;
const H = 60 * MIN;
const D = 24 * H;

// ---------------------------------------------------------------- date helpers (exported for storage reuse)

/** Adds calendar months in UTC, clamping the day (Jan 31 + 1 month → Feb 28/29). */
export function addMonthsUtc(iso: string | number, months: number): string {
  const d = new Date(iso);
  const day = d.getUTCDate();
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1, d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return target.toISOString();
}

/** Start of period `index` for a subscription anchored at `anchor` (index 0 = anchor). */
export const periodStartAt = (anchor: string, cycle: BillingCycle, index: number) => addMonthsUtc(anchor, cycle === "YEARLY" ? 12 * index : index);

// ---------------------------------------------------------------- plans

const PLAN_FEATURES: Record<TierPlanId, FeatureKey[]> = {
  starter: ["certificates", "community"],
  growth: ["certificates", "community", "liveClasses", "aiAssistant", "advancedAnalytics"],
  pro: ["certificates", "community", "liveClasses", "aiAssistant", "advancedAnalytics", "customDomain", "whiteLabel", "apiAccess"],
  enterprise: ["certificates", "community", "liveClasses", "aiAssistant", "advancedAnalytics", "customDomain", "whiteLabel", "apiAccess", "prioritySupport"],
};

export function buildPlans(now: number): Plan[] {
  const updatedAt = new Date(now - 64 * D).toISOString();
  return [
    {
      id: "starter",
      name: "Starter",
      tagline: "For tutors and small coaching centres getting started online.",
      priceMonthly: 29,
      priceYearly: 290,
      limits: { students: 200, courses: 20, teamMembers: 3, storageGb: 10 },
      features: PLAN_FEATURES.starter,
      highlighted: false,
      isPublic: true,
      trialDays: SAAS_TRIAL_DAYS,
      updatedAt,
    },
    {
      id: "growth",
      name: "Growth",
      tagline: "Live classes, AI assistant and analytics for growing schools.",
      priceMonthly: 79,
      priceYearly: 790,
      limits: { students: 1000, courses: 100, teamMembers: 10, storageGb: 50 },
      features: PLAN_FEATURES.growth,
      highlighted: true,
      isPublic: true,
      trialDays: SAAS_TRIAL_DAYS,
      updatedAt,
    },
    {
      id: "pro",
      name: "Pro",
      tagline: "Your own domain, white-label branding and API access.",
      priceMonthly: 199,
      priceYearly: 1990,
      limits: { students: 5000, courses: null, teamMembers: 25, storageGb: 200 },
      features: PLAN_FEATURES.pro,
      highlighted: false,
      isPublic: true,
      trialDays: SAAS_TRIAL_DAYS,
      updatedAt,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      tagline: "Unlimited everything, priority support and a negotiated contract.",
      priceMonthly: 0,
      priceYearly: 0,
      limits: { students: null, courses: null, teamMembers: null, storageGb: null },
      features: PLAN_FEATURES.enterprise,
      highlighted: false,
      isPublic: false,
      trialDays: 30,
      updatedAt,
    },
  ];
}

// ---------------------------------------------------------------- institution specs

type Spec = {
  slug: string;
  name: string;
  type: InstitutionType;
  country: string;
  plan: PlanId;
  cycle: BillingCycle;
  status: SubscriptionStatus;
  /** Days since the institution was created (approximate; aligned for past-due / cancelled / suspended). */
  age: number;
  source: InstitutionSource;
  owner: [string, string];
  /** Previous plan + how many periods before now the upgrade happened. */
  upgradedFrom?: { plan: PlanId; periodsAgo: number };
  domain?: { domain: string; status: CustomDomainStatus; addedDaysAgo: number };
  /** Usage profile. */
  usage?: "near" | "low" | "high";
  cancelAtPeriodEnd?: boolean;
  /** CANCELLED: days since cancellation. SUSPENDED: days since suspension. */
  endedDaysAgo?: number;
  trialExpired?: boolean;
  latestInvoice?: "FAILED" | "OPEN";
  suspendReason?: string;
  customPrice?: number;
  notes?: string;
  pm?: PaymentMethod | null;
};

const SPECS: Spec[] = [
  // ---- ACTIVE (26)
  { slug: "edupro", name: "EduPro Academy", type: "COACHING", country: "Bangladesh", plan: "growth", cycle: "MONTHLY", status: "ACTIVE", age: 402, source: "SELF_SIGNUP", owner: ["Imam", "Hossain"], pm: { brand: "Visa", last4: "4242" }, notes: "Flagship tenant — our own academy. Use it for demos." },
  { slug: "dhaka-coding", name: "Dhaka Coding Academy", type: "COACHING", country: "Bangladesh", plan: "pro", cycle: "MONTHLY", status: "ACTIVE", age: 412, source: "SELF_SIGNUP", owner: ["Tanvir", "Rahman"], upgradedFrom: { plan: "growth", periodsAgo: 5 }, domain: { domain: "learn.dhakacoding.com", status: "VERIFIED", addedDaysAgo: 140 }, pm: { brand: "Mastercard", last4: "5100" } },
  { slug: "ctg-grammar", name: "Chittagong Grammar School", type: "SCHOOL", country: "Bangladesh", plan: "growth", cycle: "YEARLY", status: "ACTIVE", age: 391, source: "OWNER_CREATED", owner: ["Farhana", "Chowdhury"], pm: { brand: "SSLCommerz", last4: "0921" }, notes: "Signed at the Chattogram ed-tech fair. Wants Bangla certificate templates." },
  { slug: "skillup-bd", name: "SkillUp BD", type: "COACHING", country: "Bangladesh", plan: "growth", cycle: "MONTHLY", status: "ACTIVE", age: 362, source: "SELF_SIGNUP", owner: ["Mahmudul", "Hasan"], upgradedFrom: { plan: "starter", periodsAgo: 3 }, usage: "near", pm: { brand: "bKash", last4: "7781" } },
  { slug: "northbridge", name: "Northbridge University", type: "UNIVERSITY", country: "United Kingdom", plan: "enterprise", cycle: "YEARLY", status: "ACTIVE", age: 383, source: "OWNER_CREATED", owner: ["Eleanor", "Whitfield"], customPrice: 9600, domain: { domain: "lms.northbridge.ac.uk", status: "VERIFIED", addedDaysAgo: 370 }, usage: "high", pm: { brand: "Visa", last4: "1881" }, notes: "Enterprise contract £/$9,600 per year. Renewal call 30 days before term ends." },
  { slug: "pixel-creators", name: "Pixel Creators", type: "CREATOR", country: "United States", plan: "starter", cycle: "MONTHLY", status: "ACTIVE", age: 301, source: "SELF_SIGNUP", owner: ["Jordan", "Ellis"], pm: { brand: "Visa", last4: "3020" } },
  { slug: "rajshahi-model", name: "Rajshahi Model College", type: "SCHOOL", country: "Bangladesh", plan: "growth", cycle: "MONTHLY", status: "ACTIVE", age: 342, source: "OWNER_CREATED", owner: ["Nasrin", "Akter"], pm: { brand: "SSLCommerz", last4: "4410" } },
  { slug: "sylhet-science", name: "Sylhet Science Coaching", type: "COACHING", country: "Bangladesh", plan: "starter", cycle: "MONTHLY", status: "ACTIVE", age: 331, source: "SELF_SIGNUP", owner: ["Abdul", "Karim"], usage: "near", pm: { brand: "bKash", last4: "2290" } },
  { slug: "brightpath", name: "BrightPath Learning", type: "COMPANY", country: "India", plan: "growth", cycle: "YEARLY", status: "ACTIVE", age: 312, source: "SELF_SIGNUP", owner: ["Priya", "Nair"], pm: { brand: "Mastercard", last4: "8812" } },
  { slug: "khulna-tech", name: "Khulna Tech Institute", type: "COACHING", country: "Bangladesh", plan: "starter", cycle: "YEARLY", status: "ACTIVE", age: 289, source: "SELF_SIGNUP", owner: ["Rakibul", "Islam"], pm: { brand: "bKash", last4: "6630" } },
  { slug: "lumen-academy", name: "Lumen Corporate Academy", type: "COMPANY", country: "Singapore", plan: "pro", cycle: "YEARLY", status: "ACTIVE", age: 281, source: "SELF_SIGNUP", owner: ["Wei Ling", "Tan"], domain: { domain: "academy.lumencorp.sg", status: "VERIFIED", addedDaysAgo: 250 }, pm: { brand: "Visa", last4: "0077" } },
  { slug: "barishal-medprep", name: "Barishal Medical Prep", type: "COACHING", country: "Bangladesh", plan: "growth", cycle: "MONTHLY", status: "ACTIVE", age: 262, source: "SELF_SIGNUP", owner: ["Sumaiya", "Begum"], cancelAtPeriodEnd: true, pm: { brand: "bKash", last4: "1145" }, notes: "Moving to a government platform after admission season. Offered 20% discount — declined." },
  { slug: "gulshan-intl", name: "Gulshan International School", type: "SCHOOL", country: "Bangladesh", plan: "pro", cycle: "MONTHLY", status: "ACTIVE", age: 251, source: "OWNER_CREATED", owner: ["Shahana", "Kabir"], domain: { domain: "learn.gulshanintl.edu.bd", status: "VERIFIED", addedDaysAgo: 230 }, pm: { brand: "Mastercard", last4: "4039" } },
  { slug: "code-crafters", name: "Code Crafters Bootcamp", type: "COACHING", country: "Kenya", plan: "growth", cycle: "MONTHLY", status: "ACTIVE", age: 232, source: "SELF_SIGNUP", owner: ["Brian", "Otieno"], pm: { brand: "Visa", last4: "9922" } },
  { slug: "mentor-hub", name: "Mentor Hub", type: "CREATOR", country: "India", plan: "starter", cycle: "MONTHLY", status: "ACTIVE", age: 211, source: "SELF_SIGNUP", owner: ["Arjun", "Mehta"], pm: { brand: "Mastercard", last4: "7310" } },
  { slug: "apex-data", name: "Apex Data School", type: "COACHING", country: "United Arab Emirates", plan: "pro", cycle: "MONTHLY", status: "ACTIVE", age: 199, source: "SELF_SIGNUP", owner: ["Omar", "Al Nuaimi"], domain: { domain: "courses.apexdata.ae", status: "PENDING_DNS", addedDaysAgo: 2 }, pm: { brand: "Visa", last4: "6011" } },
  { slug: "comilla-victoria", name: "Comilla Victoria Academy", type: "SCHOOL", country: "Bangladesh", plan: "starter", cycle: "MONTHLY", status: "ACTIVE", age: 188, source: "OWNER_CREATED", owner: ["Jahangir", "Alam"], pm: { brand: "SSLCommerz", last4: "3381" } },
  { slug: "rangpur-language", name: "Rangpur Language Centre", type: "COACHING", country: "Bangladesh", plan: "starter", cycle: "MONTHLY", status: "ACTIVE", age: 172, source: "SELF_SIGNUP", owner: ["Mitu", "Sarkar"], usage: "near", pm: { brand: "bKash", last4: "5507" } },
  { slug: "greenfield-bs", name: "Greenfield Business School", type: "UNIVERSITY", country: "Malaysia", plan: "growth", cycle: "YEARLY", status: "ACTIVE", age: 158, source: "SELF_SIGNUP", owner: ["Aisyah", "Rahim"], pm: { brand: "Visa", last4: "2468" } },
  { slug: "ayesha-art", name: "Ayesha's Art Studio", type: "CREATOR", country: "Bangladesh", plan: "starter", cycle: "MONTHLY", status: "ACTIVE", age: 141, source: "SELF_SIGNUP", owner: ["Ayesha", "Siddiqua"], usage: "low", pm: { brand: "bKash", last4: "9014" } },
  { slug: "bengal-eng-prep", name: "Bengal Engineering Prep", type: "COACHING", country: "Bangladesh", plan: "growth", cycle: "MONTHLY", status: "ACTIVE", age: 119, source: "SELF_SIGNUP", owner: ["Sabbir", "Ahmed"], usage: "near", pm: { brand: "Mastercard", last4: "1357" } },
  { slug: "orbit-robotics", name: "Orbit Robotics Lab", type: "COMPANY", country: "Germany", plan: "pro", cycle: "YEARLY", status: "ACTIVE", age: 101, source: "SELF_SIGNUP", owner: ["Lukas", "Brandt"], domain: { domain: "learn.orbitrobotics.de", status: "FAILED", addedDaysAgo: 9 }, pm: { brand: "Visa", last4: "8080" } },
  { slug: "narayanganj-public", name: "Narayanganj Public School", type: "SCHOOL", country: "Bangladesh", plan: "growth", cycle: "MONTHLY", status: "ACTIVE", age: 79, source: "OWNER_CREATED", owner: ["Kamrul", "Hassan"], pm: { brand: "SSLCommerz", last4: "6672" } },
  { slug: "talentforge", name: "TalentForge HR Academy", type: "COMPANY", country: "Canada", plan: "growth", cycle: "MONTHLY", status: "ACTIVE", age: 61, source: "SELF_SIGNUP", owner: ["Emily", "Tremblay"], usage: "low", pm: { brand: "Mastercard", last4: "2222" } },
  { slug: "mymensingh-agri", name: "Mymensingh Agri Institute", type: "UNIVERSITY", country: "Bangladesh", plan: "enterprise", cycle: "YEARLY", status: "ACTIVE", age: 46, source: "OWNER_CREATED", owner: ["Dr. Rezaul", "Karim"], customPrice: 6000, domain: { domain: "elearn.mau.edu.bd", status: "VERIFIED", addedDaysAgo: 40 }, pm: { brand: "SSLCommerz", last4: "1200" }, notes: "Government-funded. Invoice must show BIN number; procurement contact is the registrar office." },
  { slug: "quran-circle", name: "Quran Learning Circle", type: "CREATOR", country: "Pakistan", plan: "pro", cycle: "MONTHLY", status: "ACTIVE", age: 31, source: "SELF_SIGNUP", owner: ["Usman", "Qureshi"], usage: "low", pm: { brand: "Visa", last4: "5454" } },

  // ---- TRIALING (6)
  { slug: "future-leaders", name: "Future Leaders Academy", type: "SCHOOL", country: "Bangladesh", plan: "growth", cycle: "MONTHLY", status: "TRIALING", age: 13, source: "SELF_SIGNUP", owner: ["Nusrat", "Jahan"], usage: "low", pm: null },
  { slug: "codenest-kids", name: "CodeNest Kids", type: "COACHING", country: "India", plan: "growth", cycle: "YEARLY", status: "TRIALING", age: 12, source: "SELF_SIGNUP", owner: ["Rohan", "Kapoor"], usage: "low", pm: { brand: "Visa", last4: "1111" } },
  { slug: "savar-cadet", name: "Savar Cadet Coaching", type: "COACHING", country: "Bangladesh", plan: "starter", cycle: "MONTHLY", status: "TRIALING", age: 8, source: "SELF_SIGNUP", owner: ["Fahim", "Uddin"], usage: "low", pm: null },
  { slug: "studysphere", name: "StudySphere", type: "CREATOR", country: "Australia", plan: "pro", cycle: "MONTHLY", status: "TRIALING", age: 5, source: "SELF_SIGNUP", owner: ["Chloe", "Bennett"], usage: "low", pm: null },
  { slug: "bogura-poly", name: "Bogura Polytechnic Hub", type: "SCHOOL", country: "Bangladesh", plan: "growth", cycle: "MONTHLY", status: "TRIALING", age: 3, source: "OWNER_CREATED", owner: ["Mizanur", "Rahman"], usage: "low", pm: null, notes: "Demo done on call — follow up before trial ends." },
  { slug: "nexus-sales", name: "Nexus Sales Academy", type: "COMPANY", country: "United States", plan: "growth", cycle: "MONTHLY", status: "TRIALING", age: 1, source: "SELF_SIGNUP", owner: ["Marcus", "Reed"], usage: "low", pm: null },

  // ---- PAST_DUE (4)
  { slug: "feni-girls", name: "Feni Girls' High School", type: "SCHOOL", country: "Bangladesh", plan: "starter", cycle: "MONTHLY", status: "PAST_DUE", age: 221, source: "OWNER_CREATED", owner: ["Rokeya", "Sultana"], latestInvoice: "FAILED", pm: { brand: "Mastercard", last4: "0045" } },
  { slug: "elevate-fitness", name: "Elevate Fitness Academy", type: "CREATOR", country: "United Kingdom", plan: "growth", cycle: "MONTHLY", status: "PAST_DUE", age: 152, source: "SELF_SIGNUP", owner: ["Hannah", "Clarke"], latestInvoice: "FAILED", pm: { brand: "Visa", last4: "0002" } },
  { slug: "coxs-tourism", name: "Cox's Bazar Tourism Institute", type: "COACHING", country: "Bangladesh", plan: "growth", cycle: "MONTHLY", status: "PAST_DUE", age: 96, source: "SELF_SIGNUP", owner: ["Shafiqul", "Islam"], latestInvoice: "OPEN", pm: { brand: "bKash", last4: "3109" } },
  { slug: "summit-prep", name: "Summit Prep Online", type: "COACHING", country: "United States", plan: "pro", cycle: "MONTHLY", status: "PAST_DUE", age: 181, source: "SELF_SIGNUP", owner: ["Daniel", "Foster"], latestInvoice: "FAILED", usage: "high", pm: { brand: "Visa", last4: "0341" } },

  // ---- CANCELLED (4)
  { slug: "jessore-point", name: "Jessore Coaching Point", type: "COACHING", country: "Bangladesh", plan: "starter", cycle: "MONTHLY", status: "CANCELLED", age: 352, source: "SELF_SIGNUP", owner: ["Habibur", "Rahman"], endedDaysAgo: 118, pm: { brand: "bKash", last4: "8823" }, notes: "Closed the centre after the HSC season." },
  { slug: "vertex-design", name: "Vertex Design School", type: "CREATOR", country: "India", plan: "growth", cycle: "MONTHLY", status: "CANCELLED", age: 268, source: "SELF_SIGNUP", owner: ["Kavya", "Iyer"], endedDaysAgo: 19, pm: { brand: "Mastercard", last4: "6199" }, notes: "Switched to a competitor with cheaper storage." },
  { slug: "sunrise-kg", name: "Sunrise Kindergarten", type: "SCHOOL", country: "Bangladesh", plan: "starter", cycle: "MONTHLY", status: "CANCELLED", age: 20, source: "SELF_SIGNUP", owner: ["Lipi", "Das"], trialExpired: true, endedDaysAgo: 6, usage: "low", pm: null },
  { slug: "moonlight-music", name: "Moonlight Music Academy", type: "CREATOR", country: "Sri Lanka", plan: "growth", cycle: "MONTHLY", status: "CANCELLED", age: 40, source: "SELF_SIGNUP", owner: ["Nimal", "Perera"], trialExpired: true, endedDaysAgo: 26, usage: "low", pm: null },

  // ---- SUSPENDED (2)
  { slug: "tangail-madrasa", name: "Tangail Online Madrasa", type: "SCHOOL", country: "Bangladesh", plan: "starter", cycle: "MONTHLY", status: "SUSPENDED", age: 241, source: "SELF_SIGNUP", owner: ["Mawlana", "Saiful"], endedDaysAgo: 45, suspendReason: "Non-payment — 3 failed charges over 21 days.", pm: { brand: "bKash", last4: "4471" } },
  { slug: "quickcert-hub", name: "QuickCert Hub", type: "COMPANY", country: "Nepal", plan: "growth", cycle: "MONTHLY", status: "SUSPENDED", age: 131, source: "SELF_SIGNUP", owner: ["Bikash", "Shrestha"], endedDaysAgo: 38, suspendReason: "Terms of Service violation — reselling third-party course content.", pm: { brand: "Visa", last4: "9191" } },
];

/** Deliberately near-limit (≥ 90 %) institution ids — for the sanity script and demos. */
export const SEED_NEAR_LIMIT = SPECS.filter((s) => s.usage === "near").map((s) => `inst-${s.slug}`);
/** Deliberately over-limit usage (allowed by the sanity script). */
export const SEED_OVER_LIMIT: { institutionId: string; key: LimitKey }[] = [{ institutionId: "inst-summit-prep", key: "storageGb" }];

const TONES: Tone[] = ["orange", "blue", "green", "purple", "yellow", "indigo", "red", "navy"];

const initials = (name: string) =>
  name
    .replace(/[^A-Za-z ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

const priceOf = (plans: Plan[], planId: PlanId, cycle: BillingCycle, customPrice?: number) => {
  if (customPrice !== undefined && planId === "enterprise") return customPrice;
  const p = plans.find((x) => x.id === planId)!;
  return cycle === "YEARLY" ? p.priceYearly : p.priceMonthly;
};

/** VAT / sales tax applied to SaaS invoices by billing country (mock). */
export const SAAS_TAX_RATES: Record<string, number> = { Bangladesh: 0.05, "United Kingdom": 0.2, Germany: 0.19, India: 0.18 };
export const taxFor = (country: string, amount: number) => Math.round(amount * (SAAS_TAX_RATES[country] ?? 0) * 100) / 100;

// ---------------------------------------------------------------- build

export function buildSaasSeed(nowMs: number = Date.now()): SaasStore {
  const rand = mulberry32(20261101);
  const between = (a: number, b: number) => a + rand() * (b - a);
  const int = (a: number, b: number) => Math.floor(between(a, b + 1));
  const now = nowMs;
  const iso = (ms: number) => new Date(ms).toISOString();

  const plans = buildPlans(now);
  const planById = (id: PlanId) => plans.find((p) => p.id === id)!;

  const institutions: Institution[] = [];
  const rawInvoices: Omit<SaasInvoice, "number">[] = [];
  const events: SaasEvent[] = [];
  let evSeq = 0;
  let invSeq = 0;
  const ev = (institutionId: string, type: SaasEventType, message: string, at: number, actor: SaasActor) =>
    events.push({ id: `ev-${(++evSeq).toString().padStart(4, "0")}`, institutionId, type, message, at: iso(Math.min(at, now - MIN)), actor });

  SPECS.forEach((s, index) => {
    const id = `inst-${s.slug}`;
    const trialDays = s.source === "SELF_SIGNUP" || s.status === "TRIALING" || s.trialExpired ? SAAS_TRIAL_DAYS : 0;
    const createdBase = now - s.age * D - int(1, 10) * H;

    // anchor = first paid period start
    let anchor = createdBase + trialDays * D;
    const cycleMonths = s.cycle === "YEARLY" ? 12 : 1;
    const periodsUntil = (a: number, limit: number) => {
      const starts: number[] = [];
      for (let i = 0; ; i++) {
        const st = new Date(addMonthsUtc(a, i * cycleMonths)).getTime();
        if (st > limit) break;
        starts.push(st);
      }
      return starts;
    };
    /** Shift the anchor so that a period boundary lands on `target` (keeps the created date within days). */
    const alignTo = (target: number) => {
      const starts = periodsUntil(anchor, target);
      const last = starts[starts.length - 1] ?? anchor;
      anchor += target - last;
    };

    const paying = !(s.status === "TRIALING" || s.trialExpired);
    let suspendedAt: number | null = null;
    let cancelledAt: number | null = null;

    if (s.status === "PAST_DUE") alignTo(now - int(3, 8) * D - int(1, 12) * H);
    if (s.status === "CANCELLED" && !s.trialExpired) {
      cancelledAt = now - (s.endedDaysAgo ?? 30) * D;
      alignTo(cancelledAt);
    }
    if (s.status === "SUSPENDED") {
      suspendedAt = now - (s.endedDaysAgo ?? 7) * D - int(2, 9) * H;
      // failed period started ~3 weeks before suspension
      alignTo(suspendedAt - 21 * D);
    }
    const createdAt = anchor - trialDays * D;

    // ---- periods
    let starts: number[] = [];
    if (paying) {
      const limit = s.status === "CANCELLED" ? (cancelledAt as number) - 1 : s.status === "SUSPENDED" ? (suspendedAt as number) : now;
      starts = periodsUntil(anchor, limit);
      if (s.status === "SUSPENDED") starts = starts.filter((st) => st <= (suspendedAt as number) - 20 * D);
    }
    /** End of the period starting at starts[i] = start of period i + 1 (index-based so month clamping stays contiguous). */
    const periodEndAt = (i: number) => new Date(addMonthsUtc(anchor, (i + 1) * cycleMonths)).getTime();

    let currentPeriodStart: number;
    let currentPeriodEnd: number;
    const trialEndsAt = trialDays ? createdAt + trialDays * D : null;
    if (!paying) {
      currentPeriodStart = createdAt;
      currentPeriodEnd = trialEndsAt as number;
    } else {
      currentPeriodStart = starts[starts.length - 1]!;
      currentPeriodEnd = periodEndAt(starts.length - 1);
    }

    // ---- invoices
    const upgradeAtIndex = s.upgradedFrom ? Math.max(1, starts.length - s.upgradedFrom.periodsAgo) : -1;
    starts.forEach((st, i) => {
      const planId: PlanId = s.upgradedFrom && i < upgradeAtIndex ? s.upgradedFrom.plan : s.plan;
      const amount = priceOf(plans, planId, s.cycle, s.customPrice);
      const tax = taxFor(s.country, amount);
      const isLast = i === starts.length - 1;
      let status: InvoiceStatus = "PAID";
      if (isLast && s.status === "PAST_DUE") status = s.latestInvoice ?? "FAILED";
      if (isLast && s.status === "SUSPENDED") status = "FAILED";
      const paidAt = status === "PAID" ? st + int(2, 90) * MIN : null;
      rawInvoices.push({
        id: `inv-${(++invSeq).toString().padStart(5, "0")}`,
        institutionId: id,
        planId,
        cycle: s.cycle,
        amount,
        tax,
        total: Math.round((amount + tax) * 100) / 100,
        status,
        issuedAt: iso(st),
        dueAt: iso(st + (status === "OPEN" ? 7 * D : H)),
        paidAt: paidAt === null ? null : iso(paidAt),
        periodStart: iso(st),
        periodEnd: iso(periodEndAt(i)),
        description: `${planById(planId).name} plan — ${s.cycle === "YEARLY" ? "yearly" : "monthly"} subscription`,
      });
    });

    // ---- usage
    const plan = planById(s.plan);
    const usage = {} as Record<LimitKey, number>;
    (["students", "courses", "teamMembers", "storageGb"] as LimitKey[]).forEach((key) => {
      const limit = plan.limits[key];
      const fallback = { students: 8000, courses: 420, teamMembers: 60, storageGb: 640 }[key];
      const cap = limit ?? fallback;
      const [lo, hi] = s.usage === "near" ? [0.9, 0.99] : s.usage === "low" ? [0.02, 0.22] : s.usage === "high" ? [0.7, 0.88] : [0.25, 0.82];
      // Near-limit tenants are near on students + one more key; the rest stays normal.
      const nearKey = s.usage === "near" && (key === "students" || key === (index % 2 ? "storageGb" : "teamMembers"));
      const f = s.usage === "near" && !nearKey ? between(0.4, 0.75) : between(lo, hi);
      let value = key === "storageGb" ? Math.round(cap * f * 10) / 10 : Math.max(1, Math.round(cap * f));
      if (key === "teamMembers" && limit !== null) value = Math.min(value, limit);
      usage[key] = value;
    });
    if (id === CURRENT_INSTITUTION_ID) Object.assign(usage, { students: 642, courses: 10, teamMembers: 10, storageGb: 31.4 });
    if (id === "inst-summit-prep") usage.storageGb = 204.6;

    // ---- domain
    let customDomain: CustomDomain | null = null;
    if (s.domain) {
      const addedAt = now - s.domain.addedDaysAgo * D - int(1, 8) * H;
      customDomain = {
        domain: s.domain.domain,
        status: s.domain.status,
        addedAt: iso(addedAt),
        verifiedAt: s.domain.status === "VERIFIED" ? iso(addedAt + int(20, 300) * MIN) : null,
        dnsTarget: SAAS_CNAME_TARGET,
        txtToken: `edupro-verify=${Math.floor(rand() * 1e12).toString(36)}${Math.floor(rand() * 1e12).toString(36)}`,
        lastCheckedAt: iso(s.domain.status === "VERIFIED" ? addedAt + int(20, 300) * MIN : Math.min(now - int(10, 300) * MIN, addedAt + 3 * H)),
      };
    }

    // ---- activity
    const ended = cancelledAt ?? suspendedAt ?? (s.trialExpired ? (trialEndsAt as number) : now);
    const lastActiveAt = Math.min(now - int(5, 60 * 60) * MIN, ended - (s.status === "ACTIVE" || s.status === "TRIALING" || s.status === "PAST_DUE" ? 0 : int(1, 5) * D));

    const [first, last] = s.owner;
    const emailDomain = customDomain ? customDomain.domain.split(".").slice(1).join(".") : `${s.slug.replace(/-/g, "")}.com`;
    const phone =
      s.country === "Bangladesh"
        ? `+880 1${int(3, 9)}${int(10, 99)}-${int(100000, 999999)}`
        : `+${int(1, 98)} ${int(200, 999)} ${int(100, 999)} ${int(1000, 9999)}`;

    let status: SubscriptionStatus = s.status;
    if (s.status === "CANCELLED") status = "CANCELLED";
    institutions.push({
      id,
      name: s.name,
      slug: s.slug,
      logoInitials: initials(s.name),
      tone: TONES[index % TONES.length]!,
      type: s.type,
      country: s.country,
      ownerName: `${first} ${last}`,
      ownerEmail: `${first.toLowerCase().replace(/[^a-z]/g, "")}@${emailDomain}`,
      phone,
      createdAt: iso(createdAt),
      lastActiveAt: iso(Math.max(lastActiveAt, createdAt + H)),
      subscription: {
        planId: s.plan,
        cycle: s.cycle,
        status,
        startedAt: iso(paying ? anchor : createdAt),
        trialEndsAt: trialEndsAt === null ? null : iso(trialEndsAt),
        currentPeriodStart: iso(currentPeriodStart),
        currentPeriodEnd: iso(currentPeriodEnd),
        cancelAtPeriodEnd: !!s.cancelAtPeriodEnd,
        cancelledAt: s.status === "CANCELLED" ? iso(cancelledAt ?? (trialEndsAt as number)) : null,
        suspendedAt: suspendedAt === null ? null : iso(suspendedAt),
        suspendedReason: s.suspendReason ?? null,
        statusBeforeSuspend: s.status === "SUSPENDED" ? "PAST_DUE" : null,
        customPrice: s.customPrice ?? null,
        paymentMethod: s.pm ?? null,
      },
      customDomain,
      usage,
      notes: s.notes ?? "",
      source: s.source,
    });

    // ---- events
    if (s.source === "SELF_SIGNUP") {
      ev(id, "SIGNED_UP", `${s.name} signed up at ${s.slug}.edupro.com`, createdAt, "Institution");
    } else {
      ev(id, "SIGNED_UP", `Institution created by the platform owner (${s.slug}.edupro.com)`, createdAt, "Owner");
    }
    if (trialDays) ev(id, "TRIAL_STARTED", `${trialDays}-day free trial started on ${planById(s.plan).name}`, createdAt + MIN, "System");
    if (paying && trialDays) ev(id, "TRIAL_CONVERTED", `Trial converted to ${planById(s.upgradedFrom?.plan ?? s.plan).name} (${s.cycle.toLowerCase()})`, anchor, "Institution");
    if (s.trialExpired) ev(id, "TRIAL_EXPIRED", "Trial ended without a payment method — workspace closed", trialEndsAt as number, "System");
    rawInvoices
      .filter((inv) => inv.institutionId === id)
      .forEach((inv, i) => {
        const at = new Date(inv.issuedAt).getTime() + int(2, 90) * MIN;
        if (s.upgradedFrom && i === upgradeAtIndex)
          ev(id, "PLAN_UPGRADED", `Upgraded ${planById(s.upgradedFrom.plan).name} → ${planById(s.plan).name}`, new Date(inv.issuedAt).getTime() - 2 * H, "Institution");
        if (inv.status === "PAID") ev(id, "PAYMENT_SUCCEEDED", `Payment of $${inv.total.toLocaleString("en-US")} received`, at, "System");
        if (inv.status === "FAILED") {
          ev(id, "PAYMENT_FAILED", `Charge of $${inv.total.toLocaleString("en-US")} failed — card declined`, at, "System");
          if (s.status === "SUSPENDED") ev(id, "PAYMENT_FAILED", `Retry of $${inv.total.toLocaleString("en-US")} failed — insufficient funds`, at + 4 * D, "System");
        }
        if (inv.status === "OPEN") ev(id, "PAYMENT_FAILED", `bKash payment of $${inv.total.toLocaleString("en-US")} not completed — invoice open`, at, "System");
      });
    if (customDomain) {
      ev(id, "DOMAIN_ADDED", `Custom domain ${customDomain.domain} added`, new Date(customDomain.addedAt).getTime(), "Institution");
      if (customDomain.verifiedAt) ev(id, "DOMAIN_VERIFIED", `${customDomain.domain} verified — SSL issued`, new Date(customDomain.verifiedAt).getTime(), "System");
    }
    if (s.cancelAtPeriodEnd) ev(id, "CANCELLED", "Cancellation scheduled for the end of the billing period", now - int(2, 9) * D, "Institution");
    if (cancelledAt) ev(id, "CANCELLED", "Subscription cancelled", cancelledAt, "Institution");
    if (suspendedAt) ev(id, "SUSPENDED", `Suspended: ${s.suspendReason}`, suspendedAt, "Owner");
    if (s.notes) ev(id, "NOTE", s.notes, createdAt + int(1, 5) * D, "Owner");
  });

  // One refunded and one voided invoice for variety (old paid invoices of active tenants).
  const refund = rawInvoices.find((i) => i.institutionId === "inst-pixel-creators" && i.status === "PAID");
  if (refund) refund.status = "REFUNDED";
  const voided = rawInvoices.filter((i) => i.institutionId === "inst-rajshahi-model" && i.status === "PAID")[2];
  if (voided) Object.assign(voided, { status: "VOID" as InvoiceStatus, paidAt: null, description: `${voided.description} (duplicate — voided)` });
  if (refund) ev("inst-pixel-creators", "NOTE", `Invoice refunded — accidental double charge`, new Date(refund.issuedAt).getTime() + 2 * D, "Owner");

  // Numbering by issue order: EDP-<year>-<5-digit seq per year>.
  rawInvoices.sort((a, b) => a.issuedAt.localeCompare(b.issuedAt));
  const perYear: Record<string, number> = {};
  const invoices: SaasInvoice[] = rawInvoices.map((inv) => {
    const year = inv.issuedAt.slice(0, 4);
    perYear[year] = (perYear[year] ?? 0) + 1;
    return { ...inv, number: `EDP-${year}-${String(perYear[year]).padStart(5, "0")}` };
  });

  events.sort((a, b) => b.at.localeCompare(a.at));

  return { plans, institutions, invoices, events, currentInstitutionId: CURRENT_INSTITUTION_ID };
}
