"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import SelectInput from "@/components/ui/SelectInput";
import {
  Users,
  Mail,
  Send,
  Plus,
  Trash2,
  Edit2,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Clock,
  Play,
  RefreshCw,
  Eye,
  ShieldCheck,
  Tag,
  Search,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Code,
  FileText,
  BarChart3,
  Target,
  Filter,
} from "lucide-react";

interface Contact {
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

interface Campaign {
  id: string;
  subject: string;
  previewText?: string;
  fromEmail: string;
  fromName: string;
  htmlContent: string;
  targetTags: string[];
  audienceId?: string;
  audienceName?: string;
  status: "DRAFT" | "SENDING" | "COMPLETED" | "PAUSED";
  sentCount: number;
  failedCount: number;
  totalRecipients: number;
  createdAt: string;
  lastSentAt?: string;
  sentAt?: string;
}

interface Audience {
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

interface SendLog {
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

const DEFAULT_TEMPLATES = [
  {
    name: "Boletín Informativo LUMINUS",
    subject: "✨ Novedades y reflexiones para tu bienestar esta semana",
    html: `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
  <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 32px 24px; text-align: center;">
    <h1 style="margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; color: #38bdf8;">LUMINUS LATAM</h1>
    <p style="margin-top: 8px; font-size: 14px; color: #94a3b8;">Espacio de Bienestar Integral & Desarrollo Personal</p>
  </div>
  <div style="padding: 32px 24px; color: #334155; line-height: 1.7; font-size: 16px;">
    <h2 style="color: #0f172a; font-size: 20px; margin-top: 0;">¡Hola {{nombre}}! 👋</h2>
    <p>Queríamos compartir contigo nuevas lecturas e información relevante diseñada para acompañarte en tu día a día.</p>
    <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 16px 20px; border-radius: 4px; margin: 24px 0;">
      <p style="margin: 0; font-weight: 500; color: #0369a1;">"El bienestar no es la ausencia de estrés, sino la capacidad de responder a él con consciencia y equilibrio."</p>
    </div>
    <p>Te invitamos a explorar las novedades disponibles en nuestra plataforma local.</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://luminuslatam.com" style="background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">Ver novedades</a>
    </div>
    <p style="margin-bottom: 0;">Con afecto,<br><strong>El equipo de LUMINUS LATAM</strong></p>
  </div>
  <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
    <p style="margin: 0 0 8px 0;">Recibiste este correo porque estás registrado en nuestra lista de novedades local.</p>
    <p style="margin: 0;"><a href="{{link_desuscripcion}}" style="color: #0284c7; text-decoration: underline;">Desuscribirme de estos correos</a></p>
  </div>
</div>`,
  },
  {
    name: "Invitación a Evento / Taller",
    subject: "🗓️ Quedan pocos lugares: Taller Exclusivo de Salud Integral",
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
  <div style="background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); color: #ffffff; padding: 36px 24px; text-align: center;">
    <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Invitación Especial</span>
    <h1 style="margin: 16px 0 0 0; font-size: 24px;">Taller de Salud Integral & Mindset</h1>
  </div>
  <div style="padding: 32px 24px; color: #334155; line-height: 1.6;">
    <p>Estimado/a <strong>{{nombre}}</strong>,</p>
    <p>Nos complace invitarte a nuestra próxima sesión online en vivo enfocada en herramientas prácticas para potenciar tu energía y enfoque diario.</p>
    <ul style="background: #f8fafc; padding: 20px 20px 20px 40px; border-radius: 8px;">
      <li><strong>Fecha:</strong> Próximo Jueves</li>
      <li><strong>Hora:</strong> 18:00 hs (GMT-3)</li>
      <li><strong>Modalidad:</strong> Acceso Online Gratuito</li>
    </ul>
    <div style="text-align: center; margin: 28px 0;">
      <a href="https://luminuslatam.com" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">Reservar mi lugar</a>
    </div>
  </div>
  <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
    <a href="{{link_desuscripcion}}" style="color: #4f46e5;">Desuscribirme</a>
  </div>
</div>`,
  },
];

export default function LocalEmailMarketingPage() {
  // Contacts State
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Form State Contact
  const [contactForm, setContactForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    country: "",
    city: "",
    profession: "",
    source: "",
    tags: "",
    notes: "",
  });

  // Filter and Pagination states
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>("ALL");
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>("ALL");
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 50;

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCountryFilter, selectedSourceFilter, selectedTagFilter]);

  // File / CSV Import State
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importMode, setImportMode] = useState<"file" | "text">("file");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [csvText, setCsvText] = useState("");

  const handleFileUploadImport = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert("Por favor selecciona al menos un archivo (.xlsx, .xls, .csv).");
      return;
    }

    setIsUploadingFile(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetch("/api/admin/email-marketing/contacts/import-file", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(
          `🎉 ¡Procesados ${data.processedFilesCount} archivo(s) con éxito!\n- ${data.added} nuevos contactos agregados.\n- ${data.updated} contactos existentes actualizados.`
        );
        fetchContacts();
        setIsImportOpen(false);
        setSelectedFiles([]);
      } else {
        alert(data.error || "No se pudieron procesar los archivos.");
      }
    } catch (e: any) {
      alert("Error al subir e importar los archivos.");
    } finally {
      setIsUploadingFile(false);
    }
  };

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<"contacts" | "audiences" | "campaigns" | "send">("contacts");

  // Audiences State
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [isCreateAudienceModalOpen, setIsCreateAudienceModalOpen] = useState(false);
  const [newAudience, setNewAudience] = useState({
    name: "",
    description: "",
    countryFilter: "",
    sourceFilter: "",
    tagFilter: "",
    professionFilter: "",
  });

  // Campaigns State
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [logs, setLogs] = useState<SendLog[]>([]);
  const [currentCampaign, setCurrentCampaign] = useState<{
    id?: string;
    subject: string;
    previewText: string;
    fromEmail: string;
    fromName: string;
    htmlContent: string;
    targetTags: string[];
    audienceId?: string;
    audienceName?: string;
    status?: string;
    sentAt?: string;
    lastSentAt?: string;
    createdAt?: string;
    sentCount?: number;
    totalTarget?: number;
  }>({
    subject: "",
    previewText: "",
    fromEmail: "info@luminuslatam.com",
    fromName: "LUMINUS LATAM",
    htmlContent: DEFAULT_TEMPLATES[0].html,
    targetTags: [],
    audienceId: "aud_all",
    audienceName: "Todos los Contactos",
    status: "DRAFT",
  });
  const [campaignViewMode, setCampaignViewMode] = useState<"list" | "editor">("list");
  const [campaignListFilter, setCampaignListFilter] = useState<"ALL" | "DRAFT" | "COMPLETED">("ALL");
  const [isCreateCampaignModalOpen, setIsCreateCampaignModalOpen] = useState(false);
  const [logSearchQuery, setLogSearchQuery] = useState("");

  // Send & Test State
  const [testEmail, setTestEmail] = useState("gabrielmedcap@hotmail.com");
  const [sendingTest, setSendingTest] = useState(false);
  const [testStatus, setTestStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [batchSending, setBatchSending] = useState(false);
  const [batchStatus, setBatchStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [selectedCampaignForBatch, setSelectedCampaignForBatch] = useState<string>("");

  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [viewCode, setViewCode] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchContacts();
    fetchAudiences();
    fetchCampaigns();
  }, []);

  const fetchAudiences = async () => {
    try {
      const res = await fetch("/api/admin/email-marketing/audiences");
      if (res.ok) {
        const data = await res.json();
        setAudiences(data.audiences || []);
      }
    } catch (e) {
      console.error("Error fetching audiences:", e);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await fetch("/api/admin/email-marketing/contacts");
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts || []);
      }
    } catch (e) {
      console.error("Error fetching contacts:", e);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/admin/email-marketing/campaigns");
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error("Error fetching campaigns:", e);
    }
  };

  // Handle Contact Save
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.email.includes("@")) {
      alert("Por favor ingresa un correo electrónico válido.");
      return;
    }

    const tagsArray = contactForm.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/admin/email-marketing/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingContact?.id,
          email: contactForm.email,
          firstName: contactForm.firstName,
          lastName: contactForm.lastName,
          country: contactForm.country,
          city: contactForm.city,
          profession: contactForm.profession,
          source: contactForm.source,
          tags: tagsArray,
          notes: contactForm.notes,
        }),
      });

      if (res.ok) {
        fetchContacts();
        setIsAddContactOpen(false);
        setEditingContact(null);
        setContactForm({
          email: "",
          firstName: "",
          lastName: "",
          country: "",
          city: "",
          profession: "",
          source: "",
          tags: "",
          notes: "",
        });
      } else {
        const err = await res.json();
        alert(err.error || "Error al guardar el contacto.");
      }
    } catch (e) {
      alert("Error al conectar con la API local.");
    }
  };

  // Handle Delete Contact
  const handleDeleteContact = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este contacto de tu lista local?")) return;
    try {
      const res = await fetch(`/api/admin/email-marketing/contacts?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchContacts();
      }
    } catch (e) {
      alert("Error al eliminar contacto.");
    }
  };

