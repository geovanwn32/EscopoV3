

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
}

function ThemePreview({ themeName, title, icon, isActive, onClick }: ThemePreviewProps) {
  return (
    <div className="space-y-2">
      <button
        onClick={onClick}
        className={cn(
          "rounded-lg border-2 p-1.5 transition-all w-full",
          isActive
            ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
            : "border-border hover:border-primary/50"
        )}
      >
        <div 
          className={cn(
            "h-24 w-full rounded-md", 
            themeName === "light" && "bg-[#F5F5F5]",
            themeName === "dark" && "bg-[#0A0A0A]",
            themeName === "system" && "bg-muted"
          )}
        >
          <div
            className={cn(
              "flex h-full w-full gap-2 rounded-md p-2",
              themeName === "light" && "dark",
              themeName === "light" && "[--background:240_10%_97%] [--card:0_0%_100%] [--primary:228_100%_64%]"
            )}
            style={themeName === 'dark' ? {
                "--background": "235 15% 15%",
                "--card": "235 15% 18%",
                "--primary": "228 100% 64%",
            } as React.CSSProperties : {}}
          >
              <div className="w-1/4 rounded-sm bg-card" />
              <div className="flex w-3/4 flex-col gap-1">
                <div className="h-3 w-4/5 rounded-sm bg-primary" />
                <div className="h-2 w-full rounded-sm bg-card" />
                <div className="h-2 w-full rounded-sm bg-card" />
              </div>
          </div>
        </div>
      </button>
      <div className="flex items-center justify-center gap-2">
        {icon}
        <span className="font-medium text-sm text-muted-foreground">{title}</span>
      </div>
    </div>
  )
}
