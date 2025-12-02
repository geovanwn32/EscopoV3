"use client"

import { useState, useEffect } from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function ConfiguracoesPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Configurações</h1>
        <p className="text-muted-foreground">
          Altere o tema da aplicação e outras preferências de usuário.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tema da Aplicação</CardTitle>
          <CardDescription>Escolha como o EscopoV3 deve se parecer. A opção "Sistema" usará a preferência do seu dispositivo.</CardDescription>
        </CardHeader>
        <CardContent>
          {mounted ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ThemeCard
                title="Claro"
                icon={<Sun className="h-6 w-6" />}
                isActive={theme === "light"}
                onClick={() => setTheme("light")}
              />
              <ThemeCard
                title="Escuro"
                icon={<Moon className="h-6 w-6" />}
                isActive={theme === "dark"}
                onClick={() => setTheme("dark")}
              />
              <ThemeCard
                title="Sistema"
                icon={<Monitor className="h-6 w-6" />}
                isActive={theme === "system"}
                onClick={() => setTheme("system")}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="h-[120px] bg-muted rounded-lg animate-pulse" />
                <div className="h-[120px] bg-muted rounded-lg animate-pulse" />
                <div className="h-[120px] bg-muted rounded-lg animate-pulse" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ThemeCard({ title, icon, isActive, onClick }: { title: string, icon: React.ReactNode, isActive: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center space-y-2 rounded-lg border-2 p-6 text-center transition-colors",
        isActive
          ? "border-primary text-primary"
          : "border-muted text-muted-foreground hover:border-border hover:text-foreground"
      )}
    >
      {icon}
      <span className="font-medium">{title}</span>
    </button>
  )
}
