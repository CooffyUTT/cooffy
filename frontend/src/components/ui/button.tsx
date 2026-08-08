import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-base font-semibold whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/30 active:not-aria-haspopup:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/60 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 active:bg-primary/80 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 dark:active:bg-primary/80",
        outline:
          "border-border bg-transparent text-foreground hover:bg-muted active:bg-muted/80 dark:border-input dark:bg-input/20 dark:hover:bg-input/40 dark:active:bg-input/60",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 active:bg-secondary/80 dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/90 dark:active:bg-secondary/80",
        ghost:
          "text-foreground hover:bg-muted active:bg-muted/80 dark:hover:bg-muted/40 dark:active:bg-muted/60",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80 dark:bg-destructive dark:text-destructive-foreground dark:hover:bg-destructive/90 dark:active:bg-destructive/80",
        link: "text-primary underline-offset-4 hover:underline",
        glowing:
          "relative bg-primary text-primary-foreground shadow-lg hover:shadow-primary/50 after:absolute after:inset-0 after:rounded-xl after:bg-primary/20 after:blur-xl after:transition-opacity after:opacity-0 hover:after:opacity-100 dark:bg-primary dark:text-primary-foreground dark:hover:shadow-primary/50 dark:after:bg-primary/20",
      },
      size: {
        default:
          "h-12 gap-2.5 px-6 has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        xs: "h-8 gap-1.5 rounded-lg px-3 text-sm in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-4",
        sm: "h-10 gap-2 rounded-lg px-4.5 text-[0.9rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5 [&_svg:not([class*='size-'])]:size-4.5",
        lg: "h-14 gap-3 px-8 has-data-[icon=inline-end]:pr-6 has-data-[icon=inline-start]:pl-6",
        icon: "size-12",
        "icon-xs":
          "size-8 rounded-lg in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-4",
        "icon-sm":
          "size-10 rounded-lg in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-4.5",
        "icon-lg": "size-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }