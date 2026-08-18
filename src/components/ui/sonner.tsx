import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      richColors
      position="top-right"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast font-sans text-xs border border-border/60 shadow-xl rounded-xl p-3.5",
          description: "text-xs font-normal opacity-90 mt-0.5",
          actionButton: "bg-primary text-primary-foreground font-semibold text-xs",
          cancelButton: "bg-muted text-muted-foreground font-semibold text-xs",
          closeButton: "border-border/60 hover:bg-muted text-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
