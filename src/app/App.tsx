import { useState } from "react";
import obraTrackLogo from "@/imports/obratrack-1-1.png";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { AuthProvider, useAuth, ROL_LABEL, type Rol } from "@/app/auth/AuthContext";
import { AuthScreen } from "@/app/auth/AuthScreen";
import {
  LayoutDashboard, Box, Calendar, FileText, ClipboardCheck,
  AlertTriangle, BarChart2, Map, Bell, Search, Plus,
  Filter, MoreHorizontal, Upload, Download, Eye,
  TrendingUp, Users, Building2,
  Layers, ZoomIn, ZoomOut, RotateCcw, Maximize2,
  ChevronDown, Move, Crosshair, X, List, Menu,
  ArrowUpRight, Sliders, Shield, Globe, LogOut,
  PanelLeft, LayoutGrid,
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from "recharts";

// ─── Types ─────────────────────────────────────────────────────────────────────
type Module =
  | "dashboard" | "bim" | "planning" | "kanban"
  | "calendar" | "documents" | "inspections" | "issues"
  | "reports" | "map" | "admin";

// Módulos visibles según el rol (la seguridad real la aplica la base de datos con RLS)
const TODOS: Module[] = ["dashboard", "bim", "planning", "kanban", "calendar", "documents", "inspections", "issues", "reports", "map", "admin"];
const ACCESO: Record<Rol, Module[]> = {
  administrador: TODOS,
  director_proyecto: TODOS.filter((m) => m !== "admin"),
  supervisor: TODOS.filter((m) => m !== "admin"),
  trabajador: ["dashboard", "bim", "kanban", "calendar", "documents", "inspections", "issues"],
  cliente: ["dashboard", "bim", "planning", "calendar", "documents", "reports", "map"],
};

// ─── Mock Data ──────────────────────────────────────────────────────────────────
const projects = [
  { id: "P001", name: "Torre Residencial Bío-Bío", client: "Inmobiliaria Central SA", location: "Concepción, Chile", progress: 68, status: "active", startDate: "2024-03-01", endDate: "2025-08-30", team: 14 },
  { id: "P002", name: "Centro Comercial Antofagasta", client: "Retail Group SpA", location: "Antofagasta, Chile", progress: 34, status: "active", startDate: "2024-06-15", endDate: "2026-02-28", team: 22 },
  { id: "P003", name: "Hospital Regional Sur", client: "MINSAL", location: "Valdivia, Chile", progress: 12, status: "active", startDate: "2024-09-01", endDate: "2027-01-15", team: 38 },
  { id: "P004", name: "Parque Industrial Norte", client: "Zona Franca Iquique", location: "Iquique, Chile", progress: 91, status: "finishing", startDate: "2023-11-01", endDate: "2024-12-31", team: 9 },
];

const kpiData = [
  { label: "Proyectos Activos", value: "4", change: "+1", color: "#3b82f6" },
  { label: "Avance General", value: "51%", change: "+3.2%", color: "#10b981" },
  { label: "Tareas Pendientes", value: "47", change: "-8", color: "#f59e0b" },
  { label: "Incidencias Abiertas", value: "12", change: "+3", color: "#ef4444" },
  { label: "Docs. en Revisión", value: "23", change: "+5", color: "#8b5cf6" },
  { label: "Miembros Activos", value: "83", change: "+2", color: "#06b6d4" },
];

const areaData = [
  { week: "S01", avance: 8, plan: 10 },
  { week: "S02", avance: 18, plan: 20 },
  { week: "S03", avance: 26, plan: 30 },
  { week: "S04", avance: 38, plan: 40 },
  { week: "S05", avance: 45, plan: 50 },
  { week: "S06", avance: 51, plan: 60 },
  { week: "S07", avance: 58, plan: 70 },
  { week: "S08", avance: 64, plan: 80 },
];

const pieData = [
  { name: "Estructura", value: 35, color: "#3b82f6" },
  { name: "Arquitectura", value: 28, color: "#10b981" },
  { name: "MMEESS", value: 22, color: "#f59e0b" },
  { name: "Terminaciones", value: 15, color: "#8b5cf6" },
];

const ganttTasks = [
  { id: 1, name: "Fundaciones", start: 0, duration: 8, progress: 100, color: "#10b981", responsible: "Jorge Muñoz" },
  { id: 2, name: "Estructura H.A. Piso 1–5", start: 6, duration: 12, progress: 85, color: "#3b82f6", responsible: "Karla Pérez" },
  { id: 3, name: "Estructura H.A. Piso 6–12", start: 16, duration: 14, progress: 40, color: "#3b82f6", responsible: "Karla Pérez" },
  { id: 4, name: "Albañilería Bloque A", start: 14, duration: 10, progress: 55, color: "#f59e0b", responsible: "Laura Torres" },
  { id: 5, name: "Instalaciones Eléctricas", start: 18, duration: 16, progress: 30, color: "#8b5cf6", responsible: "Rodrigo Vega" },
  { id: 6, name: "Instalaciones Sanitarias", start: 20, duration: 14, progress: 25, color: "#06b6d4", responsible: "Mario Silva" },
  { id: 7, name: "Terminaciones Int. Bloque A", start: 24, duration: 12, progress: 10, color: "#ef4444", responsible: "Patricia Rojas" },
  { id: 8, name: "Fachada y Exteriores", start: 28, duration: 8, progress: 0, color: "#f97316", responsible: "Ana Díaz" },
];

const TOTAL_WEEKS = 36;

const kanbanData: Record<string, KanbanItem[]> = {
  pendiente: [
    { id: 1, title: "Revisar planos As-Built Piso 8", priority: "alta", assignee: "KP", tag: "Estructura", dueDate: "2024-11-28" },
    { id: 2, title: "Aprobación materiales fachada", priority: "media", assignee: "LT", tag: "Arquitectura", dueDate: "2024-12-05" },
    { id: 3, title: "Informe mensual ITO", priority: "alta", assignee: "MS", tag: "Documentos", dueDate: "2024-11-30" },
  ],
  ejecucion: [
    { id: 4, title: "Hormigonado losa piso 9", priority: "critica", assignee: "JM", tag: "Estructura", dueDate: "2024-11-25" },
    { id: 5, title: "Instalación ventanas bloque C", priority: "media", assignee: "PR", tag: "Arquitectura", dueDate: "2024-12-10" },
    { id: 6, title: "Certificado subcontrato MMEESS", priority: "alta", assignee: "RV", tag: "Contratos", dueDate: "2024-11-29" },
  ],
  revision: [
    { id: 7, title: "Protocolo prueba estanque agua", priority: "alta", assignee: "MS", tag: "Sanitaria", dueDate: "2024-11-24" },
    { id: 8, title: "Carta Gantt actualizada sem 47", priority: "media", assignee: "KP", tag: "Planificación", dueDate: "2024-11-22" },
  ],
  finalizado: [
    { id: 9, title: "Fundaciones completadas", priority: "baja", assignee: "JM", tag: "Estructura", dueDate: "2024-10-15" },
    { id: 10, title: "Topografía replanteo", priority: "media", assignee: "AD", tag: "Terreno", dueDate: "2024-09-30" },
    { id: 11, title: "Estudio de suelos aprobado", priority: "alta", assignee: "LT", tag: "Terreno", dueDate: "2024-09-10" },
  ],
};

const calendarEvents = [
  { date: 22, title: "Reunión de coordinación semanal", time: "09:00", color: "#3b82f6" },
  { date: 22, title: "Entrega informe avance mensual", time: "18:00", color: "#10b981" },
  { date: 24, title: "Inspección ITO Piso 9", time: "10:30", color: "#f59e0b" },
  { date: 25, title: "Revisión BIM con arquitecto", time: "14:00", color: "#3b82f6" },
  { date: 28, title: "Hormigonado losa P10", time: "07:00", color: "#8b5cf6" },
  { date: 29, title: "Vencimiento contrato subcontrato", time: "23:59", color: "#ef4444" },
  { date: 5, title: "Entrega planos estructura R3", time: "17:00", color: "#10b981" },
];

const documents = [
  { id: 1, name: "Plano Arquitectura Piso 1-5 v3.2", type: "DWG", size: "18.4 MB", updatedAt: "2024-11-20", status: "aprobado", author: "K. Pérez", version: "3.2" },
  { id: 2, name: "Especificaciones Técnicas Estructura", type: "PDF", size: "4.1 MB", updatedAt: "2024-11-18", status: "en_revision", author: "J. Muñoz", version: "2.1" },
  { id: 3, name: "Modelo BIM Arquitectura", type: "IFC", size: "245 MB", updatedAt: "2024-11-15", status: "aprobado", author: "K. Pérez", version: "4.0" },
  { id: 4, name: "Presupuesto Actualizado Nov-2024", type: "XLSX", size: "2.8 MB", updatedAt: "2024-11-22", status: "aprobado", author: "L. Torres", version: "7.0" },
  { id: 5, name: "Fotografías Avance Semana 46", type: "ZIP", size: "1.2 GB", updatedAt: "2024-11-17", status: "aprobado", author: "P. Rojas", version: "1.0" },
  { id: 6, name: "Cronograma Proyecto General", type: "MPP", size: "8.3 MB", updatedAt: "2024-11-21", status: "en_revision", author: "M. Silva", version: "5.1" },
  { id: 7, name: "Informe Inspección ITO #23", type: "PDF", size: "3.6 MB", updatedAt: "2024-11-19", status: "pendiente", author: "R. Vega", version: "1.0" },
  { id: 8, name: "Manual Instalaciones Eléctricas", type: "PDF", size: "7.2 MB", updatedAt: "2024-11-10", status: "aprobado", author: "R. Vega", version: "1.2" },
];

const inspections = [
  { id: 1, title: "Inspección hormigonado losa piso 9", date: "2024-11-22", responsible: "J. Muñoz", priority: "alta", status: "abierta", location: "Piso 9 — Sector A", photos: 12 },
  { id: 2, title: "Revisión instalación ventanas bloque C", date: "2024-11-20", responsible: "P. Rojas", priority: "media", status: "en_proceso", location: "Bloque C — Fachada Norte", photos: 8 },
  { id: 3, title: "Control compactación área estacionamiento", date: "2024-11-18", responsible: "A. Díaz", priority: "baja", status: "cerrada", location: "Subterráneo -2", photos: 5 },
  { id: 4, title: "Verificación armadura muros caja escalera", date: "2024-11-15", responsible: "K. Pérez", priority: "critica", status: "cerrada", location: "Caja escalera principal", photos: 18 },
  { id: 5, title: "Inspección tuberías agua potable P3", date: "2024-11-24", responsible: "M. Silva", priority: "alta", status: "abierta", location: "Piso 3 — Shafts sanitarios", photos: 0 },
];

const issues = [
  { id: "INC-042", title: "Fisura en muro hormigón eje D4", description: "Fisura de 2.3mm en muro perimetral, requiere evaluación estructural", priority: "critica", status: "abierta", responsible: "K. Pérez", created: "2024-11-21", element: "MURO-D4-P7" },
  { id: "INC-041", title: "Desviación en aplome columna C8", description: "Columna presenta desviación de 12mm sobre tolerancia permitida", priority: "alta", status: "en_revision", responsible: "J. Muñoz", created: "2024-11-20", element: "COL-C8-P6" },
  { id: "INC-040", title: "Humedad en cielo falso oficinas", description: "Filtración de agua en cielo falso, probable origen en losa superior", priority: "media", status: "en_proceso", responsible: "M. Silva", created: "2024-11-18", element: "LOSA-P4-SB" },
  { id: "INC-039", title: "Materiales sin protocolo en bodega", description: "Acero de refuerzo sin certificado de calidad almacenado incorrectamente", priority: "alta", status: "cerrada", responsible: "L. Torres", created: "2024-11-15", element: "" },
  { id: "INC-038", title: "Corte suministro eléctrico zona sur", description: "Interrupción no programada afectó faena sur por 4 horas", priority: "baja", status: "cerrada", responsible: "R. Vega", created: "2024-11-14", element: "" },
];

const reportsWeekly = [
  { day: "Lun", avance: 2.1, meta: 2.5 },
  { day: "Mar", avance: 2.4, meta: 2.5 },
  { day: "Mié", avance: 1.8, meta: 2.5 },
  { day: "Jue", avance: 3.2, meta: 2.5 },
  { day: "Vie", avance: 2.7, meta: 2.5 },
  { day: "Sáb", avance: 1.5, meta: 1.5 },
];

const reportsHH = [
  { month: "Ago", real: 4820, plan: 5000 },
  { month: "Sep", real: 5140, plan: 5200 },
  { month: "Oct", real: 4980, plan: 5100 },
  { month: "Nov", real: 5260, plan: 5000 },
];

const activities = [
  { id: 1, user: "K. Pérez", action: "actualizó el modelo BIM", target: "Arquitectura v4.0", time: "hace 12 min", avatar: "KP" },
  { id: 2, user: "J. Muñoz", action: "cerró incidencia", target: "INC-039", time: "hace 34 min", avatar: "JM" },
  { id: 3, user: "M. Silva", action: "subió documento", target: "Plano Sanitario P3 v2.1", time: "hace 1 h", avatar: "MS" },
  { id: 4, user: "L. Torres", action: "actualizó avance al", target: "68% en Estructura", time: "hace 2 h", avatar: "LT" },
  { id: 5, user: "P. Rojas", action: "creó inspección", target: "Losa Piso 9", time: "hace 3 h", avatar: "PR" },
];

const adminUsers = [
  { id: 1, name: "Alejandro Ruiz", email: "a.ruiz@nodo.cl", role: "Administrador", status: "activo", projects: 4, lastLogin: "hace 5 min" },
  { id: 2, name: "Karla Pérez", email: "k.perez@nodo.cl", role: "Director de Proyecto", status: "activo", projects: 2, lastLogin: "hace 1 h" },
  { id: 3, name: "Jorge Muñoz", email: "j.munoz@nodo.cl", role: "Supervisor", status: "activo", projects: 1, lastLogin: "hace 3 h" },
  { id: 4, name: "Laura Torres", email: "l.torres@nodo.cl", role: "Supervisor", status: "activo", projects: 3, lastLogin: "ayer" },
  { id: 5, name: "Mario Silva", email: "m.silva@nodo.cl", role: "Trabajador", status: "activo", projects: 2, lastLogin: "hace 2 h" },
  { id: 6, name: "Patricia Rojas", email: "p.rojas@nodo.cl", role: "Trabajador", status: "inactivo", projects: 1, lastLogin: "hace 3 días" },
  { id: 7, name: "Rodrigo Vega", email: "r.vega@nodo.cl", role: "Trabajador", status: "activo", projects: 2, lastLogin: "hace 6 h" },
  { id: 8, name: "Ana Díaz", email: "a.diaz@empresa.cl", role: "Cliente", status: "activo", projects: 1, lastLogin: "hace 1 día" },
];

// ─── Style helpers ──────────────────────────────────────────────────────────────
const priorityBadge: Record<string, string> = {
  critica: "bg-red-500/15 text-red-400 border border-red-500/30",
  alta: "bg-orange-500/15 text-orange-400 border border-orange-500/30",
  media: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  baja: "bg-slate-500/15 text-slate-400 border border-slate-500/30",
};
const statusBadge: Record<string, string> = {
  abierta: "bg-red-500/15 text-red-400",
  en_proceso: "bg-blue-500/15 text-blue-400",
  en_revision: "bg-yellow-500/15 text-yellow-400",
  cerrada: "bg-emerald-500/15 text-emerald-400",
  aprobado: "bg-emerald-500/15 text-emerald-400",
  pendiente: "bg-slate-500/15 text-slate-400",
};
const fileTypeColor: Record<string, string> = {
  PDF: "#ef4444", DWG: "#3b82f6", IFC: "#8b5cf6",
  XLSX: "#10b981", ZIP: "#f59e0b", MPP: "#06b6d4",
};
const MONO = "'JetBrains Mono', monospace";

// ─── Sidebar ────────────────────────────────────────────────────────────────────
const navGroups = [
  { label: "Principal", items: [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  { label: "BIM", items: [{ id: "bim", label: "Visor BIM", icon: Box }] },
  {
    label: "Gestión", items: [
      { id: "planning", label: "Planificación", icon: List },
      { id: "kanban", label: "Kanban", icon: LayoutGrid },
      { id: "calendar", label: "Calendario", icon: Calendar },
    ],
  },
  {
    label: "Control", items: [
      { id: "documents", label: "Documentos", icon: FileText },
      { id: "inspections", label: "Inspecciones", icon: ClipboardCheck },
      { id: "issues", label: "Incidencias", icon: AlertTriangle },
    ],
  },
  {
    label: "Análisis", items: [
      { id: "reports", label: "Reportes", icon: BarChart2 },
      { id: "map", label: "Mapa", icon: Map },
    ],
  },
  { label: "Sistema", items: [{ id: "admin", label: "Administración", icon: Shield }] },
];

function Sidebar({
  active, onNavigate, collapsed, onToggle, mobileOpen, onMobileClose,
  permitidos, nombre, rolTexto, iniciales, onLogout,
}: {
  active: Module; onNavigate: (m: Module) => void; collapsed: boolean; onToggle: () => void;
  mobileOpen: boolean; onMobileClose: () => void;
  permitidos: Module[]; nombre: string; rolTexto: string; iniciales: string; onLogout: () => void;
}) {
  const handleNav = (m: Module) => {
    onNavigate(m);
    onMobileClose();
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}
    <aside
      className={`flex flex-col border-r border-border transition-all duration-200 flex-shrink-0
        fixed inset-y-0 left-0 z-50 md:relative md:z-auto
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
        ${collapsed ? "md:w-14" : "md:w-56"}
        w-64`}
      style={{ background: "#0b1019" }}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-3 border-b border-border gap-2.5 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-blue-500/20">
          <ImageWithFallback
            src={obraTrackLogo}
            alt="ObraTrack"
            className="w-full h-full object-cover"
          />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-sm font-bold text-white leading-none tracking-wide">OBRATRACK</div>
            <div className="text-[10px] text-slate-500 leading-none mt-0.5" style={{ fontFamily: MONO }}>Proyectos v2.1</div>
          </div>
        )}
        <button onClick={onToggle} className="ml-auto text-slate-600 hover:text-slate-300 transition-colors p-1 rounded flex-shrink-0">
          <PanelLeft size={14} />
        </button>
      </div>

      {/* Project selector */}
      {!collapsed && (
        <div className="px-3 py-2.5 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/8 cursor-pointer transition-colors">
            <div className="w-5 h-5 rounded bg-blue-600/70 flex items-center justify-center flex-shrink-0">
              <span className="text-[8px] text-white font-bold">TB</span>
            </div>
            <span className="text-xs text-slate-300 flex-1 truncate">Torre Bío-Bío</span>
            <ChevronDown size={11} className="text-slate-600 flex-shrink-0" />
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-1.5">
        {navGroups.map((g) => ({ ...g, items: g.items.filter((i) => permitidos.includes(i.id as Module)) })).filter((g) => g.items.length > 0).map((group) => (
          <div key={group.label} className="mb-0.5">
            {!collapsed && (
              <div className="px-3 py-1.5 mt-1">
                <span className="text-[9px] font-semibold text-slate-700 uppercase tracking-widest" style={{ fontFamily: MONO }}>
                  {group.label}
                </span>
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id as Module)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all duration-100 ${
                    isActive
                      ? "bg-blue-600/12 text-blue-400 border-r-2 border-blue-500"
                      : "text-slate-500 hover:bg-white/4 hover:text-slate-200 border-r-2 border-transparent"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <Icon size={14} className="flex-shrink-0" />
                  {!collapsed && <span className="text-xs font-medium">{item.label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-border p-3 flex-shrink-0">
        <div className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] text-white font-bold">{iniciales}</span>
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-slate-200 truncate">{nombre}</div>
                <div className="text-[10px] text-slate-600 truncate" style={{ fontFamily: MONO }}>{rolTexto}</div>
              </div>
              <button onClick={onLogout} title="Cerrar sesión" aria-label="Cerrar sesión" className="flex-shrink-0 p-1"><LogOut size={12} className="text-slate-500 hover:text-slate-200" /></button>
            </>
          )}
        </div>
      </div>
    </aside>
    </>
  );
}

// ─── TopBar ─────────────────────────────────────────────────────────────────────
const moduleTitles: Record<Module, string> = {
  dashboard: "Dashboard", bim: "Visor BIM", planning: "Planificación",
  kanban: "Kanban Board", calendar: "Calendario", documents: "Gestión Documental",
  inspections: "Inspecciones", issues: "Incidencias", reports: "Reportes",
  map: "Mapa de Proyectos", admin: "Administración",
};

function TopBar({ module, onMenuToggle }: { module: Module; onMenuToggle: () => void }) {
  return (
    <header className="h-14 flex items-center gap-3 px-4 border-b border-border flex-shrink-0" style={{ background: "#0b1019" }}>
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuToggle}
        className="md:hidden p-1.5 text-slate-500 hover:text-slate-200 transition-colors flex-shrink-0"
      >
        <Menu size={18} />
      </button>

      <h1 className="text-sm font-semibold text-slate-100 flex-shrink-0 truncate">{moduleTitles[module]}</h1>

      {/* Search — hidden on small screens */}
      <div className="hidden sm:flex items-center gap-2 flex-1 max-w-xs bg-white/5 border border-border rounded-md px-3 py-1.5">
        <Search size={12} className="text-slate-600 flex-shrink-0" />
        <input
          placeholder="Buscar en NODO..."
          className="bg-transparent text-xs text-slate-300 placeholder:text-slate-600 outline-none flex-1 min-w-0"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto flex-shrink-0">
        <button className="relative p-1.5 text-slate-600 hover:text-slate-300 transition-colors">
          <Bell size={15} />
          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>
        <button className="flex items-center gap-1.5 text-[11px] text-white bg-blue-600 hover:bg-blue-700 transition-colors px-3 py-1.5 rounded-md">
          <Plus size={12} />
          <span className="hidden sm:inline">Nuevo</span>
        </button>
      </div>
    </header>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────────
function DashboardProgressChart() {
  const width = 720;
  const height = 180;
  const plot = { left: 34, right: 12, top: 8, bottom: 26 };
  const plotWidth = width - plot.left - plot.right;
  const plotHeight = height - plot.top - plot.bottom;
  const x = (index: number) => plot.left + (index * plotWidth) / (areaData.length - 1);
  const y = (value: number) => plot.top + ((100 - value) / 100) * plotHeight;
  const planPoints = areaData.map((point, index) => `${x(index)},${y(point.plan)}`).join(" ");
  const progressPoints = areaData.map((point, index) => `${x(index)},${y(point.avance)}`).join(" ");
  const progressArea = `${plot.left},${plot.top + plotHeight} ${progressPoints} ${x(areaData.length - 1)},${plot.top + plotHeight}`;
  const gridValues = [0, 25, 50, 75, 100];

  return (
    <div className="h-[180px] w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-full w-full overflow-visible"
        role="img"
        aria-label="Avance real comparado con el plan semanal"
      >
        <defs>
          <linearGradient id="dashboard-progress-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {gridValues.map((value) => (
          <g key={`dashboard-grid-${value}`}>
            <line
              x1={plot.left}
              x2={width - plot.right}
              y1={y(value)}
              y2={y(value)}
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="3 3"
            />
            <text
              x={plot.left - 7}
              y={y(value) + 3}
              textAnchor="end"
              fill="#475569"
              fontSize="9"
              fontFamily={MONO}
            >
              {value}%
            </text>
          </g>
        ))}

        <polygon points={progressArea} fill="url(#dashboard-progress-fill)" />
        <polyline
          points={planPoints}
          fill="none"
          stroke="#10b981"
          strokeWidth="1.5"
          strokeDasharray="5 4"
          vectorEffect="non-scaling-stroke"
        />
        <polyline
          points={progressPoints}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />

        {areaData.map((point, index) => (
          <g key={`dashboard-point-${point.week}`}>
            <circle
              cx={x(index)}
              cy={y(point.avance)}
              r="3"
              fill="#3b82f6"
              stroke="#dbeafe"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            >
              <title>{`${point.week}: avance ${point.avance}%, plan ${point.plan}%`}</title>
            </circle>
            <text
              x={x(index)}
              y={height - 7}
              textAnchor="middle"
              fill="#475569"
              fontSize="9"
              fontFamily={MONO}
            >
              {point.week}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="p-3 sm:p-5 space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiData.map((kpi) => (
          <div key={kpi.label} className="rounded-lg border border-border p-3.5" style={{ background: "#0f1623" }}>
            <div className="text-[9px] text-slate-600 mb-1.5 uppercase tracking-widest" style={{ fontFamily: MONO }}>{kpi.label}</div>
            <div className="text-2xl font-bold text-white leading-none">{kpi.value}</div>
            <div className="flex items-center gap-1 mt-1.5" style={{ fontFamily: MONO }}>
              <TrendingUp size={9} style={{ color: kpi.color }} />
              <span className="text-[10px]" style={{ color: kpi.color }}>{kpi.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg border border-border p-4" style={{ background: "#0f1623" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-200">Avance vs Plan</h3>
              <p className="text-[10px] text-slate-600 mt-0.5" style={{ fontFamily: MONO }}>Torre Residencial Bío-Bío</p>
            </div>
            <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-1 rounded border border-border" style={{ fontFamily: MONO }}>SEM 44/52</span>
          </div>
          <DashboardProgressChart />
        </div>

        <div className="rounded-lg border border-border p-4" style={{ background: "#0f1623" }}>
          <h3 className="text-xs font-semibold text-slate-200 mb-0.5">Avance por Especialidad</h3>
          <p className="text-[10px] text-slate-600 mb-3" style={{ fontFamily: MONO }}>Desglose actual</p>
          <div className="flex h-[130px] items-center justify-center" role="img" aria-label="Avance por especialidad">
            <div
              className="relative h-28 w-28 rounded-full"
              style={{ background: "conic-gradient(#3b82f6 0% 35%, #10b981 35% 63%, #f59e0b 63% 85%, #8b5cf6 85% 100%)" }}
            >
              <div className="absolute inset-[18px] rounded-full border border-white/5" style={{ background: "#0f1623" }} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-slate-100">51%</span>
                <span className="text-[8px] uppercase tracking-widest text-slate-600" style={{ fontFamily: MONO }}>general</span>
              </div>
            </div>
          </div>
          <div className="space-y-1.5 mt-2">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-[11px] text-slate-400">{d.name}</span>
                </div>
                <span className="text-[10px] text-slate-300" style={{ fontFamily: MONO }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg border border-border p-4" style={{ background: "#0f1623" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-slate-200">Proyectos Activos</h3>
            <button className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5">
              Ver todos <ArrowUpRight size={10} />
            </button>
          </div>
          <div className="space-y-2">
            {projects.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-md bg-white/3 hover:bg-white/5 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-md bg-blue-600/15 border border-blue-600/25 flex items-center justify-center flex-shrink-0">
                  <Building2 size={13} className="text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-200 truncate">{p.name}</div>
                  <div className="text-[10px] text-slate-600 truncate" style={{ fontFamily: MONO }}>{p.client}</div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-24">
                    <div className="flex justify-between mb-1">
                      <span className="text-[9px] text-slate-500" style={{ fontFamily: MONO }}>{p.progress}%</span>
                    </div>
                    <div className="h-1 bg-white/8 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${p.progress}%`, background: p.progress > 70 ? "#10b981" : p.progress > 40 ? "#3b82f6" : "#f59e0b" }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-600" style={{ fontFamily: MONO }}>
                    <Users size={10} />
                    <span>{p.team}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border p-4" style={{ background: "#0f1623" }}>
          <h3 className="text-xs font-semibold text-slate-200 mb-3">Actividad Reciente</h3>
          <div className="space-y-3">
            {activities.map((a) => (
              <div key={a.id} className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-slate-800 border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[8px] font-bold text-slate-400">{a.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    <span className="font-semibold text-slate-200">{a.user}</span>{" "}
                    {a.action}{" "}
                    <span className="text-blue-400">{a.target}</span>
                  </div>
                  <div className="text-[9px] text-slate-700 mt-0.5" style={{ fontFamily: MONO }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── BIM Viewer ──────────────────────────────────────────────────────────────────
function BIMViewer() {
  const [selectedEl, setSelectedEl] = useState<string | null>(null);
  const [showProps, setShowProps] = useState(true);

  const props = selectedEl
    ? { "ID Elemento": selectedEl, "Tipo": "Muro H.A.", "Material": "HA-25/B/20/IIa", "Espesor": "200 mm", "Altura": "3.000 m", "Área": "12.6 m²", "Piso": "Nivel 7", "Estado": "Construido", "ITO": "Aprobado" }
    : null;

  const toolbarTools = [
    { icon: Move, label: "Orbitar" },
    { icon: ZoomIn, label: "Zoom In" },
    { icon: ZoomOut, label: "Zoom Out" },
    { icon: Crosshair, label: "Seleccionar" },
    { icon: Maximize2, label: "Extents" },
    { icon: RotateCcw, label: "Reset" },
    { icon: Layers, label: "Capas" },
    { icon: Sliders, label: "Secciones" },
  ];

  return (
    <div className="flex overflow-hidden" style={{ height: "calc(100vh - 112px)" }}>
      {/* Left toolbar */}
      <div className="w-10 flex flex-col items-center gap-0.5 p-1.5 border-r border-border flex-shrink-0" style={{ background: "#0b1019" }}>
        {toolbarTools.map(({ icon: Icon, label }) => (
          <button key={label} title={label} className="w-7 h-7 flex items-center justify-center rounded text-slate-600 hover:text-slate-200 hover:bg-white/8 transition-colors">
            <Icon size={13} />
          </button>
        ))}
      </div>

      {/* Viewport */}
      <div className="flex-1 relative overflow-hidden" style={{ background: "#060a12" }}>
        {/* View mode */}
        <div className="absolute top-3 left-3 z-10 flex gap-1">
          {["3D", "Planta", "ISO"].map((m) => (
            <button key={m} className={`px-2.5 py-1 rounded text-[9px] uppercase tracking-wider transition-colors border ${m === "3D" ? "bg-blue-600 text-white border-blue-600" : "bg-black/50 text-slate-500 border-border hover:text-slate-300"}`} style={{ fontFamily: MONO }}>
              {m}
            </button>
          ))}
        </div>

        {/* Info overlay */}
        <div className="absolute top-3 right-3 z-10 space-y-1.5">
          {[{ label: "ELEMENTOS", val: "4,827 obj" }, { label: "FORMATO", val: "IFC 4.0" }].map((s) => (
            <div key={s.label} className="bg-black/70 border border-border rounded px-2.5 py-1.5 backdrop-blur-sm" style={{ fontFamily: MONO }}>
              <div className="text-[8px] text-slate-700">{s.label}</div>
              <div className="text-[10px] text-slate-300">{s.val}</div>
            </div>
          ))}
        </div>

        {/* SVG BIM wireframe */}
        <svg viewBox="0 0 900 580" className="w-full h-full" onClick={() => setSelectedEl(null)}>
          <defs>
            <radialGradient id="bgG" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#0d1a2e" />
              <stop offset="100%" stopColor="#060a12" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <rect width="900" height="580" fill="url(#bgG)" />

          {/* Floor grid */}
          {Array.from({ length: 24 }).map((_, i) => (
            <line key={`fh${i}`} x1={150 + i * 30} y1="440" x2={200 + i * 30} y2="360" stroke="rgba(59,130,246,0.07)" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 14 }).map((_, i) => (
            <line key={`fv${i}`} x1="150" y1={360 + i * 6} x2="850" y2={360 + i * 6} stroke="rgba(59,130,246,0.05)" strokeWidth="0.5" />
          ))}

          {/* Ground shadow */}
          <polygon points="180,445 720,445 775,370 235,370" fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.2)" strokeWidth="0.8" />

          {/* Building floors */}
          {Array.from({ length: 14 }).map((_, floor) => {
            const y = 370 - floor * 25;
            const shrink = floor * 0.8;
            const x1 = 180 + shrink;
            const x2 = 720 - shrink;
            const xo = 55 - floor * 0.4;
            const isSelected = floor === 6;
            return (
              <g key={floor}>
                <polygon
                  points={`${x1},${y} ${x2},${y} ${x2 + xo},${y - 18} ${x1 + xo},${y - 18}`}
                  fill={isSelected ? "rgba(59,130,246,0.18)" : "rgba(8,12,20,0.85)"}
                  stroke={isSelected ? "rgba(59,130,246,0.9)" : "rgba(59,130,246,0.18)"}
                  strokeWidth={isSelected ? 1.5 : 0.5}
                  filter={isSelected ? "url(#glow)" : undefined}
                  className="cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); setSelectedEl(`MURO-EJE${String.fromCharCode(65 + (floor % 5))}${floor + 1}-P${floor + 1}`); }}
                />
                {/* Interior columns */}
                {[0.2, 0.4, 0.6, 0.8].map((frac, ci) => {
                  const cx = x1 + (x2 - x1) * frac;
                  return <line key={ci} x1={cx} y1={y} x2={cx + xo} y2={y - 18} stroke="rgba(6,182,212,0.2)" strokeWidth="0.4" />;
                })}
              </g>
            );
          })}

          {/* Vertical column guides */}
          {[180, 315, 450, 585, 720].map((x, i) => (
            <line key={i} x1={x} y1="370" x2={x} y2="20" stroke="rgba(59,130,246,0.1)" strokeWidth="0.4" strokeDasharray="3,5" />
          ))}

          {/* Roof */}
          <polygon points="195,30 705,30 760,10 250,10" fill="rgba(59,130,246,0.22)" stroke="rgba(59,130,246,0.7)" strokeWidth="1.5" filter="url(#glow)" />

          {/* Annotation: selected level */}
          <line x1="195" y1="195" x2="150" y2="168" stroke="rgba(6,182,212,0.5)" strokeWidth="0.8" />
          <rect x="72" y="155" width="76" height="22" rx="3" fill="#0f1623" stroke="rgba(6,182,212,0.4)" strokeWidth="0.8" />
          <text x="110" y="170" textAnchor="middle" fill="#22d3ee" fontSize="8.5" fontFamily={MONO}>PISO 7 — SEL.</text>

          {/* Annotation: progress */}
          <line x1="718" y1="330" x2="770" y2="304" stroke="rgba(16,185,129,0.5)" strokeWidth="0.8" />
          <rect x="772" y="292" width="82" height="22" rx="3" fill="#0f1623" stroke="rgba(16,185,129,0.4)" strokeWidth="0.8" />
          <text x="813" y="307" textAnchor="middle" fill="#10b981" fontSize="8.5" fontFamily={MONO}>+68.0% avce.</text>

          {/* Height dim */}
          <line x1="775" y1="370" x2="775" y2="30" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />
          <text x="790" y="206" fill="#374151" fontSize="8" fontFamily={MONO} transform="rotate(90 790 206)">H = 42.0 m</text>

          {/* North */}
          <g transform="translate(848, 520)">
            <circle cx="0" cy="0" r="16" fill="rgba(8,12,20,0.85)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
            <polygon points="0,-11 4,5 0,1 -4,5" fill="#3b82f6" />
            <polygon points="0,11 4,-5 0,-1 -4,-5" fill="rgba(255,255,255,0.15)" />
            <text x="0" y="4" textAnchor="middle" fill="white" fontSize="7" fontFamily={MONO}>N</text>
          </g>

          {/* Selected tooltip */}
          {selectedEl && (
            <g>
              <rect x="18" y="18" width="162" height="44" rx="4" fill="rgba(8,12,20,0.95)" stroke="rgba(59,130,246,0.5)" strokeWidth="1" />
              <text x="28" y="34" fill="#22d3ee" fontSize="8.5" fontFamily={MONO}>ELEMENTO SELECCIONADO</text>
              <text x="28" y="50" fill="#94a3b8" fontSize="8.5" fontFamily={MONO}>{selectedEl}</text>
            </g>
          )}
        </svg>

        {/* Status bar */}
        <div className="absolute bottom-0 left-0 right-0 h-7 flex items-center gap-4 px-3 border-t border-border text-[9px] text-slate-700" style={{ background: "rgba(6,10,18,0.95)", fontFamily: MONO }}>
          <span>X: 12.340</span>
          <span>Y: 7.820</span>
          <span>Z: 19.600</span>
          <span className="ml-auto text-slate-800">Torre Bío-Bío · Arq. v4.0 · IFC 4.0 · {new Date().toLocaleDateString("es-CL")}</span>
        </div>
      </div>

      {/* Properties panel */}
      {showProps && (
        <div className="w-60 border-l border-border flex flex-col flex-shrink-0" style={{ background: "#0b1019" }}>
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-border flex-shrink-0">
            <span className="text-xs font-semibold text-slate-300">Propiedades</span>
            <button onClick={() => setShowProps(false)} className="text-slate-600 hover:text-slate-400 transition-colors">
              <X size={12} />
            </button>
          </div>
          {props ? (
            <div className="flex-1 overflow-y-auto p-2.5">
              {Object.entries(props).map(([k, v]) => (
                <div key={k} className="flex justify-between items-start gap-2 py-1.5 border-b border-border/40">
                  <span className="text-[9px] text-slate-600 flex-shrink-0" style={{ fontFamily: MONO }}>{k}</span>
                  <span className="text-[10px] text-slate-300 text-right">{v}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-5 text-center">
              <Crosshair size={22} className="text-slate-800 mb-2.5" />
              <p className="text-[11px] text-slate-700 leading-relaxed">Haz clic en un elemento del modelo para ver sus propiedades</p>
            </div>
          )}
          <div className="border-t border-border p-3 flex-shrink-0">
            <div className="text-[9px] font-semibold text-slate-700 uppercase tracking-widest mb-2" style={{ fontFamily: MONO }}>Capas visibles</div>
            {["Estructura", "Arquitectura", "MMEESS", "Terminaciones"].map((layer) => (
              <div key={layer} className="flex items-center gap-2 py-1">
                <div className="w-2.5 h-2.5 rounded-sm bg-blue-500/50 border border-blue-500/30 flex-shrink-0" />
                <span className="text-[10px] text-slate-500 flex-1">{layer}</span>
                <Eye size={10} className="text-slate-700" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Planning (Gantt) ─────────────────────────────────────────────────────────
function Planning() {
  const [selectedTask, setSelectedTask] = useState<number | null>(null);

  return (
    <div className="p-3 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-semibold text-slate-200">Carta Gantt</h2>
          <span className="text-[9px] bg-white/5 border border-border px-2 py-0.5 rounded text-slate-500" style={{ fontFamily: MONO }}>Torre Bío-Bío · 36 semanas</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-white/5 border border-border px-2.5 py-1.5 rounded hover:bg-white/8 transition-colors">
            <Filter size={11} /> Filtrar
          </button>
          <button className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-white/5 border border-border px-2.5 py-1.5 rounded hover:bg-white/8 transition-colors">
            <Download size={11} /> Exportar
          </button>
          <button className="flex items-center gap-1.5 text-[11px] text-white bg-blue-600 px-2.5 py-1.5 rounded hover:bg-blue-700 transition-colors">
            <Plus size={11} /> Actividad
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-auto" style={{ background: "#0f1623" }}>
        <div style={{ minWidth: 960 }}>
          {/* Header */}
          <div className="flex border-b border-border sticky top-0 z-10" style={{ background: "#0f1623" }}>
            <div className="w-64 flex-shrink-0 px-3 py-2 border-r border-border">
              <span className="text-[9px] font-semibold text-slate-600 uppercase tracking-widest" style={{ fontFamily: MONO }}>Actividad</span>
            </div>
            <div className="w-20 flex-shrink-0 px-2 py-2 border-r border-border text-center">
              <span className="text-[9px] font-semibold text-slate-600 uppercase tracking-widest" style={{ fontFamily: MONO }}>Resp.</span>
            </div>
            <div className="w-16 flex-shrink-0 px-2 py-2 border-r border-border text-center">
              <span className="text-[9px] font-semibold text-slate-600 uppercase tracking-widest" style={{ fontFamily: MONO }}>%</span>
            </div>
            <div className="flex-1 relative">
              <div className="flex">
                {Array.from({ length: TOTAL_WEEKS }).map((_, i) => (
                  <div key={i} className={`flex-1 py-2 text-center border-r border-border/20 ${i === 20 ? "bg-blue-600/8" : ""}`} style={{ minWidth: 18 }}>
                    {i % 4 === 0 && (
                      <span className="text-[7px] text-slate-700" style={{ fontFamily: MONO }}>{`S${String(i + 1).padStart(2, "0")}`}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tasks */}
          {ganttTasks.map((task) => {
            const initials = task.responsible.split(" ").map((n) => n[0]).join("");
            return (
              <div
                key={task.id}
                className={`flex border-b border-border/40 cursor-pointer transition-colors ${selectedTask === task.id ? "bg-blue-600/6" : "hover:bg-white/2"}`}
                onClick={() => setSelectedTask(task.id === selectedTask ? null : task.id)}
              >
                <div className="w-64 flex-shrink-0 flex items-center gap-2 px-3 py-2.5 border-r border-border">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: task.color }} />
                  <span className="text-xs text-slate-300 truncate">{task.name}</span>
                </div>
                <div className="w-20 flex-shrink-0 flex items-center justify-center px-2 py-2.5 border-r border-border">
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center border border-border">
                    <span className="text-[8px] font-bold text-slate-400">{initials}</span>
                  </div>
                </div>
                <div className="w-16 flex-shrink-0 flex items-center justify-center px-2 py-2.5 border-r border-border">
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: task.progress === 100 ? "#10b981" : task.progress > 50 ? "#3b82f6" : "#94a3b8", fontFamily: MONO }}
                  >
                    {task.progress}%
                  </span>
                </div>
                <div className="flex-1 relative flex items-center" style={{ minWidth: 0 }}>
                  {/* Week grid bg */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    {Array.from({ length: TOTAL_WEEKS }).map((_, i) => (
                      <div key={i} className={`flex-1 border-r border-border/10 ${i === 20 ? "bg-blue-600/5" : ""}`} style={{ minWidth: 18 }} />
                    ))}
                  </div>
                  {/* Bar */}
                  <div
                    className="absolute rounded overflow-hidden"
                    style={{
                      left: `${(task.start / TOTAL_WEEKS) * 100}%`,
                      width: `${(task.duration / TOTAL_WEEKS) * 100}%`,
                      height: 18,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: `${task.color}20`,
                      border: `1px solid ${task.color}50`,
                    }}
                  >
                    <div className="h-full rounded" style={{ width: `${task.progress}%`, background: task.color, opacity: 0.65 }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-5 mt-3">
        {[
          { color: "rgba(59,130,246,0.25)", border: "rgba(59,130,246,0.5)", label: "Planificado" },
          { color: "#3b82f6", border: "#3b82f6", label: "Avance real" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-5 h-2 rounded" style={{ background: l.color, border: `1px solid ${l.border}` }} />
            <span className="text-[10px] text-slate-600" style={{ fontFamily: MONO }}>{l.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-600/30 border border-blue-500/50" />
          <span className="text-[10px] text-slate-600" style={{ fontFamily: MONO }}>Semana actual (S21)</span>
        </div>
      </div>
    </div>
  );
}

// ─── Kanban ──────────────────────────────────────────────────────────────────────
type KanbanItem = { id: number; title: string; priority: string; assignee: string; tag: string; dueDate: string };

const kanbanCols = [
  { id: "pendiente", label: "Pendiente", color: "#64748b" },
  { id: "ejecucion", label: "En Ejecución", color: "#3b82f6" },
  { id: "revision", label: "En Revisión", color: "#f59e0b" },
  { id: "finalizado", label: "Finalizado", color: "#10b981" },
];

function KanbanCard({ item }: { item: KanbanItem }) {
  return (
    <div className="rounded-md border border-border p-2.5 cursor-default hover:border-slate-700 transition-all" style={{ background: "#0b1019" }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[11px] text-slate-200 leading-snug">{item.title}</span>
        <button className="text-slate-700 hover:text-slate-400 flex-shrink-0"><MoreHorizontal size={12} /></button>
      </div>
      <div className="flex items-center gap-1 flex-wrap">
        <span className={`text-[8px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider ${priorityBadge[item.priority]}`} style={{ fontFamily: MONO }}>{item.priority}</span>
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500 border border-border" style={{ fontFamily: MONO }}>{item.tag}</span>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[9px] text-slate-700" style={{ fontFamily: MONO }}>{item.dueDate}</span>
        <div className="w-5 h-5 rounded-full bg-slate-800 border border-border flex items-center justify-center">
          <span className="text-[8px] font-bold text-slate-500">{item.assignee}</span>
        </div>
      </div>
    </div>
  );
}

function KanbanBoard() {
  return (
    <div className="p-5 flex flex-col" style={{ height: "calc(100vh - 112px)" }}>
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-sm font-semibold text-slate-200">Kanban Board</h2>
        <button className="flex items-center gap-1.5 text-[11px] text-white bg-blue-600 px-2.5 py-1.5 rounded hover:bg-blue-700 transition-colors">
          <Plus size={11} /> Nueva Tarea
        </button>
      </div>
      <div className="flex gap-3 flex-1 min-h-0 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
        {kanbanCols.map((col) => {
          const items = kanbanData[col.id];
          return (
            <div key={col.id} className="flex flex-col rounded-lg border border-border overflow-hidden flex-shrink-0 w-72 sm:flex-1" style={{ background: "#0f1623" }}>
              <div className="px-3 py-2.5 border-b border-border flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                  <span className="text-xs font-semibold text-slate-300">{col.label}</span>
                </div>
                <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-slate-600 border border-border" style={{ fontFamily: MONO }}>{items.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
                {items.map((item) => <KanbanCard key={item.id} item={item} />)}
              </div>
              <div className="p-2 border-t border-border flex-shrink-0">
                <button className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[10px] text-slate-700 hover:text-slate-500 hover:bg-white/3 rounded transition-colors">
                  <Plus size={10} /> Agregar tarea
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Calendar ─────────────────────────────────────────────────────────────────
function CalendarView() {
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const startDay = 4;
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let i = 1; i <= 30; i++) cells.push(i);
  const getEvents = (day: number) => calendarEvents.filter((e) => e.date === day);

  return (
    <div className="p-3 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-200">Noviembre 2024</h2>
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 text-slate-500 hover:text-slate-300 border border-border rounded text-xs">{"‹"}</button>
          <button className="px-2 py-1 text-slate-500 hover:text-slate-300 border border-border rounded text-xs">{"›"}</button>
          <button className="flex items-center gap-1.5 text-[11px] text-white bg-blue-600 px-2.5 py-1.5 rounded hover:bg-blue-700 transition-colors">
            <Plus size={11} /> Evento
          </button>
        </div>
      </div>
      <div className="rounded-lg border border-border overflow-hidden" style={{ background: "#0f1623" }}>
        <div className="grid grid-cols-7 border-b border-border">
          {days.map((d) => (
            <div key={d} className="py-2 text-center text-[9px] text-slate-600 uppercase tracking-widest" style={{ fontFamily: MONO }}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            const evts = day ? getEvents(day) : [];
            const isToday = day === 22;
            return (
              <div key={idx} className={`min-h-[88px] p-1.5 border-b border-r border-border/30 ${!day ? "bg-white/1" : "hover:bg-white/2 cursor-pointer"} transition-colors`}>
                {day && (
                  <>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 text-[11px] ${isToday ? "bg-blue-600 text-white font-bold" : "text-slate-500"}`} style={{ fontFamily: MONO }}>
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {evts.slice(0, 2).map((ev, ei) => (
                        <div key={ei} className="rounded px-1 py-0.5 text-[8.5px] truncate" style={{ background: `${ev.color}20`, color: ev.color, borderLeft: `2px solid ${ev.color}`, fontFamily: MONO }}>
                          {ev.time} {ev.title}
                        </div>
                      ))}
                      {evts.length > 2 && <div className="text-[8px] text-slate-600 pl-1" style={{ fontFamily: MONO }}>+{evts.length - 2} más</div>}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Documents ────────────────────────────────────────────────────────────────
function Documents() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  return (
    <div className="p-3 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-200">Gestión Documental</h2>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-border overflow-hidden">
            <button onClick={() => setViewMode("list")} className={`p-1.5 transition-colors ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-white/5 text-slate-600 hover:text-slate-300"}`}><List size={12} /></button>
            <button onClick={() => setViewMode("grid")} className={`p-1.5 transition-colors ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-white/5 text-slate-600 hover:text-slate-300"}`}><LayoutGrid size={12} /></button>
          </div>
          <button className="flex items-center gap-1.5 text-[11px] text-white bg-blue-600 px-2.5 py-1.5 rounded hover:bg-blue-700 transition-colors">
            <Upload size={11} /> Subir documento
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden" style={{ background: "#0f1623" }}>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-border">
              {["Documento", "Tipo", "Versión", "Autor", "Actualizado", "Estado", "Tamaño", ""].map((h) => (
                <th key={h} className="text-left px-3 py-2.5 text-[9px] font-semibold text-slate-600 uppercase tracking-widest" style={{ fontFamily: MONO }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-b border-border/40 hover:bg-white/2 transition-colors cursor-pointer">
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0" style={{ background: `${fileTypeColor[doc.type] || "#475569"}15`, border: `1px solid ${fileTypeColor[doc.type] || "#475569"}35` }}>
                      <span className="text-[7px] font-bold" style={{ color: fileTypeColor[doc.type] || "#94a3b8", fontFamily: MONO }}>{doc.type}</span>
                    </div>
                    <span className="text-xs text-slate-300">{doc.name}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5"><span className="text-[10px] text-slate-500" style={{ fontFamily: MONO }}>{doc.type}</span></td>
                <td className="px-3 py-2.5"><span className="text-[10px] text-slate-400" style={{ fontFamily: MONO }}>v{doc.version}</span></td>
                <td className="px-3 py-2.5"><span className="text-xs text-slate-400">{doc.author}</span></td>
                <td className="px-3 py-2.5"><span className="text-[10px] text-slate-600" style={{ fontFamily: MONO }}>{doc.updatedAt}</span></td>
                <td className="px-3 py-2.5">
                  <span className={`text-[9px] px-2 py-0.5 rounded ${statusBadge[doc.status]}`} style={{ fontFamily: MONO }}>{doc.status.replace("_", " ")}</span>
                </td>
                <td className="px-3 py-2.5"><span className="text-[10px] text-slate-600" style={{ fontFamily: MONO }}>{doc.size}</span></td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1">
                    <button className="p-1 text-slate-700 hover:text-slate-400 rounded transition-colors"><Eye size={12} /></button>
                    <button className="p-1 text-slate-700 hover:text-slate-400 rounded transition-colors"><Download size={12} /></button>
                    <button className="p-1 text-slate-700 hover:text-slate-400 rounded transition-colors"><MoreHorizontal size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

// ─── Inspections ──────────────────────────────────────────────────────────────
function Inspections() {
  return (
    <div className="p-3 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-200">Inspecciones</h2>
        <button className="flex items-center gap-1.5 text-[11px] text-white bg-blue-600 px-2.5 py-1.5 rounded hover:bg-blue-700 transition-colors">
          <Plus size={11} /> Nueva Inspección
        </button>
      </div>
      <div className="space-y-2.5">
        {inspections.map((insp) => (
          <div key={insp.id} className="rounded-lg border border-border p-3.5 hover:border-slate-700 transition-colors cursor-pointer" style={{ background: "#0f1623" }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider ${priorityBadge[insp.priority]}`} style={{ fontFamily: MONO }}>{insp.priority}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${statusBadge[insp.status]}`} style={{ fontFamily: MONO }}>{insp.status.replace("_", " ")}</span>
                </div>
                <h3 className="text-sm font-medium text-slate-200 mb-1.5">{insp.title}</h3>
                <div className="flex items-center gap-4 text-[10px] text-slate-600 flex-wrap" style={{ fontFamily: MONO }}>
                  <span>📍 {insp.location}</span>
                  <span>👤 {insp.responsible}</span>
                  <span>📅 {insp.date}</span>
                  <span>📷 {insp.photos} fotos</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button className="p-1.5 text-slate-700 hover:text-slate-400 rounded border border-border transition-colors"><Eye size={12} /></button>
                <button className="p-1.5 text-slate-700 hover:text-slate-400 rounded border border-border transition-colors"><Upload size={12} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Issues ───────────────────────────────────────────────────────────────────
function Issues() {
  const [filter, setFilter] = useState("Todas");
  const filters = ["Todas", "Abiertas", "En revisión", "Cerradas"];

  return (
    <div className="p-3 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-slate-200">Incidencias</h2>
          <div className="flex gap-1">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[10px] px-2.5 py-1 rounded border transition-colors ${filter === f ? "bg-blue-600/15 border-blue-500/35 text-blue-400" : "border-border text-slate-600 hover:text-slate-300 bg-white/3"}`}
                style={{ fontFamily: MONO }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <button className="flex items-center gap-1.5 text-[11px] text-white bg-blue-600 px-2.5 py-1.5 rounded hover:bg-blue-700 transition-colors">
          <Plus size={11} /> Nueva Incidencia
        </button>
      </div>
      <div className="rounded-lg border border-border overflow-hidden" style={{ background: "#0f1623" }}>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-border">
              {["ID", "Título", "Prioridad", "Estado", "Responsable", "Elemento BIM", "Fecha"].map((h) => (
                <th key={h} className="text-left px-3 py-2.5 text-[9px] font-semibold text-slate-600 uppercase tracking-widest" style={{ fontFamily: MONO }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => (
              <tr key={issue.id} className="border-b border-border/40 hover:bg-white/2 transition-colors cursor-pointer">
                <td className="px-3 py-3"><span className="text-[10px] text-blue-400" style={{ fontFamily: MONO }}>{issue.id}</span></td>
                <td className="px-3 py-3">
                  <div className="text-xs font-medium text-slate-200">{issue.title}</div>
                  <div className="text-[10px] text-slate-600 mt-0.5 max-w-xs truncate" style={{ fontFamily: MONO }}>{issue.description}</div>
                </td>
                <td className="px-3 py-3">
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider ${priorityBadge[issue.priority]}`} style={{ fontFamily: MONO }}>{issue.priority}</span>
                </td>
                <td className="px-3 py-3">
                  <span className={`text-[9px] px-2 py-0.5 rounded ${statusBadge[issue.status]}`} style={{ fontFamily: MONO }}>{issue.status.replace("_", " ")}</span>
                </td>
                <td className="px-3 py-3"><span className="text-xs text-slate-400">{issue.responsible}</span></td>
                <td className="px-3 py-3">
                  {issue.element
                    ? <span className="text-[9px] text-cyan-400/70 bg-cyan-500/8 border border-cyan-500/20 px-1.5 py-0.5 rounded" style={{ fontFamily: MONO }}>{issue.element}</span>
                    : <span className="text-slate-700">—</span>
                  }
                </td>
                <td className="px-3 py-3"><span className="text-[10px] text-slate-600" style={{ fontFamily: MONO }}>{issue.created}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

// ─── Reports ─────────────────────────────────────────────────────────────────
function Reports() {
  const indicators = [
    { label: "SPI (Schedule Performance Index)", value: "0.87", pct: 87, status: "warning" },
    { label: "CPI (Cost Performance Index)", value: "0.94", pct: 94, status: "warning" },
    { label: "Productividad HH", value: "83%", pct: 83, status: "good" },
    { label: "Índice de Calidad ITO", value: "96%", pct: 96, status: "good" },
    { label: "Tasa Incidencias / Semana", value: "2.3", pct: 46, status: "neutral" },
    { label: "Documentos en Regla", value: "78%", pct: 78, status: "warning" },
  ];

  return (
    <div className="p-3 sm:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">Reportes y KPIs</h2>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-white/5 border border-border px-2.5 py-1.5 rounded hover:bg-white/8 transition-colors"><Download size={11} /> PDF</button>
          <button className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-white/5 border border-border px-2.5 py-1.5 rounded hover:bg-white/8 transition-colors"><Download size={11} /> Excel</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly */}
        <div className="rounded-lg border border-border p-4" style={{ background: "#0f1623" }}>
          <h3 className="text-xs font-semibold text-slate-300 mb-3">Avance Diario — Semana 47</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={reportsWeekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: "#475569", fontSize: 9, fontFamily: MONO }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#475569", fontSize: 9, fontFamily: MONO }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, fontSize: 11 }} />
              <Bar key="reports-weekly-meta" dataKey="meta" fill="rgba(59,130,246,0.12)" name="Meta" radius={[2, 2, 0, 0]} />
              <Bar key="reports-weekly-avance" dataKey="avance" fill="#3b82f6" name="Avance" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* HH */}
        <div className="rounded-lg border border-border p-4" style={{ background: "#0f1623" }}>
          <h3 className="text-xs font-semibold text-slate-300 mb-3">Horas Hombre (HH) Mensuales</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={reportsHH}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 9, fontFamily: MONO }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#475569", fontSize: 9, fontFamily: MONO }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, fontSize: 11 }} />
              <Line key="reports-hours-plan" type="monotone" dataKey="plan" stroke="#334155" strokeWidth={1.5} strokeDasharray="4 2" name="Plan" dot={false} activeDot={false} />
              <Line key="reports-hours-real" type="monotone" dataKey="real" stroke="#10b981" strokeWidth={2} name="Real" dot={{ fill: "#10b981", r: 3, strokeWidth: 0 }} activeDot={{ r: 4, fill: "#10b981", stroke: "#d1fae5", strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie issues */}
        <div className="rounded-lg border border-border p-4" style={{ background: "#0f1623" }}>
          <h3 className="text-xs font-semibold text-slate-300 mb-3">Incidencias por Prioridad</h3>
          <div className="flex items-center gap-6">
            <PieChart width={130} height={130}>
              <Pie
                data={[{ name: "Crítica", value: 2 }, { name: "Alta", value: 5 }, { name: "Media", value: 3 }, { name: "Baja", value: 2 }]}
                cx="50%" cy="50%" innerRadius={33} outerRadius={52} dataKey="value" strokeWidth={0}
              >
                {["#ef4444", "#f97316", "#f59e0b", "#64748b"].map((c, i) => <Cell key={`issues-pie-${i}`} fill={c} />)}
              </Pie>
            </PieChart>
            <div className="space-y-2.5">
              {[{ label: "Crítica", count: 2, color: "#ef4444" }, { label: "Alta", count: 5, color: "#f97316" }, { label: "Media", count: 3, color: "#f59e0b" }, { label: "Baja", count: 2, color: "#64748b" }].map((it) => (
                <div key={it.label} className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: it.color }} />
                  <span className="text-xs text-slate-400 flex-1">{it.label}</span>
                  <span className="text-xs font-bold text-slate-300" style={{ fontFamily: MONO }}>{it.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="rounded-lg border border-border p-4" style={{ background: "#0f1623" }}>
          <h3 className="text-xs font-semibold text-slate-300 mb-4">Indicadores de Gestión</h3>
          <div className="space-y-3">
            {indicators.map((kpi) => (
              <div key={kpi.label} className="flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500 flex-1 truncate">{kpi.label}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-20 h-1.5 rounded-full bg-white/6 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${kpi.pct}%`, background: kpi.status === "good" ? "#10b981" : kpi.status === "warning" ? "#f59e0b" : "#475569" }}
                    />
                  </div>
                  <span
                    className="text-[10px] font-bold w-10 text-right"
                    style={{ fontFamily: MONO, color: kpi.status === "good" ? "#10b981" : kpi.status === "warning" ? "#f59e0b" : "#64748b" }}
                  >
                    {kpi.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Map ──────────────────────────────────────────────────────────────────────
const mapMarkers = [
  { x: 375, y: 145, city: "Antofagasta", project: projects[1], color: "#3b82f6" },
  { x: 378, y: 275, city: "Concepción", project: projects[0], color: "#10b981" },
  { x: 368, y: 312, city: "Valdivia", project: projects[2], color: "#f59e0b" },
  { x: 360, y: 118, city: "Iquique", project: projects[3], color: "#8b5cf6" },
];

function MapView() {
  const [selected, setSelected] = useState<typeof projects[0] | null>(null);

  return (
    <div className="p-3 sm:p-5">
      <h2 className="text-sm font-semibold text-slate-200 mb-4">Mapa de Proyectos</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg border border-border overflow-hidden relative" style={{ background: "#060d1a", height: 460 }}>
          <svg viewBox="0 0 800 460" className="w-full h-full">
            <rect width="800" height="460" fill="#060d1a" />
            {Array.from({ length: 24 }).map((_, i) => (
              <line key={`gh${i}`} x1="0" y1={i * 20} x2="800" y2={i * 20} stroke="rgba(59,130,246,0.04)" strokeWidth="0.5" />
            ))}
            {Array.from({ length: 40 }).map((_, i) => (
              <line key={`gv${i}`} x1={i * 20} y1="0" x2={i * 20} y2="460" stroke="rgba(59,130,246,0.04)" strokeWidth="0.5" />
            ))}
            {/* Chile silhouette */}
            <path d="M 370,60 Q 382,100 378,155 Q 384,210 373,260 Q 362,310 358,360 Q 352,410 348,445" stroke="rgba(59,130,246,0.25)" strokeWidth="52" fill="none" strokeLinecap="round" />
            <path d="M 370,60 Q 382,100 378,155 Q 384,210 373,260 Q 362,310 358,360 Q 352,410 348,445" stroke="#060d1a" strokeWidth="48" fill="none" strokeLinecap="round" />
            <path d="M 370,60 Q 382,100 378,155 Q 384,210 373,260 Q 362,310 358,360 Q 352,410 348,445" stroke="rgba(59,130,246,0.1)" strokeWidth="42" fill="none" strokeLinecap="round" />

            {/* Project markers */}
            {mapMarkers.map((m, i) => (
              <g key={i} className="cursor-pointer" onClick={() => setSelected(m.project === selected ? null : m.project)}>
                <circle cx={m.x} cy={m.y} r={selected?.id === m.project.id ? 18 : 12} fill={`${m.color}20`} stroke={m.color} strokeWidth="1.2" style={{ transition: "r 0.2s" }} />
                <circle cx={m.x} cy={m.y} r="4" fill={m.color} />
                <text x={m.x + 16} y={m.y - 3} fill="rgba(255,255,255,0.8)" fontSize="9" fontFamily={MONO}>{m.city}</text>
                <text x={m.x + 16} y={m.y + 9} fill={m.color} fontSize="8.5" fontFamily={MONO}>{m.project.progress}% avce.</text>
              </g>
            ))}

            {/* Legend */}
            <rect x="580" y="16" width="200" height="96" rx="4" fill="rgba(6,13,26,0.92)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.8" />
            <text x="592" y="34" fill="#475569" fontSize="8" fontFamily={MONO} fontWeight="600">PROYECTOS ACTIVOS</text>
            {projects.map((p, i) => (
              <g key={i}>
                <circle cx="592" cy={48 + i * 16} r="4" fill={["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6"][i]} />
                <text x="601" y={52 + i * 16} fill="#64748b" fontSize="8.5" fontFamily={MONO}>{p.name.substring(0, 24)}</text>
              </g>
            ))}

            {/* North */}
            <g transform="translate(752, 428)">
              <circle cx="0" cy="0" r="16" fill="rgba(6,13,26,0.9)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
              <polygon points="0,-11 3.5,5 0,1.5 -3.5,5" fill="#3b82f6" />
              <polygon points="0,11 3.5,-5 0,-1.5 -3.5,-5" fill="rgba(255,255,255,0.15)" />
              <text x="0" y="4" textAnchor="middle" fill="white" fontSize="7" fontFamily={MONO}>N</text>
            </g>
          </svg>
          <div className="absolute bottom-3 right-3 flex flex-col gap-1">
            <button className="w-7 h-7 bg-black/60 border border-border rounded text-slate-500 hover:text-white flex items-center justify-center backdrop-blur-sm transition-colors"><ZoomIn size={12} /></button>
            <button className="w-7 h-7 bg-black/60 border border-border rounded text-slate-500 hover:text-white flex items-center justify-center backdrop-blur-sm transition-colors"><ZoomOut size={12} /></button>
          </div>
        </div>

        <div className="space-y-2.5">
          <h3 className="text-[9px] font-semibold text-slate-600 uppercase tracking-widest mb-3" style={{ fontFamily: MONO }}>Ubicaciones</h3>
          {projects.map((p, i) => (
            <div
              key={p.id}
              onClick={() => setSelected(p === selected ? null : p)}
              className={`rounded-lg border p-3 cursor-pointer transition-all ${selected?.id === p.id ? "border-blue-500/40 bg-blue-600/6" : "border-border hover:border-slate-700"}`}
              style={{ background: selected?.id === p.id ? undefined : "#0f1623" }}
            >
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: `${["#10b981","#3b82f6","#f59e0b","#8b5cf6"][i]}15`, border: `1px solid ${["#10b981","#3b82f6","#f59e0b","#8b5cf6"][i]}30` }}>
                  <Building2 size={13} style={{ color: ["#10b981","#3b82f6","#f59e0b","#8b5cf6"][i] }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-200 truncate">{p.name}</div>
                  <div className="text-[9px] text-slate-600 mt-0.5" style={{ fontFamily: MONO }}>📍 {p.location}</div>
                  <div className="mt-1.5 h-1 bg-white/6 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: ["#10b981","#3b82f6","#f59e0b","#8b5cf6"][i] }} />
                  </div>
                  <div className="text-[9px] text-slate-700 mt-0.5" style={{ fontFamily: MONO }}>{p.progress}% completado</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Admin ────────────────────────────────────────────────────────────────────
function AdminPanel() {
  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">Panel Administrativo</h2>
        <button className="flex items-center gap-1.5 text-[11px] text-white bg-blue-600 px-2.5 py-1.5 rounded hover:bg-blue-700 transition-colors">
          <Plus size={11} /> Invitar Usuario
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Usuarios", value: "83", icon: Users, color: "#3b82f6" },
          { label: "Roles Activos", value: "5", icon: Shield, color: "#8b5cf6" },
          { label: "Proyectos", value: "4", icon: Building2, color: "#10b981" },
          { label: "Empresas", value: "7", icon: Globe, color: "#06b6d4" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-lg border border-border p-3.5" style={{ background: "#0f1623" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] text-slate-600 uppercase tracking-widest" style={{ fontFamily: MONO }}>{stat.label}</span>
                <Icon size={13} style={{ color: stat.color }} />
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-border overflow-hidden" style={{ background: "#0f1623" }}>
        <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">Usuarios del Sistema</span>
          <div className="flex items-center gap-1.5 bg-white/5 border border-border rounded-md px-2.5 py-1">
            <Search size={11} className="text-slate-600" />
            <input placeholder="Buscar usuario..." className="bg-transparent text-[11px] text-slate-300 placeholder:text-slate-700 outline-none w-28" />
          </div>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[520px]">
          <thead>
            <tr className="border-b border-border">
              {["Usuario", "Rol", "Estado", "Proyectos", "Último acceso", ""].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 text-[9px] font-semibold text-slate-600 uppercase tracking-widest" style={{ fontFamily: MONO }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {adminUsers.map((user) => {
              const initials = user.name.split(" ").map((n) => n[0]).join("").substring(0, 2);
              return (
                <tr key={user.id} className="border-b border-border/40 hover:bg-white/2 transition-colors cursor-pointer">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-white">{initials}</span>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-slate-200">{user.name}</div>
                        <div className="text-[9px] text-slate-600" style={{ fontFamily: MONO }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5"><span className="text-[10px] text-slate-400">{user.role}</span></td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${user.status === "activo" ? "bg-emerald-400" : "bg-slate-600"}`} />
                      <span className="text-[10px] text-slate-400" style={{ fontFamily: MONO }}>{user.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5"><span className="text-[10px] text-slate-500" style={{ fontFamily: MONO }}>{user.projects}</span></td>
                  <td className="px-4 py-2.5"><span className="text-[10px] text-slate-600" style={{ fontFamily: MONO }}>{user.lastLogin}</span></td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1">
                      <button className="p-1 text-slate-700 hover:text-slate-400 rounded transition-colors"><Eye size={12} /></button>
                      <button className="p-1 text-slate-700 hover:text-slate-400 rounded transition-colors"><MoreHorizontal size={12} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

// ─── App Shell ───────────────────────────────────────────────────────────────
function AppShell() {
  const { perfil, signOut } = useAuth();
  const [activeModule, setActiveModule] = useState<Module>("dashboard");
  const permitidos = ACCESO[perfil!.rol];
  const modulo = permitidos.includes(activeModule) ? activeModule : permitidos[0];
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div
      className="h-screen w-full flex bg-background text-foreground overflow-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      <Sidebar
        active={modulo}
        permitidos={permitidos}
        nombre={`${perfil!.nombres} ${perfil!.apellidos}`}
        rolTexto={ROL_LABEL[perfil!.rol]}
        iniciales={`${perfil!.nombres[0] ?? ""}${perfil!.apellidos[0] ?? ""}`.toUpperCase()}
        onLogout={signOut}
        onNavigate={setActiveModule}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar module={modulo} onMenuToggle={() => setMobileOpen((o) => !o)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.08) transparent" }}>
          {modulo === "dashboard" && <Dashboard />}
          {modulo === "bim" && <BIMViewer />}
          {modulo === "planning" && <Planning />}
          {modulo === "kanban" && <KanbanBoard />}
          {modulo === "calendar" && <CalendarView />}
          {modulo === "documents" && <Documents />}
          {modulo === "inspections" && <Inspections />}
          {modulo === "issues" && <Issues />}
          {modulo === "reports" && <Reports />}
          {modulo === "map" && <MapView />}
          {modulo === "admin" && <AdminPanel />}
        </main>
      </div>
    </div>
  );
}

function Gate() {
  const { loading, perfil } = useAuth();
  if (loading) return <div className="h-screen w-full bg-background flex items-center justify-center text-sm text-slate-500">Cargando…</div>;
  return perfil ? <AppShell /> : <AuthScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
