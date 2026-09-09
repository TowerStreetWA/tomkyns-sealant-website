import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Check,
  ClipboardList,
  Copy,
  FileText,
  Inbox,
  LayoutDashboard,
  Plus,
  Sparkles,
  Trash2,
  Users,
  WandSparkles,
} from "lucide-react";

type Client = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
};

type EnquiryStatus = "New" | "Quoted" | "Follow-up" | "Booked" | "Lost";
type Enquiry = {
  id: string;
  clientName: string;
  source: string;
  workType: string;
  location: string;
  status: EnquiryStatus;
  date: string;
};

type JobStatus = "Scheduled" | "In Progress" | "Completed" | "Invoiced" | "Paid";
type Job = {
  id: string;
  clientName: string;
  date: string;
  address: string;
  description: string;
  materials: string;
  price: number;
  status: JobStatus;
};

type InvoiceStatus = "Draft" | "Sent" | "Paid" | "Overdue";
type Invoice = {
  id: string;
  invoiceNumber: string;
  clientName: string;
  date: string;
  dueDate: string;
  description: string;
  netAmount: number;
  vatRate: number;
  status: InvoiceStatus;
};

type PortalTab = "clients" | "enquiries" | "jobs" | "invoices" | "ai";

const STORAGE_KEYS = {
  clients: "tomkyns_clients",
  enquiries: "tomkyns_enquiries",
  jobs: "tomkyns_jobs",
  invoices: "tomkyns_invoices",
} as const;

const TAB_ITEMS: Array<{ id: PortalTab; label: string; icon: typeof Users }> = [
  { id: "clients", label: "Clients", icon: Users },
  { id: "enquiries", label: "Enquiries", icon: Inbox },
  { id: "jobs", label: "Jobs", icon: BriefcaseBusiness },
  { id: "invoices", label: "Invoicing", icon: FileText },
  { id: "ai", label: "AI Assistant", icon: WandSparkles },
];

const ENQUIRY_STATUSES: EnquiryStatus[] = ["New", "Quoted", "Follow-up", "Booked", "Lost"];
const JOB_STATUSES: JobStatus[] = ["Scheduled", "In Progress", "Completed", "Invoiced", "Paid"];
const INVOICE_STATUSES: InvoiceStatus[] = ["Draft", "Sent", "Paid", "Overdue"];

const AI_EXAMPLES = [
  "Write a polite follow-up email to a new enquiry",
  "Draft a quote email for a bathroom seal job",
  "Suggest pricing for a 3-bedroom full house re-seal",
  "Write a short proposal for a commercial project",
  "Help me reply to a customer asking about lead time",
];

function loadData<T>(key: string, fallback: T): T {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveData(key: string, data: unknown) {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, JSON.stringify(data));
    }
  } catch {
    // Browser storage can be disabled. The portal remains usable for the session.
  }
}

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

function statusClass(status: string) {
  if (["Paid", "Completed", "Booked"].includes(status)) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (["Overdue", "Lost"].includes(status)) {
    return "bg-red-50 text-red-700 border-red-200";
  }
  if (["In Progress", "Quoted", "Invoiced"].includes(status)) {
    return "bg-cyan-50 text-cyan-700 border-cyan-200";
  }
  return "bg-amber-50 text-amber-700 border-amber-200";
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(status)}`}>
      {status}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="py-10 text-center text-sm text-muted-foreground">{message}</p>;
}

function Field({
  name,
  placeholder,
  type = "text",
  required = false,
  className = "",
  defaultValue,
}: {
  name: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  className?: string;
  defaultValue?: string | number;
}) {
  return (
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      required={required}
      defaultValue={defaultValue}
      className={`h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${className}`}
    />
  );
}

function SelectField({
  name,
  options,
  defaultValue,
}: {
  name: string;
  options: string[];
  defaultValue?: string;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue ?? options[0]}
      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
    >
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
}

function AddButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
    >
      <Plus className="h-4 w-4" />
      {children}
    </button>
  );
}

function generateAssistantReply(prompt: string) {
  const request = prompt.trim();
  const lower = request.toLowerCase();

  if (lower.includes("follow") || lower.includes("chase")) {
    return `Subject: Following up on your sealant enquiry\n\nHi there,\n\nI hope you’re well. I’m just following up on your enquiry about sealant work. If you’re still considering the project, please send over any updated details or photos and I’ll be happy to review the scope and confirm the next steps.\n\nKind regards,\nJon\nTomkyns Sealant Services`;
  }

  if (lower.includes("quote") || lower.includes("email")) {
    return `Subject: Your sealant work enquiry\n\nHi there,\n\nThanks for getting in touch with Tomkyns Sealant Services. I’d be happy to help with your project. Once I’ve confirmed the areas involved, access and the existing sealant condition, I can provide a clear quote for the work.\n\nPlease send over a few photos and the project postcode if convenient, and I’ll come back to you with the next steps.\n\nKind regards,\nJon\nTomkyns Sealant Services`;
  }

  if (lower.includes("price") || lower.includes("pricing")) {
    return `Pricing guidance\n\nThe final price should be based on the length and type of joints, preparation or removal required, access, materials and location. For a reliable quote, ask for the postcode, photos and a short description of the areas involved.\n\nYou could reply:\n\n“Thanks for the details. I’ll review the photos and confirm whether any old sealant needs to be removed before I price the work. I’ll then send a clear quote covering the preparation, materials and application.”`;
  }

  if (lower.includes("lead time") || lower.includes("when")) {
    return `Subject: Re: Sealant project timing\n\nHi there,\n\nThanks for checking. Lead time depends on the project scope, preparation needed and current availability. Send over the postcode, photos and your preferred dates and I’ll confirm a realistic schedule before booking anything in.\n\nKind regards,\nJon\nTomkyns Sealant Services`;
  }

  return `Tomkyns Sealant Business Assistant\n\nFor: ${request}\n\nA good next step is to confirm the property postcode, the rooms or joints involved, the current sealant condition, access requirements and any preferred dates. Keep the wording clear and avoid promising a price or timescale until the scope has been confirmed.\n\nSuggested reply:\n\n“Thanks for getting in touch. Please send over a few photos, the project postcode and a short description of the areas you’d like sealed. I’ll review the details and come back to you with the next steps.”`;
}

export default function BusinessPortal() {
  const [activeTab, setActiveTab] = useState<PortalTab>("clients");
  const [clients, setClients] = useState<Client[]>(() => loadData(STORAGE_KEYS.clients, []));
  const [enquiries, setEnquiries] = useState<Enquiry[]>(() => loadData(STORAGE_KEYS.enquiries, []));
  const [jobs, setJobs] = useState<Job[]>(() => loadData(STORAGE_KEYS.jobs, []));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadData(STORAGE_KEYS.invoices, []));
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => saveData(STORAGE_KEYS.clients, clients), [clients]);
  useEffect(() => saveData(STORAGE_KEYS.enquiries, enquiries), [enquiries]);
  useEffect(() => saveData(STORAGE_KEYS.jobs, jobs), [jobs]);
  useEffect(() => saveData(STORAGE_KEYS.invoices, invoices), [invoices]);

  const stats = useMemo(
    () => [
      { label: "Clients", value: clients.length, icon: Users },
      { label: "Open enquiries", value: enquiries.filter((item) => !["Lost", "Booked"].includes(item.status)).length, icon: Inbox },
      { label: "Active jobs", value: jobs.filter((item) => !["Completed", "Paid"].includes(item.status)).length, icon: BriefcaseBusiness },
      { label: "Invoices", value: invoices.length, icon: FileText },
    ],
    [clients, enquiries, jobs, invoices],
  );

  const addClient = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const address = ["addr1", "addr2", "town", "postcode"]
      .map((field) => String(form.get(field) ?? "").trim())
      .filter(Boolean)
      .join(", ");
    setClients((current) => [
      ...current,
      {
        id: createId("client"),
        name: String(form.get("name") ?? ""),
        phone: String(form.get("phone") ?? ""),
        email: String(form.get("email") ?? ""),
        address,
        notes: String(form.get("notes") ?? ""),
      },
    ]);
    event.currentTarget.reset();
  };

  const addEnquiry = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setEnquiries((current) => [
      ...current,
      {
        id: createId("enquiry"),
        clientName: String(form.get("clientName") ?? ""),
        source: String(form.get("source") ?? ""),
        workType: String(form.get("workType") ?? ""),
        location: String(form.get("location") ?? ""),
        status: String(form.get("status") ?? "New") as EnquiryStatus,
        date: String(form.get("date") || today()),
      },
    ]);
    event.currentTarget.reset();
  };

  const addJob = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setJobs((current) => [
      ...current,
      {
        id: createId("job"),
        clientName: String(form.get("clientName") ?? ""),
        date: String(form.get("date") ?? ""),
        address: String(form.get("address") ?? ""),
        description: String(form.get("description") ?? ""),
        materials: String(form.get("materials") ?? ""),
        price: Number(form.get("price")) || 0,
        status: String(form.get("status") ?? "Scheduled") as JobStatus,
      },
    ]);
    event.currentTarget.reset();
  };

  const addInvoice = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setInvoices((current) => [
      ...current,
      {
        id: createId("invoice"),
        invoiceNumber: String(form.get("invoiceNumber") ?? ""),
        clientName: String(form.get("clientName") ?? ""),
        date: String(form.get("date") ?? ""),
        dueDate: String(form.get("dueDate") ?? ""),
        description: String(form.get("description") ?? ""),
        netAmount: Number(form.get("netAmount")) || 0,
        vatRate: Number(form.get("vatRate")) || 20,
        status: String(form.get("status") ?? "Draft") as InvoiceStatus,
      },
    ]);
    event.currentTarget.reset();
  };

  const runAiHelper = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setCopied(false);
    await new Promise((resolve) => window.setTimeout(resolve, 220));
    setAiResponse(generateAssistantReply(aiPrompt));
    setAiLoading(false);
  };

  const copyResponse = async () => {
    if (!aiResponse) return;
    try {
      await navigator.clipboard.writeText(aiResponse);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const removeItem = (tab: PortalTab, id: string) => {
    if (tab === "clients") setClients((current) => current.filter((item) => item.id !== id));
    if (tab === "enquiries") setEnquiries((current) => current.filter((item) => item.id !== id));
    if (tab === "jobs") setJobs((current) => current.filter((item) => item.id !== id));
    if (tab === "invoices") setInvoices((current) => current.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to website
          </Link>
          <div className="flex items-center gap-2 text-right">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <span className="hidden text-sm font-semibold sm:inline">Tomkyns Business Portal</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <section className="mb-8 overflow-hidden rounded-2xl bg-foreground px-6 py-8 text-white shadow-lg sm:px-8">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Business workspace
              </span>
              <h1 className="font-display text-3xl font-bold tracking-tight !text-white sm:text-4xl">Business Management Portal</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
                Keep clients, enquiries, jobs, invoices and ready-to-use business wording together in one simple workspace.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
              <div className="flex items-center gap-2 font-semibold text-white">
                <ClipboardList className="h-4 w-4 text-primary" />
                Saved in this browser
              </div>
              <p className="mt-1 text-xs">No database or account required for this local workspace.</p>
            </div>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <p className="font-display text-2xl font-bold">{stat.value}</p>
              </div>
            );
          })}
        </section>

        <div className="mb-6 flex gap-2 overflow-x-auto border-b border-border pb-2">
          {TAB_ITEMS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-background hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
          {activeTab === "clients" && (
            <div>
              <SectionHeading title="Client directory" description="Store local contact details and notes for your customers." />
              <form onSubmit={addClient} className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                <Field name="name" placeholder="Full name / company" required />
                <Field name="phone" placeholder="Phone number" />
                <Field name="email" placeholder="Email address" type="email" />
                <Field name="addr1" placeholder="Address line 1" />
                <Field name="addr2" placeholder="Address line 2" />
                <Field name="town" placeholder="Town / city" />
                <Field name="postcode" placeholder="Postcode" />
                <Field name="notes" placeholder="Notes / details" className="md:col-span-2" />
                <AddButton>Add client</AddButton>
              </form>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead><tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground"><th className="px-3 py-3">Name</th><th className="px-3 py-3">Contact</th><th className="px-3 py-3">Address</th><th className="px-3 py-3">Notes</th><th className="px-3 py-3" /></tr></thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client.id} className="border-b border-border/70 last:border-0">
                        <td className="px-3 py-4 font-semibold">{client.name}</td>
                        <td className="px-3 py-4 text-muted-foreground">{client.phone}<br />{client.email}</td>
                        <td className="px-3 py-4 text-muted-foreground">{client.address}</td>
                        <td className="px-3 py-4 text-muted-foreground">{client.notes}</td>
                        <td className="px-3 py-4 text-right"><DeleteButton onClick={() => removeItem("clients", client.id)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!clients.length && <EmptyState message="No clients yet. Add your first client above." />}
              </div>
            </div>
          )}

          {activeTab === "enquiries" && (
            <div>
              <SectionHeading title="Enquiries and leads" description="Track where new work came from and what needs a follow-up." />
              <form onSubmit={addEnquiry} className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                <Field name="clientName" placeholder="Client name" required />
                <Field name="source" placeholder="Source: web / call / referral" />
                <Field name="workType" placeholder="Type of work" />
                <Field name="location" placeholder="Location / postcode" />
                <SelectField name="status" options={ENQUIRY_STATUSES} />
                <Field name="date" placeholder="Date" type="date" />
                <AddButton>Add enquiry</AddButton>
              </form>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead><tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground"><th className="px-3 py-3">Client</th><th className="px-3 py-3">Source</th><th className="px-3 py-3">Work type</th><th className="px-3 py-3">Location</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Date</th><th className="px-3 py-3" /></tr></thead>
                  <tbody>
                    {enquiries.map((enquiry) => (
                      <tr key={enquiry.id} className="border-b border-border/70 last:border-0">
                        <td className="px-3 py-4 font-semibold">{enquiry.clientName}</td>
                        <td className="px-3 py-4 text-muted-foreground">{enquiry.source}</td>
                        <td className="px-3 py-4">{enquiry.workType}</td>
                        <td className="px-3 py-4 text-muted-foreground">{enquiry.location}</td>
                        <td className="px-3 py-4"><StatusBadge status={enquiry.status} /></td>
                        <td className="px-3 py-4 text-muted-foreground">{enquiry.date}</td>
                        <td className="px-3 py-4 text-right"><DeleteButton onClick={() => removeItem("enquiries", enquiry.id)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!enquiries.length && <EmptyState message="No enquiries yet. Add a lead above." />}
              </div>
            </div>
          )}

          {activeTab === "jobs" && (
            <div>
              <SectionHeading title="Jobs and work orders" description="Keep upcoming work, materials and quoted prices in one place." />
              <form onSubmit={addJob} className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                <Field name="clientName" placeholder="Client name" required />
                <Field name="date" placeholder="Date" type="date" />
                <Field name="address" placeholder="Work location" />
                <Field name="description" placeholder="Description of work" />
                <Field name="materials" placeholder="Materials used" />
                <Field name="price" placeholder="Price £" type="number" />
                <SelectField name="status" options={JOB_STATUSES} />
                <AddButton>Add job</AddButton>
              </form>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead><tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground"><th className="px-3 py-3">Client</th><th className="px-3 py-3">Date</th><th className="px-3 py-3">Work</th><th className="px-3 py-3">Materials</th><th className="px-3 py-3">Price</th><th className="px-3 py-3">Status</th><th className="px-3 py-3" /></tr></thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id} className="border-b border-border/70 last:border-0">
                        <td className="px-3 py-4 font-semibold">{job.clientName}<br /><span className="font-normal text-muted-foreground">{job.address}</span></td>
                        <td className="px-3 py-4 text-muted-foreground">{job.date}</td>
                        <td className="px-3 py-4">{job.description}</td>
                        <td className="px-3 py-4 text-muted-foreground">{job.materials}</td>
                        <td className="px-3 py-4 font-semibold">{formatCurrency(job.price)}</td>
                        <td className="px-3 py-4"><StatusBadge status={job.status} /></td>
                        <td className="px-3 py-4 text-right"><DeleteButton onClick={() => removeItem("jobs", job.id)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!jobs.length && <EmptyState message="No jobs yet. Add a work order above." />}
              </div>
            </div>
          )}

          {activeTab === "invoices" && (
            <div>
              <SectionHeading title="Invoicing and VAT management" description="Record invoice details and calculate VAT totals automatically." />
              <form onSubmit={addInvoice} className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                <Field name="invoiceNumber" placeholder="Invoice no. e.g. 2026-001" required />
                <Field name="clientName" placeholder="Client name" required />
                <Field name="date" placeholder="Invoice date" type="date" />
                <Field name="dueDate" placeholder="Due date" type="date" />
                <Field name="description" placeholder="Description / work" className="md:col-span-2" />
                <Field name="netAmount" placeholder="Net amount £" type="number" />
                <Field name="vatRate" placeholder="VAT % — default 20" type="number" defaultValue={20} />
                <SelectField name="status" options={INVOICE_STATUSES} />
                <AddButton>Add invoice</AddButton>
              </form>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[840px] text-left text-sm">
                  <thead><tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground"><th className="px-3 py-3">Invoice</th><th className="px-3 py-3">Client</th><th className="px-3 py-3">Dates</th><th className="px-3 py-3">Net</th><th className="px-3 py-3">VAT</th><th className="px-3 py-3">Total</th><th className="px-3 py-3">Status</th><th className="px-3 py-3" /></tr></thead>
                  <tbody>
                    {invoices.map((invoice) => {
                      const vat = invoice.netAmount * (invoice.vatRate / 100);
                      return (
                        <tr key={invoice.id} className="border-b border-border/70 last:border-0">
                          <td className="px-3 py-4 font-semibold">{invoice.invoiceNumber}<br /><span className="font-normal text-muted-foreground">{invoice.description}</span></td>
                          <td className="px-3 py-4">{invoice.clientName}</td>
                          <td className="px-3 py-4 text-muted-foreground">{invoice.date}<br />Due {invoice.dueDate}</td>
                          <td className="px-3 py-4">{formatCurrency(invoice.netAmount)}</td>
                          <td className="px-3 py-4">{formatCurrency(vat)} ({invoice.vatRate}%)</td>
                          <td className="px-3 py-4 font-bold">{formatCurrency(invoice.netAmount + vat)}</td>
                          <td className="px-3 py-4"><StatusBadge status={invoice.status} /></td>
                          <td className="px-3 py-4 text-right"><DeleteButton onClick={() => removeItem("invoices", invoice.id)} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {!invoices.length && <EmptyState message="No invoices yet. Add an invoice above." />}
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="mx-auto max-w-4xl">
              <SectionHeading
                title="Tomkyns Sealant AI Business Assistant"
                description="Generate concise, UK-focused emails, quote wording, proposals and admin text without leaving the portal."
              />
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                <label htmlFor="ai-prompt" className="mb-2 block text-sm font-semibold">What do you need help with?</label>
                <textarea
                  id="ai-prompt"
                  value={aiPrompt}
                  onChange={(event) => setAiPrompt(event.target.value)}
                  placeholder="Type here… e.g. “Write a quote email for re-sealing a kitchen and bathroom”"
                  className="min-h-32 w-full resize-y rounded-md border border-input bg-background p-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <p className="mb-3 mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quick examples</p>
                <div className="flex flex-wrap gap-2">
                  {AI_EXAMPLES.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => setAiPrompt(example)}
                      className="rounded-full border border-border bg-background px-3 py-1.5 text-left text-xs text-muted-foreground transition hover:border-primary hover:text-primary"
                    >
                      {example}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={runAiHelper}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  {aiLoading ? "Preparing answer…" : "Generate answer"}
                </button>
              </div>

              {aiResponse && (
                <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/70 p-5">
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <h3 className="font-semibold text-emerald-950">Ready-to-copy result</h3>
                    <button type="button" onClick={copyResponse} className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100">
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-emerald-950">{aiResponse}</pre>
                </div>
              )}
              <p className="mt-5 text-xs leading-5 text-muted-foreground">
                This assistant works locally in the browser, so it does not send your portal data to an external AI service. Check pricing, VAT and project details before sending customer-facing wording.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-display text-2xl font-bold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Delete item"
      className="rounded-md p-2 text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}