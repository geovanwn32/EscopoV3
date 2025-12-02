
"use client"

import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Sheet, SheetContent } from "@/components/ui/sheet"

type SidebarContext = {
  open: boolean
  setOpen: (open: boolean) => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const [_open, _setOpen] = React.useState(defaultOpen)
    const open = openProp ?? _open
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value
        if (setOpenProp) {
          setOpenProp(openState)
        } else {
          _setOpen(openState)
        }
      },
      [setOpenProp, open]
    )

    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        open,
        setOpen,
      }),
      [open, setOpen]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <div
          className={cn("flex min-h-screen w-full", className)}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"


const sidebarVariants = cva(
  "transition-all duration-300 ease-in-out",
  {
    variants: {
      side: {
        left: "border-r",
        right: "border-l",
      },
    },
    defaultVariants: {
      side: "left",
    },
  }
)

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(
  (
    {
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { open } = useSidebar();
    
    // For mobile, we'll use a sheet
    const [isMobile, setIsMobile] = React.useState(false);
    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (isMobile) {
        return (
            <Sheet open={open} onOpenChange={useSidebar().setOpen}>
                <SheetContent side="left" className="w-72 p-0">
                    {children}
                </SheetContent>
            </Sheet>
        )
    }

    return (
      <aside
        ref={ref}
        className={cn(sidebarVariants(), open ? "w-72" : "w-20", className)}
        {...props}
      >
        {children}
      </aside>
    )
  }
)
Sidebar.displayName = "Sidebar"


export {
  Sidebar,
  SidebarProvider,
  useSidebar,
}
