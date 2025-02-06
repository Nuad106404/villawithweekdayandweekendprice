import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Cross2Icon } from "@radix-ui/react-icons"
import { cn } from "../../lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

const dialogVariants = cva(
  "fixed inset-0 z-[100] flex items-start justify-center sm:items-center p-4 sm:p-6",
  {
    variants: {
      size: {
        sm: "sm:max-w-sm",
        default: "sm:max-w-lg",
        lg: "sm:max-w-2xl",
        xl: "sm:max-w-4xl",
        full: "sm:max-w-full"
      },
      position: {
        center: "items-center",
        top: "items-start sm:pt-10",
        bottom: "items-end sm:pb-10"
      }
    },
    defaultVariants: {
      size: "default",
      position: "center"
    },
  }
)

interface DialogProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root> {
  loading?: boolean
  className?: string
  showClose?: boolean
  closeOnEscape?: boolean
  closeOnOverlayClick?: boolean
  onClose?: () => void
  forceMount?: boolean
}

const Dialog = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Root>,
  DialogProps
>(({ 
  className, 
  children, 
  loading, 
  showClose = true,
  closeOnEscape = true,
  closeOnOverlayClick = true,
  onClose,
  onOpenChange,
  open,
  defaultOpen,
  forceMount,
  ...props 
}, ref) => {
  const handleOpenChange = React.useCallback((open: boolean) => {
    if (!open) {
      onClose?.();
    }
    onOpenChange?.(open);
  }, [onClose, onOpenChange]);

  return (
    <DialogPrimitive.Root 
      {...props}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={handleOpenChange}
    >
      {children}
    </DialogPrimitive.Root>
  );
})
Dialog.displayName = "Dialog"

const DialogTrigger = DialogPrimitive.Trigger
const DialogClose = DialogPrimitive.Close

const DialogPortal = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Portal>,
  DialogPrimitive.DialogPortalProps
>(({ children, ...props }, ref) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <DialogPrimitive.Portal {...props}>
      <div className="fixed inset-0 z-[100] flex items-start justify-center sm:items-center">
        {children}
      </div>
    </DialogPrimitive.Portal>
  );
})
DialogPortal.displayName = DialogPrimitive.Portal.displayName

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & {
    closeOnClick?: boolean
  }
>(({ className, closeOnClick = true, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      "transition-all duration-200",
      className
    )}
    {...(closeOnClick ? props : { onClick: (e) => e.preventDefault(), ...props })}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

interface DialogContentProps 
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogVariants> {
  showClose?: boolean
  loading?: boolean
  loadingText?: string
  closeOnEscape?: boolean
  closeOnOverlayClick?: boolean
  forceMount?: boolean
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ 
  className, 
  children, 
  size, 
  position,
  showClose = true, 
  loading = false,
  loadingText = "Loading...",
  closeOnEscape = true,
  closeOnOverlayClick = true,
  forceMount,
  ...props 
}, ref) => (
  <DialogPortal forceMount={forceMount}>
    <DialogOverlay 
      className="bg-background/80 backdrop-blur-sm"
      forceMount={forceMount}
    />
    <DialogPrimitive.Content
      ref={ref}
      onEscapeKeyDown={(e) => {
        if (!closeOnEscape) {
          e.preventDefault();
        }
      }}
      onPointerDownOutside={(e) => {
        if (!closeOnOverlayClick) {
          e.preventDefault();
        }
      }}
      onInteractOutside={(e) => {
        // Only prevent default if clicking outside content area
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
      className={cn(
        dialogVariants({ size, position }),
        "relative bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        "w-full overflow-y-auto max-h-[90vh] p-6",
        "focus:outline-none",
        className
      )}
      forceMount={forceMount}
      {...props}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          {loadingText && (
            <p className="text-sm text-muted-foreground">{loadingText}</p>
          )}
        </div>
      ) : (
        <>
          {children}
          {showClose && (
            <DialogPrimitive.Close 
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
              aria-label="Close dialog"
            >
              <Cross2Icon className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )}
        </>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    spacing?: "default" | "compact"
  }
>(({ className, spacing = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col text-center sm:text-left",
      spacing === "compact" ? "space-y-1" : "space-y-1.5",
      className
    )}
    {...props}
  />
))
DialogHeader.displayName = "DialogHeader"

const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    reverseButtons?: boolean
  }
>(({ className, reverseButtons = true, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      reverseButtons ? "space-y-2 space-y-reverse sm:space-y-0" : "space-y-2 sm:space-y-0",
      className
    )}
    {...props}
  />
))
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  type DialogProps,
  type DialogContentProps,
}
