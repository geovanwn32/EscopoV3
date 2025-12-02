
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
              <ThemePreview 
                themeName="light"
                title="Claro"
                icon={<Sun className="h-5 w-5" />}
                isActive={theme === "light"}
                onClick={() => setTheme("light")}
              />
              <ThemePreview 
                themeName="dark"
                title="Escuro"
                icon={<Moon className="h-5 w-5" />}
                isActive={theme === "dark"}
                onClick={() => setTheme("dark")}
              />
              <ThemePreview 
                themeName="system"
                title="Sistema"
                icon={<Monitor className="h-5 w-5" />}
                isActive={theme === "system"}
                onClick={() => setTheme("system")}
                isSystem={true}
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

interface ThemePreviewProps {
  themeName: "light" | "dark" | "system";
  title: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  isSystem?: boolean;
}

function ThemePreview({ themeName, title, icon, isActive, onClick, isSystem = false }: ThemePreviewProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg border-2 p-1 transition-colors",
        isActive
          ? "border-primary"
          : "border-transparent hover:border-muted-foreground/30"
      )}
    >
      <div className={cn(
        "rounded-md p-2",
        !isSystem && themeName === 'light' && "bg-[#F5F5F5]",
        !isSystem && themeName === 'dark' && "bg-[#212330]"
      )}>
        <div className="space-y-2 rounded-sm bg-background p-2 shadow-sm">
          <div className="space-y-2 rounded-md bg-card p-2 shadow-sm">
            <div className="h-2 w-4/5 rounded-lg bg-primary" />
            <div className="h-2 w-full rounded-lg bg-muted-foreground/50" />
          </div>
          <div className="flex items-center space-x-2 rounded-md bg-card p-2 shadow-sm">
            <div className="h-4 w-4 rounded-full bg-primary" />
            <div className="h-2 w-full rounded-lg bg-muted-foreground/50" />
          </div>
          <div className="flex items-center space-x-2 rounded-md bg-card p-2 shadow-sm">
            <div className="h-4 w-4 rounded-full bg-primary" />
            <div className="h-2 w-full rounded-lg bg-muted-foreground/50" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 py-2">
        {icon}
        <span className="font-medium text-sm">{title}</span>
      </div>
    </button>
  )
}
