import React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface CardProps extends HTMLMotionProps<"div"> {
    variant?: "default" | "glass" | "outline";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = "default", children, ...props }, ref) => {
        const variants = {
            default: "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm",
            glass: "glass-card",
            outline: "bg-transparent border border-neutral-200 dark:border-neutral-800",
        };

        return (
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                    "rounded-3xl p-6 overflow-hidden",
                    variants[variant],
                    className
                )}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);

Card.displayName = "Card";
