/**
 * Snapchat Scheduler Status Banner
 * 
 * A high-visibility alert component for critical system states.
 * Notifies the user of account disconnections, token expirations, 
 * or pending mandatory actions.
 */

import React from "react";
import {
    AlertTriangle,
    RefreshCw,
    X,
    ChevronRight,
    ShieldAlert,
    Terminal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StatusBannerProps {
    type: "warning" | "error" | "info";
    message: string;
    actionText?: string;
    onAction?: () => void;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
    type,
    message,
    actionText,
    onAction
}) => {
    const [isVisible, setIsVisible] = React.useState(true);

    if (!isVisible) return null;

    const styles = {
        warning: "bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-amber-500/10",
        error: "bg-rose-500/10 border-rose-500/50 text-rose-400 shadow-rose-500/10",
        info: "bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-blue-500/10",
    };

    const Icon = type === "warning" ? AlertTriangle : type === "error" ? ShieldAlert : Terminal;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -20 }}
                className={cn(
                    "relative p-4 md:p-6 border rounded-3xl backdrop-blur-3xl shadow-2xl flex flex-col md:flex-row items-center gap-6 overflow-hidden",
                    styles[type]
                )}
            >
                {/* Decorative Grid Background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '20px 20px' }} />

                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center animate-pulse">
                    <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1 text-center md:text-left relative z-10">
                    <h4 className="text-sm font-bold uppercase tracking-widest mb-1">
                        {type === "warning" ? "System Warning" : type === "error" ? "Priority Error" : "Protocol Update"}
                    </h4>
                    <p className="text-xs md:text-sm font-medium opacity-90 leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                    {actionText && (
                        <Button
                            onClick={onAction}
                            variant="outline"
                            className="rounded-2xl border-white/20 bg-white/5 hover:bg-white/10 hover:text-inherit h-10 px-6 font-bold text-xs uppercase tracking-widest gap-2"
                        >
                            {actionText}
                            <ChevronRight className="w-3 h-3" />
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsVisible(false)}
                        className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
