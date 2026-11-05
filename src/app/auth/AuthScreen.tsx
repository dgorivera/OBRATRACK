import { useState } from "react";
import obraTrackLogo from "@/imports/obratrack-1-1.png";
import { useAuth } from "@/app/auth/AuthContext";

const rutValido = (v: string) => {
  const m = /^(\d{7,8})-([\dkK])$/.exec(v.trim());
  if (!m) return false;
  let s = 0, f = 2;
  for (let i = m[1].length - 1; i >= 0; i--) { s += Number(m[1][i]) * f; f = f === 7 ? 2 : f + 1; }
  const r = 11 - (s % 11);
  return (r === 11 ? "0" : r === 10 ? "K" : String(r)) === m[2].toUpperCase();
};
const correoValido = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const input = "w-full rounded-md border border-border bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

function Campo(p: { label: string; value: string; onChange: (v: string) => void; error?: string; type?: string; placeholder?: string; autoComplete?: string; hint?: string }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-300 mb-1">{p.label}</span>
      <input className={input} type={p.type ?? "text"} value={p.value} placeholder={p.placeholder} autoComplete={p.autoComplete}
        aria-invalid={!!p.error} onChange={(e) => p.onChange(e.target.value)} />
      {p.hint && !p.error && <span className="block text-[11px] text-slate-500 mt-1">{p.hint}</span>}
      {p.error && <span className="block text-[11px] text-red-400 mt-1">{p.error}</span>}
    </label>
  );
}

const vacio = { nombres: "", apellidos: "", rut: "", telefono: "", correo: "", password: "", empresa: "", cargo: "", codigo: "" };

