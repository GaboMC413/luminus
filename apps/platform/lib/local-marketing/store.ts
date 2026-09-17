import fs from "fs";
import path from "path";
import { renderRelaunchNewsletterHtml } from "../mails/relaunchNewsletter";
import { renderVivianaNewsletterHtml } from "../mails/vivianaNewsletter";

export type ContactStatus = "ACTIVE" | "UNSUBSCRIBED" | "BOUNCED";

export interface LocalContact {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  country?: string;
  city?: string;
  profession?: string;
  source?: string;
  tags: string[];
  status?: ContactStatus;
  unsubscribed: boolean;
  bounced?: boolean;
  bounceReason?: string;
  notes?: string;
  createdAt?: string;
}

export interface LocalAudience {
  id: string;
  name: string;
  description?: string;
  countryFilter?: string;
  sourceFilter?: string;
  tagFilter?: string;
  professionFilter?: string;
  contactCount: number;
  createdAt: string;
}

export interface LocalCampaign {
  id: string;
  subject: string;
  previewText?: string;
  fromEmail: string;
  fromName: string;
  htmlContent: string;
  targetTags: string[]; // empty array means all non-unsubscribed contacts
  audienceId?: string;
  audienceName?: string;
  status: "DRAFT" | "SENDING" | "COMPLETED" | "PAUSED";
  sentCount: number;
  failedCount: number;
  openedCount?: number;
  clickedCount?: number;
  totalRecipients: number;
  createdAt: string;
  lastSentAt?: string;
}

export interface LocalSendLog {
  id: string;
  campaignId: string;
  recipientEmail: string;
  recipientName: string;
  status: "SUCCESS" | "FAILED" | "SKIPPED";
  messageId?: string;
  error?: string;
  sentAt: string;
  openedAt?: string;
  openCount?: number;
  clickedAt?: string;
  clickCount?: number;
}

function getLocalDataDir(): string {
  let curr = process.cwd();
  for (let i = 0; i < 6; i++) {
    const candidate = path.join(curr, ".local-data", "email-marketing");
    if (fs.existsSync(path.join(candidate, "contacts.json")) || fs.existsSync(candidate)) {
      return candidate;
    }
    const parent = path.dirname(curr);
    if (parent === curr) break;
    curr = parent;
  }
  return path.resolve(process.cwd(), ".local-data", "email-marketing");
}

const DATA_DIR = getLocalDataDir();
const CONTACTS_FILE = path.join(DATA_DIR, "contacts.json");
const CAMPAIGNS_FILE = path.join(DATA_DIR, "campaigns.json");
const LOGS_FILE = path.join(DATA_DIR, "logs.json");
const AUDIENCES_FILE = path.join(DATA_DIR, "audiences.json");

function readJsonFile<T>(filePath: string, defaultValue: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), "utf-8");
      return defaultValue;
    }
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return defaultValue;
  }
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
  }
}

// ==========================================
// CONTACTS STORE
// ==========================================

export function getLocalContacts(): LocalContact[] {
  const contacts = readJsonFile<LocalContact[]>(CONTACTS_FILE, []);
  return contacts.sort((a, b) => {
    let timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    let timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

    if (isNaN(timeA) || timeA === 0) {
      const matchA = a.id?.match(/^cnt_(\d+)_/);
      timeA = matchA ? parseInt(matchA[1], 10) : 0;
    }
    if (isNaN(timeB) || timeB === 0) {
      const matchB = b.id?.match(/^cnt_(\d+)_/);
      timeB = matchB ? parseInt(matchB[1], 10) : 0;
    }

    if (timeA !== timeB) {
      return timeB - timeA;
    }
    return (b.id || "").localeCompare(a.id || "");
  });
}

