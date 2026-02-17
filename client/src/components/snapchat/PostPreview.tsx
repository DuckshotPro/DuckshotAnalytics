import React from 'react';
import { Image as ImageIcon, Film, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface PostPreviewProps {
    mediaUrl?: string;
    mediaType: 'image' | 'video';
    caption?: string;
    scheduledFor?: Date;
}

export const PostPreview: React.FC<PostPreviewProps> = ({
    mediaUrl,
    mediaType,
    caption,
    scheduledFor,
}) => {
    return (
        <div className="relative mx-auto w-[280px] h-[500px] bg-black rounded-[32px] overflow-hidden border-[6px] border-[#1c1c1e] shadow-2xl shadow-purple-500/10">
            {/* Phone Bezel/Status Bar Mock */}
            <div className="absolute top-0 left-0 right-0 h-7 bg-black/80 z-20 flex justify-between px-5 items-center backdrop-blur-md">
                <div className="text-[10px] font-bold text-white/90">9:41</div>
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-white/20"></div>
                    <div className="w-3 h-3 rounded-full bg-white/20"></div>
                </div>
            </div>

            {/* Media Content */}
            <div className="absolute inset-0 z-0 bg-neutral-900 flex items-center justify-center h-full w-full">
                {mediaUrl ? (
                    mediaType === 'image' ? (
                        <img
                            src={mediaUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <video
                            src={mediaUrl}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            autoPlay
                            playsInline
                        />
                    )
                ) : (
                    <div className="text-white/20 flex flex-col items-center">
                        {mediaType === 'image' ? <ImageIcon className="w-12 h-12 mb-2" /> : <Film className="w-12 h-12 mb-2" />}
                        <span className="text-xs font-medium">No Media Preview</span>
                    </div>
                )}
            </div>

            {/* Simulated Snapchat UI Overlays */}

            {/* Top Bar - Profile Mock */}
            <div className="absolute top-10 left-4 right-4 flex items-center gap-2 z-10 pointer-events-none">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border border-white/20 shadow-sm" />
                <div className="flex flex-col">
                    <span className="text-white text-xs font-bold drop-shadow-md">My Story</span>
                    <span className="text-white/80 text-[10px] drop-shadow-md">Just now</span>
                </div>
            </div>

            {/* Caption Overlay - Classic Snapchat Style (Bar) */}
            {caption && (
                <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 z-10">
                    <div className="bg-black/60 backdrop-blur-sm py-2 px-4 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <p className="text-white text-center text-sm font-medium leading-tight break-words">
                            {caption}
                        </p>
                    </div>
                </div>
            )}

            {/* Scheduled Date Overlay (Helper for User) */}
            {scheduledFor && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-max">
                    <div className="bg-emerald-500/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg border border-emerald-400/20 animate-in zoom-in-50 duration-300">
                        <Calendar className="w-3 h-3 text-white" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                            {format(scheduledFor, 'MMM d, h:mm a')}
                        </span>
                    </div>
                </div>
            )}

            {/* Gradient Overlay for bottom definition */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-0"></div>
        </div>
    );
};