  // Handle CSV Import
  const handleCsvImport = async () => {
    if (!csvText.trim()) return;

    const lines = csvText.split("\n").map((l) => l.trim()).filter(Boolean);
    const items = [];

    for (const line of lines) {
      if (line.toLowerCase().startsWith("email")) continue;
      const parts = line.split(",").map((p) => p.trim().replace(/^["']|["']$/g, ""));
      if (parts[0] && parts[0].includes("@")) {
        items.push({
          email: parts[0],
          firstName: parts[1] || "",
          lastName: parts[2] || "",
          tags: parts[3] ? parts[3].split(";").map((t) => t.trim()) : ["Importación CSV"],
        });
      }
    }

    if (items.length === 0) {
      alert("No se encontraron líneas válidas con correos electrónicos en el texto pegado.");
      return;
    }

    try {
      const res = await fetch("/api/admin/email-marketing/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulk_import", items }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(`✨ Importación exitosa: ${data.added} agregados, ${data.updated} actualizados.`);
        fetchContacts();
        setIsImportOpen(false);
        setCsvText("");
      }
    } catch (e) {
      alert("Error al importar contactos.");
    }
  };

  // Handle Save Audience
  const handleSaveAudience = async () => {
    if (!newAudience.name.trim()) {
      alert("Ingresa un nombre para la audiencia.");
      return;
    }

    try {
      const res = await fetch("/api/admin/email-marketing/audiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAudience),
      });

      if (res.ok) {
        const data = await res.json();
        alert("✅ Audiencia guardada con éxito.");
        fetchAudiences();
        setIsCreateAudienceModalOpen(false);
        setNewAudience({
          name: "",
          description: "",
          countryFilter: "",
          sourceFilter: "",
          tagFilter: "",
          professionFilter: "",
        });
        if (data.audience) {
          setCurrentCampaign((prev) => ({
            ...prev,
            audienceId: data.audience.id,
            audienceName: data.audience.name,
          }));
        }
      }
    } catch (e) {
      alert("Error al guardar audiencia.");
    }
  };

  // Handle Delete Audience
  const handleDeleteAudience = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta audiencia guardada?")) return;
    try {
      const res = await fetch(`/api/admin/email-marketing/audiences?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchAudiences();
      }
    } catch (e) {
      alert("Error al eliminar audiencia.");
    }
  };

  // Handle Save Campaign
  const handleSaveCampaign = async (showAlert: boolean = true) => {
    if (!currentCampaign.subject.trim()) {
      alert("Por favor escribe un asunto para la campaña.");
      return null;
    }

    try {
      const res = await fetch("/api/admin/email-marketing/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentCampaign),
      });

      if (res.ok) {
        const data = await res.json();
        if (showAlert) {
          alert("✅ Campaña guardada localmente como borrador.");
        }
        fetchCampaigns();
        const savedId = data.campaign?.id || currentCampaign.id;
        if (savedId) {
          setCurrentCampaign((prev) => ({ ...prev, id: savedId }));
          setSelectedCampaignForBatch(savedId);
          return savedId;
        }
      }
    } catch (e) {
      alert("Error al guardar la campaña.");
    }
    return null;
  };

  // Handle Test Send
  const handleSendTestEmail = async () => {
    if (!testEmail.includes("@")) {
      alert("Ingresa un correo de prueba válido.");
      return;
    }

    setSendingTest(true);
    setTestStatus(null);

    try {
      const res = await fetch("/api/admin/email-marketing/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: testEmail,
          subject: currentCampaign.subject || "Prueba de Campaña Local",
          fromEmail: currentCampaign.fromEmail,
          fromName: currentCampaign.fromName,
          htmlContent: currentCampaign.htmlContent,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestStatus({
          type: "success",
          msg: `¡Correo de prueba enviado con éxito! MessageId: ${data.messageId}`,
        });
      } else {
        setTestStatus({
          type: "error",
          msg: data.error || "No se pudo enviar el correo de prueba.",
        });
      }
    } catch (e: any) {
      setTestStatus({ type: "error", msg: "Error al comunicarse con AWS SES en local." });
    } finally {
      setSendingTest(false);
    }
  };

  // Handle Batch Send
  const handleStartBatchSend = async (campaignId: string) => {
    const cmp = campaigns.find((c) => c.id === campaignId);
    if (!cmp) return;

    if (
      !confirm(
        `🚀 ¿Confirmas enviar la campaña "${cmp.subject}" a la lista de contactos seleccionada vía AWS SES?`
      )
    ) {
      return;
    }

    setBatchSending(true);
    setBatchStatus(null);

    try {
      const res = await fetch("/api/admin/email-marketing/send-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, delayMs: 250 }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBatchStatus({
          type: "success",
          msg: `🎉 ¡Envío masivo completado! Enviados: ${data.sent}, Fallidos: ${data.failed} de ${data.total} contactos.`,
        });
        fetchCampaigns();
      } else {
        setBatchStatus({
          type: "error",
          msg: data.error || "Fallo el envío masivo.",
        });
      }
    } catch (e) {
      setBatchStatus({ type: "error", msg: "Error de red durante el envío masivo." });
    } finally {
      setBatchSending(false);
    }
  };

  // Filter contacts
  const allTags = Array.from(new Set(contacts.flatMap((c) => c.tags || [])));
  const allCountries = Array.from(new Set(contacts.map((c) => c.country).filter(Boolean))) as string[];
  const allSources = Array.from(new Set(contacts.map((c) => c.source).filter(Boolean))) as string[];
  const allProfessions = Array.from(new Set(contacts.map((c) => c.profession).filter(Boolean))) as string[];

  const filteredContacts = contacts.filter((c) => {
    const matchesTag = selectedTagFilter === "ALL" || c.tags.includes(selectedTagFilter);
    const matchesCountry = selectedCountryFilter === "ALL" || c.country === selectedCountryFilter;
    const matchesSource = selectedSourceFilter === "ALL" || c.source === selectedSourceFilter;

    return matchesTag && matchesCountry && matchesSource;
  });

  const totalFiltered = filteredContacts.length;
  const totalPages = Math.ceil(totalFiltered / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedContacts = filteredContacts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-900 font-sans antialiased">
      {/* Sticky LUMINUS Admin Header Bar */}
      <header className="sticky top-0 z-40 w-full h-[64px] bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-2.5">
            <img src="/logo-luminus-black.svg" alt="Luminus" className="h-[20px] cursor-pointer" />
          </Link>
          <span className="px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase bg-slate-100 text-slate-700 rounded-md border border-slate-200">
            Email Marketing
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("contacts")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "contacts"
                ? "bg-black text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4" /> Contactos ({contacts.length})
          </button>
          <button
            onClick={() => setActiveTab("audiences")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "audiences"
                ? "bg-black text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Target className="w-4 h-4" /> Audiencias ({audiences.length})
          </button>
          <button
            onClick={() => setActiveTab("campaigns")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "campaigns"
                ? "bg-black text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Mail className="w-4 h-4" /> Campañas
          </button>
          <button
            onClick={() => setActiveTab("send")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "send"
                ? "bg-black text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Send className="w-4 h-4" /> Envíos
          </button>
        </div>

        {/* TAB 1: BASE DE CONTACTOS */}
        {activeTab === "contacts" && (
          <div className="space-y-6">
            {/* Top Actions & Multi-Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              {/* Selectors Group */}
              <div className="flex flex-wrap items-center gap-2.5">
                <SelectInput
                  value={selectedCountryFilter}
                  options={[
                    { label: "Todos los países", value: "ALL" },
                    ...allCountries.map((c) => ({ label: c, value: c })),
                  ]}
                  onSelect={(val) => setSelectedCountryFilter(val)}
                  placeholder="Todos los países"
                  className="w-full sm:w-[170px]"
                />

                <SelectInput
                  value={selectedSourceFilter}
                  options={[
                    { label: "Todos los orígenes", value: "ALL" },
                    ...allSources.map((s) => ({ label: s, value: s })),
                  ]}
                  onSelect={(val) => setSelectedSourceFilter(val)}
                  placeholder="Todos los orígenes"
                  className="w-full sm:w-[170px]"
                />

                <SelectInput
                  value={selectedTagFilter}
                  options={[
                    { label: "Todas las etiquetas", value: "ALL" },
                    ...allTags.map((tag) => ({ label: tag, value: tag })),
                  ]}
                  onSelect={(val) => setSelectedTagFilter(val)}
                  placeholder="Todas las etiquetas"
                  className="w-full sm:w-[190px]"
                />
              </div>

              {/* Action Buttons Group */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    setEditingContact(null);
                    setContactForm({
                      email: "",
                      firstName: "",
                      lastName: "",
                      country: "",
                      city: "",
                      profession: "",
                      source: "",
                      tags: "",
                      notes: "",
                    });
                    setIsAddContactOpen(true);
                  }}
                  className="flex items-center gap-1.5 bg-black hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-xs cursor-pointer h-11"
                >
                  <Plus className="w-4 h-4" /> Nuevo contacto
                </button>
                <button
                  onClick={() => setIsImportOpen(true)}
                  className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-xs cursor-pointer h-11"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Importar lista
                </button>
              </div>
            </div>

            {/* Results Summary Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Audiencia seleccionada:</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-bold text-xs">
                  {totalFiltered} {totalFiltered === 1 ? "contacto" : "contactos"}
                </span>
                {totalFiltered !== contacts.length && (
                  <span className="text-slate-400">(de {contacts.length} totales en la base)</span>
                )}
              </div>

              {totalFiltered > 0 && (
                <div className="text-slate-500">
                  Mostrando <span className="font-semibold text-slate-800">{startIndex + 1}</span> -{" "}
                  <span className="font-semibold text-slate-800">
                    {Math.min(startIndex + itemsPerPage, totalFiltered)}
                  </span>
                </div>
              )}
            </div>

            {/* Contacts Table Container */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50/80 text-slate-500 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5">Contacto</th>
                      <th className="px-6 py-3.5">Ubicación</th>
                      <th className="px-6 py-3.5">Profesión</th>
                      <th className="px-6 py-3.5">Origen</th>
                      <th className="px-6 py-3.5">Etiquetas</th>
                      <th className="px-6 py-3.5">Estado</th>
                      <th className="px-6 py-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedContacts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                          <Users className="w-10 h-10 mx-auto mb-3 opacity-30 text-slate-400" />
                          No se encontraron contactos con los filtros seleccionados.
                        </td>
                      </tr>
                    ) : (
                      paginatedContacts.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-6 py-3.5">
                            <div className="font-semibold text-slate-900">
                              {c.firstName || c.lastName
                                ? `${c.firstName} ${c.lastName}`
                                : "Sin nombre registrado"}
                            </div>
                            <div className="text-slate-500 text-xs font-mono">{c.email}</div>
                          </td>
                          <td className="px-6 py-3.5 text-xs font-medium text-slate-700">
                            {c.country || c.city ? (
                              <div>
                                <span>{c.country || "Sin País"}</span>
                                {c.city && <span className="text-slate-400 text-[11px] block">{c.city}</span>}
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-3.5 text-xs text-slate-700 max-w-xs truncate">
                            {c.profession || <span className="text-slate-400">-</span>}
                          </td>
                          <td className="px-6 py-3.5">
                            {c.source ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                                {c.source}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">-</span>
                            )}
                          </td>
                          <td className="px-6 py-3.5">
                            <div className="flex flex-wrap gap-1">
                              {c.tags && c.tags.length > 0 ? (
                                c.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2.5 py-0.5 rounded-md text-xs bg-sky-50 text-sky-700 border border-sky-200 font-medium"
                                  >
                                    {tag}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-400 text-xs">-</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-3.5">
                            {c.unsubscribed ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                                Desuscrito
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                                Activo
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-3.5 text-right space-x-1">
                            <button
                              onClick={() => {
                                setEditingContact(c);
                                setContactForm({
                                  email: c.email,
                                  firstName: c.firstName,
                                  lastName: c.lastName,
                                  country: c.country || "",
                                  city: c.city || "",
                                  profession: c.profession || "",
                                  source: c.source || "",
                                  tags: c.tags.join(", "),
                                  notes: c.notes || "",
                                });
                                setIsAddContactOpen(true);
                              }}
                              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteContact(c.id)}
                              className="p-1.5 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 bg-slate-50/50 px-6 py-3">
                  <div className="text-xs text-slate-500">
                    Página <span className="font-bold text-slate-800">{currentPage}</span> de{" "}
                    <span className="font-bold text-slate-800">{totalPages}</span> (50 por página)
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium text-slate-700 transition shadow-xs cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Anterior
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2)
                        .map((page, idx, arr) => {
                          const prevPage = arr[idx - 1];
                          const showEllipsis = prevPage && page - prevPage > 1;
                          return (
                            <React.Fragment key={page}>
                              {showEllipsis && <span className="px-1 text-slate-400 text-xs">...</span>}
                              <button
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                  currentPage === page
                                    ? "bg-black text-white shadow-xs"
                                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                                }`}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          );
                        })}
                    </div>

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium text-slate-700 transition shadow-xs cursor-pointer"
                    >
                      Siguiente <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: AUDIENCIAS */}
        {activeTab === "audiences" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600" /> Audiencias & Segmentos Guardados
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Crea y administra segmentos objetivos en tu base de contactos para tus campañas.
                </p>
              </div>
              <button
                onClick={() => setIsCreateAudienceModalOpen(true)}
                className="bg-black hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" /> Crear Audiencia
              </button>
            </div>

            {/* Audiences Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {audiences.map((aud) => (
                <div
                  key={aud.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">{aud.name}</h3>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                        {aud.contactCount} contactos
                      </span>
                    </div>
                    {aud.description && (
                      <p className="text-xs text-slate-500 line-clamp-2">{aud.description}</p>
                    )}
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Criterios de Filtro:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {aud.countryFilter && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          País: {aud.countryFilter}
                        </span>
                      )}
                      {aud.sourceFilter && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          Origen: {aud.sourceFilter}
                        </span>
                      )}
                      {aud.tagFilter && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
                          Etiqueta: {aud.tagFilter}
                        </span>
                      )}
                      {aud.professionFilter && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          Profesión: {aud.professionFilter}
                        </span>
                      )}
                      {!aud.countryFilter && !aud.sourceFilter && !aud.tagFilter && !aud.professionFilter && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Toda la base (Sin filtros)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setCurrentCampaign((prev) => ({
                          ...prev,
                          audienceId: aud.id,
                          audienceName: aud.name,
                        }));
                        setActiveTab("campaigns");
                        setCampaignViewMode("editor");
                      }}
                      className="text-xs font-semibold text-slate-900 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                    >
                      Usar en Campaña <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    {aud.id !== "aud_all" && (
                      <button
                        onClick={() => handleDeleteAudience(aud.id)}
                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar Audiencia"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CAMPAÑAS */}
        {activeTab === "campaigns" && (
          <div>
            {/* VIEW 1: CAMPAIGN LIST */}
            {campaignViewMode === "list" && (
              <div className="space-y-6">
                {/* Top Header Bar & Status Filter Tabs */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Campañas</h2>
                      <p className="text-xs text-slate-500">Gestión de comunicados masivos y borradores.</p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl ml-4">
                      <button
                        onClick={() => setCampaignListFilter("ALL")}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          campaignListFilter === "ALL"
                            ? "bg-white text-slate-900 shadow-xs"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        Todas ({campaigns.length})
                      </button>
                      <button
                        onClick={() => setCampaignListFilter("DRAFT")}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          campaignListFilter === "DRAFT"
                            ? "bg-white text-slate-900 shadow-xs"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        Borradores ({campaigns.filter((c) => c.status !== "COMPLETED").length})
                      </button>
                      <button
                        onClick={() => setCampaignListFilter("COMPLETED")}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          campaignListFilter === "COMPLETED"
                            ? "bg-white text-slate-900 shadow-xs"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        Enviadas ({campaigns.filter((c) => c.status === "COMPLETED").length})
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsCreateCampaignModalOpen(true)}
                    className="flex items-center gap-1.5 bg-black hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-xs cursor-pointer h-11"
                  >
                    <Plus className="w-4 h-4" /> Crear campaña
                  </button>
                </div>

                {/* Campaigns Table */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-700">
                      <thead className="bg-slate-50/80 text-slate-500 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-3.5">Campaña / Asunto</th>
                          <th className="px-6 py-3.5">Estado</th>
                          <th className="px-6 py-3.5">Info de Envío</th>
                          <th className="px-6 py-3.5">Remitente</th>
                          <th className="px-6 py-3.5">Filtro Destino</th>
                          <th className="px-6 py-3.5 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {campaigns.filter((cmp) => {
                          if (campaignListFilter === "DRAFT") return cmp.status !== "COMPLETED";
                          if (campaignListFilter === "COMPLETED") return cmp.status === "COMPLETED";
                          return true;
                        }).length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                              <Mail className="w-10 h-10 mx-auto mb-3 opacity-30 text-slate-400" />
                              No hay campañas en esta categoría.
                            </td>
                          </tr>
                        ) : (
                          campaigns
                            .filter((cmp) => {
                              if (campaignListFilter === "DRAFT") return cmp.status !== "COMPLETED";
                              if (campaignListFilter === "COMPLETED") return cmp.status === "COMPLETED";
                              return true;
                            })
                            .map((cmp) => (
                              <tr key={cmp.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="px-6 py-3.5 font-semibold text-slate-900">
                                  {cmp.subject || "Sin asunto definido"}
                                </td>
                                <td className="px-6 py-3.5">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                      cmp.status === "COMPLETED"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : "bg-slate-100 text-slate-700 border-slate-200"
                                    }`}
                                  >
                                    {cmp.status === "COMPLETED" ? "Enviado" : "Borrador"}
                                  </span>
                                </td>
                                <td className="px-6 py-3.5 text-xs text-slate-600">
                                  {cmp.status === "COMPLETED" ? (
                                    <div className="space-y-0.5">
                                      <div className="font-semibold text-slate-800">
                                        {cmp.sentCount ? `${cmp.sentCount} entregados` : "Completado"}
                                      </div>
                                      {(cmp.lastSentAt || cmp.sentAt || cmp.createdAt) && (
                                        <div className="text-[11px] text-slate-400">
                                          {new Date(cmp.lastSentAt || cmp.sentAt || cmp.createdAt).toLocaleString("es-AR", {
                                            day: "2-digit",
                                            month: "short",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 font-mono text-[11px]">Sin enviar</span>
                                  )}
                                </td>
                                <td className="px-6 py-3.5 text-xs text-slate-600">
                                  {cmp.fromName} ({cmp.fromEmail})
                                </td>
                                <td className="px-6 py-3.5 text-xs">
                                  {cmp.targetTags && cmp.targetTags.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                      {cmp.targetTags.map((t) => (
                                        <span
                                          key={t}
                                          className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 text-xs"
                                        >
                                          {t}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-slate-400">Todos los contactos</span>
                                  )}
                                </td>
                                <td className="px-6 py-3.5 text-right space-x-2">
                                  {cmp.status === "COMPLETED" ? (
                                    <button
                                      onClick={() => {
                                        setCurrentCampaign({
                                          ...cmp,
                                          previewText: cmp.previewText || "",
                                        });
                                        setCampaignViewMode("editor");
                                      }}
                                      className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer shadow-xs inline-flex items-center gap-1"
                                    >
                                      <Eye className="w-3.5 h-3.5" /> Ver
                                    </button>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => {
                                          setCurrentCampaign({
                                            ...cmp,
                                            previewText: cmp.previewText || "",
                                          });
                                          setCampaignViewMode("editor");
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer shadow-xs"
                                      >
                                        Editar
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSelectedCampaignForBatch(cmp.id);
                                          setActiveTab("send");
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-black text-white hover:bg-slate-800 text-xs font-semibold transition cursor-pointer shadow-xs"
                                      >
                                        Enviar
                                      </button>
                                    </>
                                  )}
                                </td>
                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: CAMPAIGN EDITOR (50/50 SPLIT: LEFT=CONFIG, RIGHT=PREVIEW) */}
            {campaignViewMode === "editor" && (
              <div className="space-y-4">
                {/* Editor Header Bar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCampaignViewMode("list")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer shadow-xs"
                    >
                      <ChevronLeft className="w-4 h-4" /> Volver a campañas
                    </button>
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      {currentCampaign.subject || "Nueva campaña"}
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${
                          currentCampaign.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {currentCampaign.status === "COMPLETED" ? "Enviado (Solo Lectura)" : "Borrador"}
                      </span>
                    </h2>
                  </div>

                  {currentCampaign.status !== "COMPLETED" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          handleSaveCampaign();
                          setCampaignViewMode("list");
                        }}
                        className="bg-black hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs"
                      >
                        Guardar borrador
                      </button>
                    </div>
                  )}
                </div>

                {/* 50 / 50 SPLIT GRID (LEFT: CONFIG, RIGHT: PREVIEW) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* LEFT SIDE (50%): CONFIGURATION OR SENT ANALYTICS DASHBOARD */}
                  {currentCampaign.status === "COMPLETED" ? (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div>
                          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-emerald-600" /> Analítica & Reporte de Envío
                          </h2>
                          <p className="text-xs text-slate-500">Métricas reales de entrega vía AWS SES</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Salida AWS SES
                        </span>
                      </div>

                      {/* KPI Cards & Traceability Table */}
                      {(() => {
                        const cmpLogs = logs.filter((l) => l.campaignId === currentCampaign.id);
                        const successLogs = cmpLogs.filter((l) => l.status === "SUCCESS");
                        const failedLogs = cmpLogs.filter((l) => l.status === "FAILED");
                        const openedLogs = cmpLogs.filter((l) => l.openedAt);
                        const clickedLogs = cmpLogs.filter((l) => l.clickedAt);
                        const totalSentCount = currentCampaign.sentCount || cmpLogs.length || 0;
                        const deliveryRate =
                          totalSentCount > 0
                            ? Math.round((successLogs.length / totalSentCount) * 100)
                            : 100;
                        const openRate =
                          totalSentCount > 0
                            ? Math.round((openedLogs.length / totalSentCount) * 100)
                            : 0;
                        const clickRate =
                          totalSentCount > 0
                            ? Math.round((clickedLogs.length / totalSentCount) * 100)
                            : 0;

                        const filteredLogs = cmpLogs.filter(
                          (l) =>
                            l.recipientEmail.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
                            l.recipientName.toLowerCase().includes(logSearchQuery.toLowerCase())
                        );

                        return (
                          <>
                            {/* KPI Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                                <div className="text-[11px] font-semibold uppercase text-slate-500">
                                  Enviados
                                </div>
                                <div className="text-xl font-extrabold text-slate-900 mt-1">
                                  {totalSentCount}
                                </div>
                              </div>
                              <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200/80">
                                <div className="text-[11px] font-semibold uppercase text-emerald-700">
                                  Entregados (SES)
                                </div>
                                <div className="text-xl font-extrabold text-emerald-900 mt-1">
                                  {successLogs.length || totalSentCount}
                                  <span className="text-xs font-medium text-emerald-700 ml-1">
                                    ({deliveryRate}%)
                                  </span>
                                </div>
                              </div>
                              <div className="bg-sky-50/70 p-3.5 rounded-xl border border-sky-200/80">
                                <div className="text-[11px] font-semibold uppercase text-sky-700">
                                  Aperturas (Open Rate)
                                </div>
                                <div className="text-xl font-extrabold text-sky-900 mt-1">
                                  {openedLogs.length}
                                  <span className="text-xs font-medium text-sky-700 ml-1">
                                    ({openRate}%)
                                  </span>
                                </div>
                              </div>
                              <div className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-200/80">
                                <div className="text-[11px] font-semibold uppercase text-purple-700">
                                  Clics (CTR)
                                </div>
                                <div className="text-xl font-extrabold text-purple-900 mt-1">
                                  {clickedLogs.length}
                                  <span className="text-xs font-medium text-purple-700 ml-1">
                                    ({clickRate}%)
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Technical Specs */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-700">
                              <div className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 border-b border-slate-200 pb-1.5">
                                Ficha Técnica del Comunicado
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <span className="text-slate-400 block text-[11px]">Asunto:</span>
                                  <span className="font-semibold text-slate-900">
                                    {currentCampaign.subject}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[11px]">Remitente:</span>
                                  <span className="font-semibold text-slate-900">
                                    {currentCampaign.fromName} ({currentCampaign.fromEmail})
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[11px]">Lanzamiento:</span>
                                  <span className="font-semibold text-slate-900">
                                    {currentCampaign.lastSentAt ||
                                    currentCampaign.sentAt ||
                                    currentCampaign.createdAt
                                      ? new Date(
                                          (currentCampaign.lastSentAt ||
                                            currentCampaign.sentAt ||
                                            currentCampaign.createdAt) as string
                                        ).toLocaleString("es-AR", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })
                                      : "Despachado"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[11px]">Segmento Destino:</span>
                                  <span className="font-semibold text-slate-900">
                                    {currentCampaign.targetTags && currentCampaign.targetTags.length > 0
                                      ? currentCampaign.targetTags.join(", ")
                                      : "Todos los contactos"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Individual Delivery Logs */}
                            <div className="space-y-3 pt-2 border-t border-slate-200">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                  Trazabilidad de Entregas SES ({cmpLogs.length})
                                </h3>
                                <input
                                  type="text"
                                  placeholder="Filtrar por correo o nombre..."
                                  value={logSearchQuery}
                                  onChange={(e) => setLogSearchQuery(e.target.value)}
                                  className="reg-input-bordered !h-8 !px-3 !text-xs !w-full sm:!w-52"
                                />
                              </div>

                              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                                <table className="w-full text-left text-xs">
                                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200 sticky top-0">
                                    <tr>
                                      <th className="px-3 py-2">Contacto</th>
                                      <th className="px-3 py-2">Estado & Actividad</th>
                                      <th className="px-3 py-2">AWS MessageId</th>
                                      <th className="px-3 py-2 text-right">Hora</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                                    {filteredLogs.length === 0 ? (
                                      <tr>
                                        <td
                                          colSpan={4}
                                          className="px-3 py-6 text-center text-slate-400 font-sans"
                                        >
                                          No hay registros individuales de trazabilidad.
                                        </td>
                                      </tr>
                                    ) : (
                                      filteredLogs.map((l) => (
                                        <tr key={l.id} className="hover:bg-slate-50/80">
                                          <td className="px-3 py-2 font-sans font-medium text-slate-900">
                                            {l.recipientName ? `${l.recipientName} ` : ""}
                                            <span className="text-slate-500 text-xs">
                                              &lt;{l.recipientEmail}&gt;
                                            </span>
                                          </td>
                                          <td className="px-3 py-2 font-sans flex flex-wrap items-center gap-1">
                                            <span
                                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                                l.status === "SUCCESS"
                                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                  : "bg-rose-50 text-rose-700 border-rose-200"
                                              }`}
                                            >
                                              {l.status === "SUCCESS" ? "Entregado" : "Fallido"}
                                            </span>
                                            {l.openedAt && (
                                              <span
                                                className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200"
                                                title={`Abierto el ${new Date(l.openedAt).toLocaleString("es-AR")}`}
                                              >
                                                Abierto 👁️
                                              </span>
                                            )}
                                            {l.clickedAt && (
                                              <span
                                                className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200"
                                                title={`Clic el ${new Date(l.clickedAt).toLocaleString("es-AR")}`}
                                              >
                                                Clic 🖱️
                                              </span>
                                            )}
                                          </td>
                                          <td
                                            className="px-3 py-2 text-slate-500 text-[10px] truncate max-w-[120px]"
                                            title={l.messageId}
                                          >
                                            {l.messageId || "N/A"}
                                          </td>
                                          <td className="px-3 py-2 text-right text-slate-400 text-[10px] font-sans">
                                            {new Date(l.sentAt).toLocaleTimeString("es-AR", {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </td>
                                        </tr>
                                      ))
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    /* EDIT FORM FOR DRAFTS */
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                      <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3">
                        Configuración de la Campaña
                      </h2>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                            Asunto del Correo *
                          </label>
                          <input
                            type="text"
                            placeholder="Ej. Novedades especiales LUMINUS"
                            value={currentCampaign.subject}
                            onChange={(e) =>
                              setCurrentCampaign((prev) => ({ ...prev, subject: e.target.value }))
                            }
                            className="reg-input-bordered !h-11 !text-xs md:!text-sm !rounded-xl"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                              Remitente
                            </label>
                            <input
                              type="text"
                              value={currentCampaign.fromName}
                              onChange={(e) =>
                                setCurrentCampaign((prev) => ({ ...prev, fromName: e.target.value }))
                              }
                              className="reg-input-bordered !h-11 !text-xs md:!text-sm !rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                              Correo SES
                            </label>
                            <input
                              type="email"
                              value={currentCampaign.fromEmail}
                              onChange={(e) =>
                                setCurrentCampaign((prev) => ({ ...prev, fromEmail: e.target.value }))
                              }
                              className="reg-input-bordered !h-11 !text-xs md:!text-sm !rounded-xl"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-semibold uppercase text-slate-500">
                              Seleccionar Audiencia *
                            </label>
                            <button
                              type="button"
                              onClick={() => setIsCreateAudienceModalOpen(true)}
                              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" /> Crear nueva audiencia
                            </button>
                          </div>
                          <SelectInput
                            value={currentCampaign.audienceId || "aud_all"}
                            options={audiences.map((aud) => ({
                              value: aud.id,
                              label: `${aud.name} (${aud.contactCount} contactos)`,
                            }))}
                            onSelect={(value: string) => {
                              const found = audiences.find((a) => a.id === value);
                              setCurrentCampaign((prev) => ({
                                ...prev,
                                audienceId: value,
                                audienceName: found?.name || "",
                              }));
                            }}
                          />
                        </div>

                        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            onClick={async () => {
                              await handleSaveCampaign(true);
                              setCampaignViewMode("list");
                            }}
                            className="w-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-xs cursor-pointer"
                          >
                            Guardar borrador
                          </button>
                          <button
                            onClick={async () => {
                              const savedId = await handleSaveCampaign(false);
                              if (savedId) {
                                setSelectedCampaignForBatch(savedId);
                              }
                              setActiveTab("send");
                            }}
                            className="w-full bg-black hover:bg-slate-800 text-white py-2.5 rounded-xl font-semibold text-sm transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Send className="w-4 h-4" /> Enviar campaña
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* RIGHT SIDE (50%): VISUAL PREVIEW & TEST SEND */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewCode(false)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                            !viewCode
                              ? "bg-black text-white"
                              : "bg-slate-100 text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" /> Vista previa
                        </button>
                        <button
                          onClick={() => setViewCode(true)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                            viewCode
                              ? "bg-black text-white"
                              : "bg-slate-100 text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <Code className="w-3.5 h-3.5" /> Código HTML
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPreviewMode("desktop")}
                          className={`px-2.5 py-1 rounded-md text-xs transition cursor-pointer ${
                            previewMode === "desktop" ? "bg-slate-100 text-black font-bold" : "text-slate-400"
                          }`}
                        >
                          Escritorio
                        </button>
                        <button
                          onClick={() => setPreviewMode("mobile")}
                          className={`px-2.5 py-1 rounded-md text-xs transition cursor-pointer ${
                            previewMode === "mobile" ? "bg-slate-100 text-black font-bold" : "text-slate-400"
                          }`}
                        >
                          Móvil
                        </button>
                      </div>
                    </div>

                    {/* Test Send Section */}
                    <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                        <input
                          type="email"
                          value={testEmail}
                          onChange={(e) => setTestEmail(e.target.value)}
                          placeholder="Correo de prueba..."
                          className="reg-input-bordered !h-10 !text-xs !w-full sm:!w-64"
                        />
                      </div>
                      <button
                        onClick={handleSendTestEmail}
                        disabled={sendingTest}
                        className="w-full sm:w-auto bg-black hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer h-10"
                      >
                        {sendingTest ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        Enviar prueba
                      </button>
                    </div>

                    {testStatus && (
                      <div
                        className={`mb-4 p-3 rounded-xl text-xs font-medium ${
                          testStatus.type === "success"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {testStatus.msg}
                      </div>
                    )}

                    {/* Canvas View */}
                    <div className="flex-1 min-h-[480px] bg-slate-50 border border-slate-200 rounded-xl p-2 flex items-center justify-center overflow-auto">
                      {viewCode ? (
                        <textarea
                          readOnly={currentCampaign.status === "COMPLETED"}
                          value={currentCampaign.htmlContent}
                          onChange={(e) =>
                            setCurrentCampaign((prev) => ({ ...prev, htmlContent: e.target.value }))
                          }
                          className="w-full h-full min-h-[480px] bg-white font-mono text-xs text-slate-800 p-4 border-0 focus:outline-none resize-none leading-relaxed rounded-lg"
                        />
                      ) : (
                        <div
                          className={`transition-all duration-300 ${
                            previewMode === "mobile"
                              ? "w-[375px] h-[600px] border-8 border-slate-800 rounded-3xl shadow-2xl overflow-y-auto bg-white"
                              : "w-full h-full min-h-[480px] bg-white rounded-lg p-2 overflow-y-auto"
                          }`}
                        >
                          <iframe
                            title="Live Preview"
                            srcDoc={currentCampaign.htmlContent.replace(
                              /\{\{\s*nombre\s*\}\}/gi,
                              "Gabriel"
                            )}
                            className="w-full h-full min-h-[460px] border-0"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: HISTORIAL DE ENVÍOS */}
        {activeTab === "send" && (
          <div className="space-y-6">
            {/* Launcher Panel */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Play className="w-5 h-5 text-emerald-600" /> Lanzar Envío Masivo
              </h2>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <SelectInput
                  value={selectedCampaignForBatch}
                  options={[
                    { label: "-- Seleccionar campaña --", value: "" },
                    ...campaigns.map((cmp) => ({
                      label: `${cmp.subject} (${cmp.status})`,
                      value: cmp.id,
                    })),
                  ]}
                  onSelect={(val) => setSelectedCampaignForBatch(val)}
                  placeholder="-- Seleccionar campaña --"
                  className="w-full sm:w-96"
                />

                <button
                  onClick={() => selectedCampaignForBatch && handleStartBatchSend(selectedCampaignForBatch)}
                  disabled={!selectedCampaignForBatch || batchSending}
                  className="w-full sm:w-auto bg-black hover:bg-slate-800 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {batchSending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Procesando envíos...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" /> Iniciar envío masivo
                    </>
                  )}
                </button>
              </div>

              {batchStatus && (
                <div
                  className={`mt-4 p-4 rounded-xl text-sm font-medium ${
                    batchStatus.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {batchStatus.msg}
                </div>
              )}
            </div>

            {/* AWS SES Log Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" /> Registros de Envíos (AWS SES)
                </h3>
                <button
                  onClick={fetchCampaigns}
                  className="text-xs text-slate-600 hover:text-black flex items-center gap-1 font-medium cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Actualizar
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50/80 text-slate-500 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5">Fecha y Hora</th>
                      <th className="px-6 py-3.5">Destinatario</th>
                      <th className="px-6 py-3.5">Estado</th>
                      <th className="px-6 py-3.5">AWS MessageId / Detalle Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                          Aún no hay registros de envíos ejecutados.
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-6 py-3.5 text-xs text-slate-500">
                            {new Date(log.sentAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-3.5">
                            <div className="font-medium text-slate-900">{log.recipientName}</div>
                            <div className="text-xs text-slate-500 font-mono">{log.recipientEmail}</div>
                          </td>
                          <td className="px-6 py-3.5">
                            {log.status === "SUCCESS" ? (
                              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                                <CheckCircle className="w-3 h-3" /> Éxito
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                                <AlertCircle className="w-3 h-3" /> Fallido
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-3.5 text-xs font-mono text-slate-600">
                            {log.messageId ? (
                              <span className="text-slate-800">{log.messageId}</span>
                            ) : (
                              <span className="text-rose-600">{log.error}</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: AGREGAR / EDITAR CONTACTO */}
      {isAddContactOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {editingContact ? "Editar contacto" : "Nuevo contacto"}
            </h3>

            <form onSubmit={handleSaveContact} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="ejemplo@dominio.com"
                  className="reg-input-bordered !h-11 !text-xs md:!text-sm !rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nombre</label>
                  <input
                    type="text"
                    value={contactForm.firstName}
                    onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })}
                    className="reg-input-bordered !h-11 !text-xs md:!text-sm !rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Apellido</label>
                  <input
                    type="text"
                    value={contactForm.lastName}
                    onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })}
                    className="reg-input-bordered !h-11 !text-xs md:!text-sm !rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">País</label>
                  <input
                    type="text"
                    placeholder="Ej. Argentina"
                    value={contactForm.country}
                    onChange={(e) => setContactForm({ ...contactForm, country: e.target.value })}
                    className="reg-input-bordered !h-11 !text-xs md:!text-sm !rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Ciudad</label>
                  <input
                    type="text"
                    placeholder="Ej. Buenos Aires"
                    value={contactForm.city}
                    onChange={(e) => setContactForm({ ...contactForm, city: e.target.value })}
                    className="reg-input-bordered !h-11 !text-xs md:!text-sm !rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Profesión</label>
                  <input
                    type="text"
                    placeholder="Ej. Médico"
                    value={contactForm.profession}
                    onChange={(e) => setContactForm({ ...contactForm, profession: e.target.value })}
                    className="reg-input-bordered !h-11 !text-xs md:!text-sm !rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Origen</label>
                  <input
                    type="text"
                    placeholder="Ej. Meta Ads"
                    value={contactForm.source}
                    onChange={(e) => setContactForm({ ...contactForm, source: e.target.value })}
                    className="reg-input-bordered !h-11 !text-xs md:!text-sm !rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Etiquetas (separadas por coma)
                </label>
                <input
                  type="text"
                  placeholder="Posible Especialista, Flores que curan"
                  value={contactForm.tags}
                  onChange={(e) => setContactForm({ ...contactForm, tags: e.target.value })}
                  className="reg-input-bordered !h-11 !text-xs md:!text-sm !rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Notas Internas</label>
                <textarea
                  rows={2}
                  value={contactForm.notes}
                  onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                  className="reg-input-bordered !h-auto p-3 !text-xs md:!text-sm !rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddContactOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-black hover:bg-slate-800 text-white px-5 py-2 rounded-xl font-medium text-sm transition-all shadow-xs cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: IMPORTAR LISTA CSV / EXCEL */}
      {isImportOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Importar lista de contactos</h3>

            {/* Mode selector */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setImportMode("file")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                  importMode === "file"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Subir archivos (.xlsx, .csv)
              </button>
              <button
                type="button"
                onClick={() => setImportMode("text")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                  importMode === "text"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Pegar texto CSV
              </button>
            </div>

            {importMode === "file" ? (
              <div className="space-y-4">
                <div
                  onClick={() => document.getElementById("contact-file-input")?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-black bg-slate-50/50 hover:bg-white rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                >
                  <FileSpreadsheet className="w-10 h-10 text-slate-400 group-hover:text-black transition-colors" />
                  {selectedFiles.length > 0 ? (
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">
                        {selectedFiles.length === 1
                          ? selectedFiles[0].name
                          : `${selectedFiles.length} archivos seleccionados`}
                      </div>
                      <div className="text-slate-500 text-xs mt-0.5">
                        {(
                          selectedFiles.reduce((acc, f) => acc + f.size, 0) / 1024
                        ).toFixed(1)} KB en total
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium text-slate-800 text-sm">
                        Haz clic para seleccionar uno o varios archivos Excel / CSV
                      </div>
                      <div className="text-slate-400 text-xs mt-1">
                        Detección automática de columnas
                      </div>
                    </div>
                  )}
                  <input
                    id="contact-file-input"
                    type="file"
                    multiple
                    accept=".xlsx,.xls,.csv,.txt"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setSelectedFiles(Array.from(e.target.files));
                      }
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  rows={6}
                  placeholder={`juan@ejemplo.com, Juan, Pérez, Clientes\nmaria@ejemplo.com, María, Gómez, Eventos`}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="reg-input-bordered !h-auto p-3 !text-xs font-mono !rounded-xl"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setIsImportOpen(false);
                  setSelectedFiles([]);
                }}
                className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
              >
                Cancelar
              </button>

              {importMode === "file" ? (
                <button
                  onClick={handleFileUploadImport}
                  disabled={selectedFiles.length === 0 || isUploadingFile}
                  className="bg-black hover:bg-slate-800 text-white px-5 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-2 disabled:opacity-40 shadow-xs cursor-pointer"
                >
                  {isUploadingFile ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Procesar {selectedFiles.length > 1 ? `${selectedFiles.length} archivos` : "archivo"}
                </button>
              ) : (
                <button
                  onClick={handleCsvImport}
                  className="bg-black hover:bg-slate-800 text-white px-5 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" /> Procesar texto
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREAR CAMPAÑA */}
      {isCreateCampaignModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Crear nueva campaña</h3>
              <button
                onClick={() => setIsCreateCampaignModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                Selecciona cómo deseas comenzar
              </div>

              {/* Blank Campaign */}
              <button
                onClick={() => {
                  setCurrentCampaign({
                    id: `campaign_${Date.now()}`,
                    subject: "",
                    previewText: "",
                    fromName: "LUMINUS LATAM",
                    fromEmail: "info@luminuslatam.com",
                    htmlContent: DEFAULT_TEMPLATES[0].html,
                    targetTags: [],
                  });
                  setCampaignViewMode("editor");
                  setIsCreateCampaignModalOpen(false);
                }}
                className="w-full text-left p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 group-hover:border-black group-hover:text-black">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Nueva campaña en blanco</div>
                    <div className="text-xs text-slate-500">Diseña o redacta tu comunicado desde cero.</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-black" />
              </button>

              <div className="pt-2 text-xs font-bold uppercase text-slate-500 tracking-wider">
                O elige una plantilla pre-diseñada
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DEFAULT_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.name}
                    onClick={() => {
                      setCurrentCampaign({
                        id: `campaign_${Date.now()}`,
                        subject: tmpl.subject,
                        previewText: "",
                        fromName: "LUMINUS LATAM",
                        fromEmail: "info@luminuslatam.com",
                        htmlContent: tmpl.html,
                        targetTags: [],
                      });
                      setCampaignViewMode("editor");
                      setIsCreateCampaignModalOpen(false);
                    }}
                    className="text-left p-3.5 rounded-xl bg-white border border-slate-200 hover:border-black hover:bg-slate-50 transition-all cursor-pointer space-y-1"
                  >
                    <div className="font-semibold text-slate-900 text-xs">{tmpl.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{tmpl.subject}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsCreateCampaignModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: CREAR AUDIENCIA */}
      {isCreateAudienceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" /> Crear Nueva Audiencia
              </h3>
              <button
                onClick={() => setIsCreateAudienceModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Nombre de la Audiencia *
                </label>
                <input
                  type="text"
                  placeholder="Ej. Especialistas en Chile"
                  value={newAudience.name}
                  onChange={(e) => setNewAudience((prev) => ({ ...prev, name: e.target.value }))}
                  className="reg-input-bordered !h-11 !text-xs md:!text-sm !rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Descripción (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Segmento para envíos de convocatorias médicas."
                  value={newAudience.description}
                  onChange={(e) => setNewAudience((prev) => ({ ...prev, description: e.target.value }))}
                  className="reg-input-bordered !h-10 !text-xs !rounded-xl"
                />
              </div>

              <div className="pt-2 text-xs font-bold uppercase text-slate-500 tracking-wider">
                Filtros de Segmentación (Base de Datos)
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">País</label>
                  <SelectInput
                    value={newAudience.countryFilter}
                    options={[
                      { value: "", label: "Todos los Países" },
                      ...allCountries.map((c) => ({ value: c, label: c })),
                    ]}
                    onSelect={(val: string) => setNewAudience((prev) => ({ ...prev, countryFilter: val }))}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Origen / Fuente</label>
                  <SelectInput
                    value={newAudience.sourceFilter}
                    options={[
                      { value: "", label: "Todos los Orígenes" },
                      ...allSources.map((s) => ({ value: s, label: s })),
                    ]}
                    onSelect={(val: string) => setNewAudience((prev) => ({ ...prev, sourceFilter: val }))}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Etiqueta</label>
                  <SelectInput
                    value={newAudience.tagFilter}
                    options={[
                      { value: "", label: "Todas las Etiquetas" },
                      ...allTags.map((t) => ({ value: t, label: t })),
                    ]}
                    onSelect={(val: string) => setNewAudience((prev) => ({ ...prev, tagFilter: val }))}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Profesión</label>
                  <SelectInput
                    value={newAudience.professionFilter}
                    options={[
                      { value: "", label: "Todas las Profesiones" },
                      ...allProfessions.map((p) => ({ value: p, label: p })),
                    ]}
                    onSelect={(val: string) => setNewAudience((prev) => ({ ...prev, professionFilter: val }))}
                  />
                </div>
              </div>

              {/* Dynamic matching count indicator */}
              {(() => {
                let matched = contacts.filter((c) => !c.unsubscribed);
                if (newAudience.countryFilter) {
                  matched = matched.filter(
                    (c) => c.country?.toLowerCase() === newAudience.countryFilter.toLowerCase()
                  );
                }
                if (newAudience.sourceFilter) {
                  matched = matched.filter(
                    (c) => c.source?.toLowerCase() === newAudience.sourceFilter.toLowerCase()
                  );
                }
                if (newAudience.tagFilter) {
                  matched = matched.filter((c) => c.tags?.includes(newAudience.tagFilter));
                }
                if (newAudience.professionFilter) {
                  matched = matched.filter(
                    (c) => c.profession?.toLowerCase() === newAudience.professionFilter.toLowerCase()
                  );
                }

                return (
                  <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 flex items-center justify-between text-xs text-indigo-900">
                    <span className="font-semibold">Destinatarios que coinciden:</span>
                    <span className="font-extrabold text-sm text-indigo-700 bg-white px-2.5 py-0.5 rounded-lg border border-indigo-200">
                      {matched.length} contactos
                    </span>
                  </div>
                );
              })()}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsCreateAudienceModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveAudience}
                className="px-5 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                Guardar Audiencia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
