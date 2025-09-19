import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap ios-touch ios-touch-target text-base font-medium transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 active:transform active:scale-95',
  {
    variants: {
      variant: {
        // iOS Primary Button (Filled)
        default: 'bg-primary text-primary-foreground rounded-xl shadow-sm active:bg-primary/80',
        // iOS Secondary Button (Tinted)
        secondary: 'bg-primary/10 text-primary rounded-xl hover:bg-primary/20 active:bg-primary/30',
        // iOS Tertiary Button (Plain)
        ghost: 'text-primary rounded-xl hover:bg-primary/10 active:bg-primary/20',
        // iOS Destructive Button
        destructive: 'bg-destructive text-destructive-foreground rounded-xl shadow-sm active:bg-destructive/80',
        // iOS Link Style
        link: 'text-primary underline-offset-4 hover:underline active:opacity-60',
        // iOS Bordered Button
        outline: 'border-2 border-primary text-primary bg-background rounded-xl hover:bg-primary/5 active:bg-primary/10',
      },
      size: {
        // iOS Standard sizes with 44pt minimum touch target
        default: 'h-12 px-6 py-3',
        sm: 'h-10 px-4 py-2 text-sm',
        lg: 'h-14 px-8 py-4 text-lg font-semibold',
        icon: 'h-12 w-12',
        // iOS specific sizes
        compact: 'h-8 px-3 py-1 text-sm',
        prominent: 'h-16 px-10 py-5 text-xl font-bold',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
