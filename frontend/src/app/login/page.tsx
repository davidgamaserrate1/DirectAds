"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bot } from "lucide-react";
import { loginSchema, LoginFormData } from "@/lib/validators";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    try {
      await login(data);
      router.push("/dashboard");
    } catch {
      setError("Email ou senha inválidos");
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12" style={{ background: "var(--accent-gradient)" }}>
        <div className="text-white max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <Bot className="w-12 h-12" />
            <h1 className="text-3xl font-bold">AI Campaign Manager</h1>
          </div>
          <p className="text-lg opacity-90">
            Campanhas inteligentes, resultados reais. Gerencie suas campanhas de
            marketing com o poder da inteligência artificial.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[400px]">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Bot className="w-8 h-8 text-[var(--color-primary)]" />
            <h1 className="text-xl font-bold">AI Campaign Manager</h1>
          </div>

          <h2 className="text-2xl font-bold mb-2">Entrar</h2>
          <p className="text-[var(--color-text-secondary)] mb-6">
            Acesse sua conta para gerenciar campanhas
          </p>

          {error && (
            <div className="mb-4 p-3 border border-[var(--color-error)] text-[var(--color-error)] text-sm" style={{ borderRadius: "var(--radius-md)", background: "rgba(234,81,83,0.08)" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Senha"
              type="password"
              placeholder="••••••"
              error={errors.password?.message}
              {...register("password")}
            />
            <Button type="submit" loading={isSubmitting} className="w-full mt-2">
              Entrar
            </Button>
          </form>

          <p className="text-sm text-center mt-6 text-[var(--color-text-secondary)]">
            Não tem conta?{" "}
            <Link href="/register" className="text-[var(--color-primary)] font-medium hover:underline">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
