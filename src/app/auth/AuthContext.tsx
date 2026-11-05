import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase, hasBackend } from "@/lib/supabase";

export type Rol = "administrador" | "director_proyecto" | "supervisor" | "trabajador" | "cliente";

export const ROL_LABEL: Record<Rol, string> = {
  administrador: "Administrador",
  director_proyecto: "Director de Proyecto",
  supervisor: "Supervisor",
  trabajador: "Trabajador",
  cliente: "Cliente",
};

export type Perfil = { id: string; rol: Rol; nombres: string; apellidos: string; empresa_id: string | null };

export type Registro = {
  nombres: string; apellidos: string; rut: string; telefono: string;
  correo: string; password: string;
  empresa?: string; cargo?: string; oficio?: string; codigo?: string;
};

type Resultado = { error?: string; aviso?: string };

type Ctx = {
  loading: boolean;
  perfil: Perfil | null;
  demo: boolean;
  signIn: (correo: string, password: string) => Promise<Resultado>;
  signUp: (d: Registro) => Promise<Resultado>;
  signOut: () => Promise<void>;
  entrarDemo: () => void;
};

const AuthCtx = createContext<Ctx | null>(null);

const PERFIL_DEMO: Perfil = { id: "demo", rol: "administrador", nombres: "Alejandro", apellidos: "Ruiz", empresa_id: null };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(hasBackend);

  // 1) Sesión actual y cambios de sesión
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null);
      if (!data.session) setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user.id ?? null);
      if (!session) { setPerfil(null); setLoading(false); }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // 2) Perfil (nombre y rol) del usuario con sesión
  useEffect(() => {
    if (!supabase || !userId) return;
    setLoading(true);
    supabase.from("perfiles").select("id,rol,nombres,apellidos,empresa_id").eq("id", userId).single()
      .then(({ data }) => { setPerfil((data as Perfil) ?? null); setLoading(false); });
  }, [userId]);

  const signIn: Ctx["signIn"] = async (correo, password) => {
    if (!supabase) return { error: "No hay backend configurado." };
    const { error } = await supabase.auth.signInWithPassword({ email: correo, password });
    return error ? { error: "Correo o contraseña incorrectos." } : {};
  };

  const signUp: Ctx["signUp"] = async (d) => {
    if (!supabase) return { error: "No hay backend configurado." };
    if (d.codigo) {
      const { data: ok } = await supabase.rpc("validar_invitacion", { p_codigo: d.codigo });
      if (!ok) return { error: "El código de invitación no es válido o ya venció." };
    }
    const { data, error } = await supabase.auth.signUp({
      email: d.correo, password: d.password,
      options: { data: {
        nombres: d.nombres, apellidos: d.apellidos, rut: d.rut, telefono: d.telefono,
        empresa: d.empresa, cargo: d.cargo, oficio: d.oficio, codigo: d.codigo,
      } },
    });
    if (error) return { error: error.message };
    if (!data.session) return { aviso: "Cuenta creada. Revisa tu correo para confirmarla y luego ingresa." };
    return {};
  };

  const signOut = async () => { await supabase?.auth.signOut(); setPerfil(null); setUserId(null); };
  const entrarDemo = () => setPerfil(PERFIL_DEMO);

  return (
    <AuthCtx.Provider value={{ loading, perfil, demo: !hasBackend, signIn, signUp, signOut, entrarDemo }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const c = useContext(AuthCtx);
  if (!c) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return c;
}