export function saveLocalContact(
  contactData: Omit<LocalContact, "id" | "unsubscribed" | "createdAt"> & {
    id?: string;
    unsubscribed?: boolean;
    bounced?: boolean;
    status?: ContactStatus;
    bounceReason?: string;
    createdAt?: string;
  }
): LocalContact {
  const contacts = getLocalContacts();
  const emailNormalized = contactData.email.trim().toLowerCase();

  const existingIndex = contacts.findIndex((c) => c.email.toLowerCase() === emailNormalized);

  const existing = existingIndex >= 0 ? contacts[existingIndex] : null;

  const isBounced = contactData.bounced ?? existing?.bounced ?? false;
  const isUnsub = contactData.unsubscribed ?? existing?.unsubscribed ?? false;

  let computedStatus: ContactStatus = contactData.status || existing?.status || "ACTIVE";
  if (isBounced || contactData.bounced) {
    computedStatus = "BOUNCED";
  } else if (isUnsub || contactData.unsubscribed) {
    computedStatus = "UNSUBSCRIBED";
  }

  if (existingIndex >= 0 && existing) {
    const updatedContact: LocalContact = {
      ...existing,
      firstName: contactData.firstName.trim(),
      lastName: contactData.lastName.trim(),
      country: contactData.country !== undefined ? contactData.country : existing.country,
      city: contactData.city !== undefined ? contactData.city : existing.city,
      profession: contactData.profession !== undefined ? contactData.profession : existing.profession,
      source: contactData.source !== undefined ? contactData.source : existing.source,
      tags: Array.from(new Set(contactData.tags || [])),
      status: computedStatus,
      unsubscribed: computedStatus === "UNSUBSCRIBED" || isUnsub,
      bounced: computedStatus === "BOUNCED" || isBounced,
      bounceReason: contactData.bounceReason ?? existing.bounceReason,
      notes: contactData.notes ?? existing.notes,
      createdAt: contactData.createdAt || existing.createdAt || new Date().toISOString(),
    };
    contacts[existingIndex] = updatedContact;
    writeJsonFile(CONTACTS_FILE, contacts);
    return updatedContact;
  } else {
    const newContact: LocalContact = {
      id: contactData.id || `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: emailNormalized,
      firstName: contactData.firstName.trim(),
      lastName: contactData.lastName.trim(),
      country: contactData.country || "",
      city: contactData.city || "",
      profession: contactData.profession || "",
      source: contactData.source || "",
      tags: Array.from(new Set(contactData.tags || [])),
      status: computedStatus,
      unsubscribed: computedStatus === "UNSUBSCRIBED" || Boolean(isUnsub),
      bounced: computedStatus === "BOUNCED" || Boolean(isBounced),
      bounceReason: contactData.bounceReason || "",
      notes: contactData.notes || "",
      createdAt: contactData.createdAt || new Date().toISOString(),
    };
    contacts.push(newContact);
    writeJsonFile(CONTACTS_FILE, contacts);
    return newContact;
  }
}

export function deleteLocalContact(id: string): boolean {
  const contacts = getLocalContacts();
  const filtered = contacts.filter((c) => c.id !== id);
  if (filtered.length !== contacts.length) {
    writeJsonFile(CONTACTS_FILE, filtered);
    return true;
  }
  return false;
}

export function bulkImportContacts(
  items: {
    email: string;
    firstName?: string;
    lastName?: string;
    country?: string;
    city?: string;
    profession?: string;
    source?: string;
    tags?: string[];
    notes?: string;
  }[]
): { added: number; updated: number } {
  const contacts = getLocalContacts();
  let added = 0;
  let updated = 0;

  for (const item of items) {
    if (!item.email || !item.email.includes("@")) continue;
    const normEmail = item.email.trim().toLowerCase();
    const existingIndex = contacts.findIndex((c) => c.email.toLowerCase() === normEmail);

    if (existingIndex >= 0) {
      contacts[existingIndex] = {
        ...contacts[existingIndex],
        firstName: item.firstName?.trim() || contacts[existingIndex].firstName,
        lastName: item.lastName?.trim() || contacts[existingIndex].lastName,
        country: item.country?.trim() || contacts[existingIndex].country,
        city: item.city?.trim() || contacts[existingIndex].city,
        profession: item.profession?.trim() || contacts[existingIndex].profession,
        source: item.source?.trim() || contacts[existingIndex].source,
        tags: Array.from(new Set([...contacts[existingIndex].tags, ...(item.tags || [])])),
        notes: item.notes || contacts[existingIndex].notes,
      };
      updated++;
    } else {
      contacts.push({
        id: `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        email: normEmail,
        firstName: item.firstName?.trim() || "",
        lastName: item.lastName?.trim() || "",
        country: item.country?.trim() || "",
        city: item.city?.trim() || "",
        profession: item.profession?.trim() || "",
        source: item.source?.trim() || "",
        tags: item.tags || ["Importación"],
        unsubscribed: false,
        notes: item.notes || "",
        createdAt: new Date().toISOString(),
      });
      added++;
    }
  }

  writeJsonFile(CONTACTS_FILE, contacts);
  return { added, updated };
}

// ==========================================
// CAMPAIGNS STORE
// ==========================================

