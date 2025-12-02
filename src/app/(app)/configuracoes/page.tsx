"use client"

import { useState, useEffect } from "react"
import { Moon, Sun, Monitor, Palette, Check } from "lucide-react"
import { useTheme } from "next-themes"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const availableThemes = [
    { name: 'blue', color: 'bg-blue-600' },
    { name: 'green', color: 'bg-green-600' },
    { name: 'orange', color: 'bg-orange-600' },
    { name: 'rose', color: 'bg-rose-600' },
    { name: 'violet', color: 'bg-violet-600' },
]

export default function ConfiguracoesPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [colorTheme, setColorTheme] = useState('theme-blue');

  useEffect(() => {
    setMounted(true)
    const storedColorTheme = localStorage.getItem('color-theme') || 'theme-blue';
    setColorTheme(storedColorTheme);
    document.body.classList.add(storedColorTheme);
  }, [])
  
  const handleColorChange = (newColor: string) => {
    document.body.classList.remove(colorTheme);
    document.body.classList.add(newColor);
    setColorTheme(newColor);
    localStorage.setItem('color-theme', newColor);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Configurações</h1>
        <p className="text-muted-foreground">
          Altere o tema da aplicação e outras preferências de usuário.
        </p>
      </div>
        
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <Card>
            <CardHeader>
                <CardTitle>Esquema de Cores</CardTitle>
                <CardDescription>Personalize a cor de destaque primária da aplicação.</CardDescription>
            </CardHeader>
            <CardContent>
                 {mounted ? (
                    <div className="flex flex-wrap gap-4">
                        {availableThemes.map((t) => (
                           <ColorDot
                                key={t.name}
                                colorClass={t.color}
                                isActive={`theme-${t.name}` === colorTheme}
                                onClick={() => handleColorChange(`theme-${t.name}`)}
                            />
                        ))}
                    </div>
                ) : (
                     <div className="flex flex-wrap gap-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                             <div key={i} className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
      </div>

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

function ColorDot({ colorClass, isActive, onClick }: { colorClass: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'h-10 w-10 rounded-full transition-all flex items-center justify-center',
        colorClass,
        isActive ? 'ring-2 ring-offset-2 ring-offset-background ring-primary' : 'hover:scale-110'
      )}
      aria-label={`Select ${colorClass} theme`}
    >
      {isActive && <Check className="h-6 w-6 text-primary-foreground" />}
    </button>
  );
}