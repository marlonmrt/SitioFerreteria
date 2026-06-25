import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      toastOptions={{
        classNames: {
          toast: " border border-border bg-background text-foreground shadow-lg",
          description: "text-muted-foreground"
        }
      }}
      {...props}
    />
  );
}

export { Toaster };
