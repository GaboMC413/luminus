-- Script SQL para la tabla 'contact_messages' en Supabase

CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    email TEXT NOT NULL,
    telefono TEXT,
    pais TEXT,
    motivo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Política de inserción pública (cualquier usuario visitante puede enviar una consulta)
CREATE POLICY "Permitir inserción pública de mensajes de contacto"
    ON public.contact_messages
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Política de lectura restringida a service_role
CREATE POLICY "Permitir lectura solo a service_role"
    ON public.contact_messages
    FOR SELECT
    TO service_role
    USING (true);

-- Índices para acelerar búsquedas por fecha y correo
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON public.contact_messages (email);
