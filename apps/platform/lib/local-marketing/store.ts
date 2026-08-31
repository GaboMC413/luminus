import fs from "fs";
import path from "path";

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
  unsubscribed: boolean;
  notes?: string;
  createdAt: string;
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

// Direccion de almacenamiento aislada en .local-data/email-marketing/
const DATA_DIR = path.join(process.cwd(), "..", "..", ".local-data", "email-marketing");
const CONTACTS_FILE = path.join(DATA_DIR, "contacts.json");
const CAMPAIGNS_FILE = path.join(DATA_DIR, "campaigns.json");
const LOGS_FILE = path.join(DATA_DIR, "logs.json");
const AUDIENCES_FILE = path.join(DATA_DIR, "audiences.json");

function ensureDirExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile<T>(filePath: string, defaultValue: T): T {
  try {
    ensureDirExists();
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), "utf8");
      return defaultValue;
    }
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Error reading local JSON file at ${filePath}:`, error);
    return defaultValue;
  }
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    ensureDirExists();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error(`Error writing local JSON file at ${filePath}:`, error);
  }
}

// ==========================================
// CONTACTS STORE
// ==========================================

export function getLocalContacts(): LocalContact[] {
  return readJsonFile<LocalContact[]>(CONTACTS_FILE, []);
}

export function saveLocalContact(
  contactData: Omit<LocalContact, "id" | "createdAt" | "unsubscribed"> & { id?: string; unsubscribed?: boolean }
): LocalContact {
  const contacts = getLocalContacts();
  const emailNormalized = contactData.email.trim().toLowerCase();

  const existingIndex = contacts.findIndex((c) => c.email.toLowerCase() === emailNormalized);

  if (existingIndex >= 0) {
    const updatedContact: LocalContact = {
      ...contacts[existingIndex],
      firstName: contactData.firstName.trim(),
      lastName: contactData.lastName.trim(),
      country: contactData.country !== undefined ? contactData.country : contacts[existingIndex].country,
      city: contactData.city !== undefined ? contactData.city : contacts[existingIndex].city,
      profession: contactData.profession !== undefined ? contactData.profession : contacts[existingIndex].profession,
      source: contactData.source !== undefined ? contactData.source : contacts[existingIndex].source,
      tags: Array.from(new Set(contactData.tags || [])),
      unsubscribed: contactData.unsubscribed ?? contacts[existingIndex].unsubscribed,
      notes: contactData.notes ?? contacts[existingIndex].notes,
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
      unsubscribed: contactData.unsubscribed ?? false,
      notes: contactData.notes || "",
      createdAt: new Date().toISOString(),
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
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    sentAt: new Date().toISOString(),
  };
  logs.unshift(newLog);
  // Limitar logs guardados a 1000 registros para no sobrecargar el disco
  const trimmed = logs.slice(0, 1000);
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
      contactCount: getLocalContacts().filter((c) => !c.unsubscribed).length,
      createdAt: new Date().toISOString(),
    },
    {
      id: "aud_posible_especialista",
      name: "Posibles Especialistas",
      description: "Contactos etiquetados como Posible Especialista.",
      tagFilter: "Posible Especialista",
      contactCount: getLocalContacts().filter((c) => !c.unsubscribed && c.tags.includes("Posible Especialista")).length,
      createdAt: new Date().toISOString(),
    },
  ];

  const audiences = readJsonFile<LocalAudience[]>(AUDIENCES_FILE, defaultAudiences);
  if (audiences.length === 0) {
    writeJsonFile(AUDIENCES_FILE, defaultAudiences);
    return defaultAudiences;
  }
  return audiences;
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