export function AuthScreen() {
  const { signIn, signUp, entrarDemo, demo } = useAuth();
  const [tab, setTab] = useState<"login" | "registro">("login");
  const [via, setVia] = useState<"empresa" | "codigo">("empresa");
  const [f, setF] = useState(vacio);
  const [err, setErr] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const set = (k: keyof typeof vacio) => (v: string) => setF((o) => ({ ...o, [k]: v }));

  const cambiarTab = (t: typeof tab) => { setTab(t); setErr({}); setMsg(null); };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const x: Record<string, string> = {};
    if (!correoValido(f.correo)) x.correo = "Escribe un correo válido.";
    if (tab === "login") { if (!f.password) x.password = "Escribe tu contraseña."; }
    else {
      if (!f.nombres.trim()) x.nombres = "Completa este campo.";
      if (!f.apellidos.trim()) x.apellidos = "Completa este campo.";
      if (!rutValido(f.rut)) x.rut = "RUT inválido. Usa el formato 12345678-9.";
      if (f.password.length < 8) x.password = "Usa al menos 8 caracteres.";
      if (via === "empresa" && !f.empresa.trim()) x.empresa = "Escribe el nombre de la empresa.";
      if (via === "codigo" && !/^[A-Za-z0-9]{8}$/.test(f.codigo)) x.codigo = "El código tiene 8 caracteres.";
    }
    setErr(x); setMsg(null);
    if (Object.keys(x).length) return;

    setEnviando(true);
    const r = tab === "login"
      ? await signIn(f.correo.trim(), f.password)
      : await signUp({
          nombres: f.nombres.trim(), apellidos: f.apellidos.trim(), rut: f.rut.trim().toUpperCase(),
          telefono: f.telefono.trim(), correo: f.correo.trim(), password: f.password,
          ...(via === "empresa" ? { empresa: f.empresa.trim(), cargo: f.cargo.trim() } : { codigo: f.codigo.trim().toUpperCase(), oficio: f.cargo.trim() }),
        });
    setEnviando(false);
    if (r.error) setMsg({ ok: false, texto: r.error });
    else if (r.aviso) { setMsg({ ok: true, texto: r.aviso }); setTab("login"); }
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground grid md:grid-cols-[440px_1fr]" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <aside className="hidden md:flex flex-col justify-between p-10 border-r-[6px]" style={{ background: "#0b1019", borderColor: "#B8F8C8" }}>
        <div className="flex items-center gap-3">
          <img src={obraTrackLogo} alt="" className="w-14 h-14 rounded-xl object-cover" />
          <span className="text-3xl font-extrabold text-white tracking-tight">ObraTrack</span>
        </div>
        <div>
          <h2 className="text-3xl font-semibold text-white leading-tight max-w-[14ch] mb-3">Cada obra, cada persona, en un solo lugar.</h2>
          <p className="text-slate-400 text-sm max-w-[34ch]">Crea tu empresa y tus obras, o únete a un equipo con el código que te entregó tu administrador.</p>
        </div>
      </aside>

      <main className="flex items-center justify-center p-6">
        <form onSubmit={enviar} noValidate className="w-full max-w-[440px] space-y-3.5">
          <div className="flex border-b-2 border-border mb-5">
            {(["login", "registro"] as const).map((t) => (
              <button key={t} type="button" onClick={() => cambiarTab(t)}
                className={`flex-1 py-3 text-lg font-semibold -mb-0.5 border-b-4 ${tab === t ? "text-white border-blue-500" : "text-slate-500 border-transparent"}`}>
                {t === "login" ? "Ingresar" : "Crear cuenta"}
              </button>
            ))}
          </div>

          {tab === "registro" && (
            <>
              <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Cómo registrarte">
                {([["empresa", "Soy administrador", "Creo mi empresa y mis obras"], ["codigo", "Tengo un código", "Me invitaron a una obra"]] as const).map(([v, t, s]) => (
                  <button key={v} type="button" role="radio" aria-checked={via === v} onClick={() => setVia(v)}
                    className={`text-left rounded-md border p-3 ${via === v ? "border-blue-500 ring-1 ring-blue-500" : "border-border"} bg-white/5`}>
                    <span className="block text-sm font-semibold text-white">{t}</span>
                    <span className="block text-[11px] text-slate-500">{s}</span>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Campo label="Nombres" value={f.nombres} onChange={set("nombres")} error={err.nombres} autoComplete="given-name" />
                <Campo label="Apellidos" value={f.apellidos} onChange={set("apellidos")} error={err.apellidos} autoComplete="family-name" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Campo label="RUT" value={f.rut} onChange={set("rut")} error={err.rut} placeholder="12345678-9" />
                <Campo label="Teléfono" value={f.telefono} onChange={set("telefono")} type="tel" placeholder="+56 9 1234 5678" autoComplete="tel" />
              </div>
            </>
          )}

          <Campo label="Correo" value={f.correo} onChange={set("correo")} error={err.correo} type="email" autoComplete="email" />

          {tab === "registro" && (via === "empresa"
            ? <div className="grid grid-cols-2 gap-3">
                <Campo label="Empresa" value={f.empresa} onChange={set("empresa")} error={err.empresa} />
                <Campo label="Cargo (opcional)" value={f.cargo} onChange={set("cargo")} placeholder="Jefe de obra" />
              </div>
            : <div className="grid grid-cols-2 gap-3">
                <Campo label="Código de invitación" value={f.codigo} onChange={(v) => set("codigo")(v.toUpperCase())} error={err.codigo} />
                <Campo label="Oficio (opcional)" value={f.cargo} onChange={set("cargo")} placeholder="Carpintero" />
              </div>)}

          <Campo label="Contraseña" value={f.password} onChange={set("password")} error={err.password} type="password"
            autoComplete={tab === "login" ? "current-password" : "new-password"} hint={tab === "registro" ? "Mínimo 8 caracteres." : undefined} />

          <button type="submit" disabled={enviando} className="w-full rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold py-3 mt-1">
            {enviando ? "Un momento…" : tab === "login" ? "Ingresar" : "Crear cuenta"}
          </button>
          {msg && <p role="status" className={`text-sm font-medium ${msg.ok ? "text-emerald-400" : "text-red-400"}`}>{msg.texto}</p>}

          {demo && (
            <div className="pt-4 mt-2 border-t border-border text-center">
              <p className="text-[11px] text-slate-500 mb-2">Backend sin configurar: la app funciona con datos de ejemplo.</p>
              <button type="button" onClick={entrarDemo} className="text-sm text-blue-400 hover:text-blue-300 font-medium">Entrar en modo demostración</button>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