export function getLocalCampaigns(): LocalCampaign[] {
  return readJsonFile<LocalCampaign[]>(CAMPAIGNS_FILE, []);
}

export function getLocalCampaignById(id: string): LocalCampaign | null {
  const campaigns = getLocalCampaigns();
  return campaigns.find((c) => c.id === id) || null;
}

export function saveLocalCampaign(
  campaignData: Omit<LocalCampaign, "id" | "createdAt" | "sentCount" | "failedCount" | "totalRecipients" | "status"> & {
    id?: string;
    status?: LocalCampaign["status"];
    sentCount?: number;
    failedCount?: number;
    totalRecipients?: number;
  }
): LocalCampaign {
  const campaigns = getLocalCampaigns();

  if (campaignData.id) {
    const existingIndex = campaigns.findIndex((c) => c.id === campaignData.id);
    if (existingIndex >= 0) {
      const updated: LocalCampaign = {
        ...campaigns[existingIndex],
        subject: campaignData.subject,
        previewText: campaignData.previewText,
        fromEmail: campaignData.fromEmail,
        fromName: campaignData.fromName,
        htmlContent: campaignData.htmlContent,
        targetTags: campaignData.targetTags,
        status: campaignData.status ?? campaigns[existingIndex].status,
        sentCount: campaignData.sentCount ?? campaigns[existingIndex].sentCount,
        failedCount: campaignData.failedCount ?? campaigns[existingIndex].failedCount,
        totalRecipients: campaignData.totalRecipients ?? campaigns[existingIndex].totalRecipients,
      };
      campaigns[existingIndex] = updated;
      writeJsonFile(CAMPAIGNS_FILE, campaigns);
      return updated;
    }
  }

  const newCampaign: LocalCampaign = {
    id: `cmp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    subject: campaignData.subject,
    previewText: campaignData.previewText || "",
    fromEmail: campaignData.fromEmail,
    fromName: campaignData.fromName,
    htmlContent: campaignData.htmlContent,
    targetTags: campaignData.targetTags || [],
    status: campaignData.status || "DRAFT",
    sentCount: campaignData.sentCount || 0,
    failedCount: campaignData.failedCount || 0,
    totalRecipients: campaignData.totalRecipients || 0,
    createdAt: new Date().toISOString(),
  };

  campaigns.unshift(newCampaign);
  writeJsonFile(CAMPAIGNS_FILE, campaigns);
  return newCampaign;
}

export function deleteLocalCampaign(id: string): boolean {
  const campaigns = getLocalCampaigns();
  const filtered = campaigns.filter((c) => c.id !== id);
  if (filtered.length !== campaigns.length) {
    writeJsonFile(CAMPAIGNS_FILE, filtered);
    return true;
  }
  return false;
}

// ==========================================
// LOGS STORE
// ==========================================

export function getLocalSendLogs(campaignId?: string): LocalSendLog[] {
  const logs = readJsonFile<LocalSendLog[]>(LOGS_FILE, []);
  if (campaignId) {
    return logs.filter((l) => l.campaignId === campaignId);
  }
  return logs;
}

export function addLocalSendLog(log: Omit<LocalSendLog, "id" | "sentAt">): LocalSendLog {
  const logs = getLocalSendLogs();
  const newLog: LocalSendLog = {
    ...log,
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    sentAt: new Date().toISOString(),
  };
  logs.unshift(newLog);
  // Limitar logs guardados a 1000 registros para no sobrecargar el disco
  const trimmed = logs.slice(0, 20000);
  writeJsonFile(LOGS_FILE, trimmed);
  return newLog;
}

export function recordLogOpen(logId: string): boolean {
  const logs = getLocalSendLogs();
  const index = logs.findIndex((l) => l.id === logId);
  if (index >= 0) {
    logs[index] = {
      ...logs[index],
      openedAt: logs[index].openedAt || new Date().toISOString(),
      openCount: (logs[index].openCount || 0) + 1,
    };
    writeJsonFile(LOGS_FILE, logs);
    return true;
  }
  return false;
}

export function recordLogClick(logId: string): boolean {
  const logs = getLocalSendLogs();
  const index = logs.findIndex((l) => l.id === logId);
  if (index >= 0) {
    logs[index] = {
      ...logs[index],
      clickedAt: logs[index].clickedAt || new Date().toISOString(),
      clickCount: (logs[index].clickCount || 0) + 1,
    };
    writeJsonFile(LOGS_FILE, logs);
    return true;
  }
  return false;
}

// ==========================================
// AUDIENCES STORE
// ==========================================

export function getLocalAudiences(): LocalAudience[] {
  const defaultAudiences: LocalAudience[] = [
    {
      id: "aud_all",
      name: "Todos los Contactos",
      description: "Base completa de contactos activos y no desuscritos.",
      contactCount: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: "aud_posible_especialista",
      name: "Posibles Especialistas",
      description: "Contactos etiquetados como Posible Especialista.",
      tagFilter: "Posible Especialista",
      contactCount: 0,
      createdAt: new Date().toISOString(),
    },
  ];

  let audiences = readJsonFile<LocalAudience[]>(AUDIENCES_FILE, defaultAudiences);
  if (audiences.length === 0) {
    audiences = defaultAudiences;
  }

  // Recalcular el conteo de contactos dinámicamente según los contactos ACTIVOS
  const contacts = getLocalContacts().filter(
    (c) => (c.status ? c.status === "ACTIVE" : !c.unsubscribed && !c.bounced)
  );

  return audiences.map((aud) => {
    let count = 0;
    if (aud.id === "aud_all") {
      count = contacts.length;
    } else {
      let filtered = contacts;
      if (aud.countryFilter) {
        filtered = filtered.filter((c) => c.country?.toLowerCase() === aud.countryFilter?.toLowerCase());
      }
      if (aud.sourceFilter) {
        filtered = filtered.filter((c) => c.source?.toLowerCase() === aud.sourceFilter?.toLowerCase());
      }
      if (aud.tagFilter) {
        filtered = filtered.filter((c) => c.tags.includes(aud.tagFilter!));
      }
      if (aud.professionFilter) {
        filtered = filtered.filter((c) => c.profession?.toLowerCase() === aud.professionFilter?.toLowerCase());
      }
      count = filtered.length;
    }
    return { ...aud, contactCount: count };
  });
}

export function getLocalAudienceById(id: string): LocalAudience | null {
  const audiences = getLocalAudiences();
  return audiences.find((a) => a.id === id) || null;
}

export function saveLocalAudience(
  audienceData: Omit<LocalAudience, "id" | "createdAt" | "contactCount"> & { id?: string; contactCount?: number }
): LocalAudience {
  const audiences = getLocalAudiences();
  const contacts = getLocalContacts().filter((c) => !c.unsubscribed);

  let count = audienceData.contactCount;
  if (count === undefined) {
    let filtered = contacts;
    if (audienceData.countryFilter) {
      filtered = filtered.filter((c) => c.country?.toLowerCase() === audienceData.countryFilter?.toLowerCase());
    }
    if (audienceData.sourceFilter) {
      filtered = filtered.filter((c) => c.source?.toLowerCase() === audienceData.sourceFilter?.toLowerCase());
    }
    if (audienceData.tagFilter) {
      filtered = filtered.filter((c) => c.tags.includes(audienceData.tagFilter!));
    }
    if (audienceData.professionFilter) {
      filtered = filtered.filter((c) => c.profession?.toLowerCase() === audienceData.professionFilter?.toLowerCase());
    }
    count = filtered.length;
  }

  if (audienceData.id) {
    const idx = audiences.findIndex((a) => a.id === audienceData.id);
    if (idx >= 0) {
      const updated: LocalAudience = {
        ...audiences[idx],
        name: audienceData.name,
        description: audienceData.description || "",
        countryFilter: audienceData.countryFilter || "",
        sourceFilter: audienceData.sourceFilter || "",
        tagFilter: audienceData.tagFilter || "",
        professionFilter: audienceData.professionFilter || "",
        contactCount: count,
      };
      audiences[idx] = updated;
      writeJsonFile(AUDIENCES_FILE, audiences);
      return updated;
    }
  }

  const newAudience: LocalAudience = {
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: audienceData.name,
    description: audienceData.description || "",
    countryFilter: audienceData.countryFilter || "",
    sourceFilter: audienceData.sourceFilter || "",
    tagFilter: audienceData.tagFilter || "",
    professionFilter: audienceData.professionFilter || "",
    contactCount: count,
    createdAt: new Date().toISOString(),
  };

  audiences.unshift(newAudience);
  writeJsonFile(AUDIENCES_FILE, audiences);
  return newAudience;
}

export function deleteLocalAudience(id: string): boolean {
  const audiences = getLocalAudiences();
  const filtered = audiences.filter((a) => a.id !== id);
  if (filtered.length !== audiences.length) {
    writeJsonFile(AUDIENCES_FILE, filtered);
    return true;
  }
  return false;
}
