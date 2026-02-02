/**
 * Snapchat Media Uploader
 * 
 * A high-performance, drag-and-drop media upload component designed for Snapchat content.
 * Features progress tracking, validation for Snapchat specs, and premium visual feedback.
 */

import React, { useState, useCallback, useRef } from "react";
import {
    Upload,
    X,
    FileVideo,
    FileImage,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Trash2,
    ArrowUpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface MediaUploaderProps {
    onUploadComplete: (url: string, type: "image" | "video") => void;
    maxSizeMB?: number;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
    onUploadComplete,
    maxSizeMB = 100
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
    const [progress, setProgress] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File) => {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");

        if (!isImage && !isVideo) {
            throw new Error("Invalid file type. Please upload an image or video.");
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
            throw new Error(`File is too large. Maximum size is ${maxSizeMB}MB.`);
        }

        return isImage ? "image" : "video";
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) processFile(selectedFile);
    };

    const processFile = (selectedFile: File) => {
        try {
            const type = validateFile(selectedFile);
            setFile(selectedFile);
            setErrorMessage("");
            setStatus("idle");
            setProgress(0);

            // Create preview
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);
        } catch (err: any) {
            toast({
                title: "Validation Error",
                description: err.message,
                variant: "destructive",
            });
        }
    };

    const uploadFile = async () => {
        if (!file) return;

        setStatus("uploading");
        setProgress(10);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "/api/snapchat/upload");

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    setProgress(Math.round(percentComplete));
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        setProgress(100);
                        setStatus("success");

                        toast({
                            title: "Upload Successful",
                            description: "Media has been processed and ready for scheduling.",
                        });

                        onUploadComplete(data.url, file.type.startsWith("image/") ? "image" : "video");
                    } catch (e) {
                        setStatus("error");
                        setErrorMessage("Invalid server response");
                    }
                } else {
                    let errorMsg = "Upload failed";
                    try {
                        const error = JSON.parse(xhr.responseText);
                        errorMsg = error.error || error.message || errorMsg;
                    } catch (e) { /* ignore */ }

                    setStatus("error");
                    setErrorMessage(errorMsg);
                    toast({
                        title: "Upload Failed",
                        description: errorMsg,
                        variant: "destructive",
                    });
                }
            };

            xhr.onerror = () => {
                setStatus("error");
                setErrorMessage("Network connection error");
                toast({
                    title: "Network Error",
                    description: "Failed to connect to server",
                    variant: "destructive",
                });
            };

            xhr.send(formData);
        } catch (err: any) {
            setStatus("error");
            setErrorMessage(err.message || "Failed to upload file");
            toast({
                title: "Upload Error",
                description: err.message,
                variant: "destructive",
            });
        }
    };

    const clearFile = () => {
        setFile(null);
        setPreviewUrl(null);
        setStatus("idle");
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) processFile(droppedFile);
    };

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {!file ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className={cn(
                            "relative border-2 border-dashed border-white/10 rounded-3xl p-12 text-center transition-all duration-300",
                            "bg-white/5 hover:bg-white/[0.08] hover:border-purple-500/30 group cursor-pointer"
                        )}
                        onDragOver={onDragOver}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="hidden"
                            accept="image/*,video/*"
                        />

                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-500">
                                <Upload className="w-8 h-8 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
                                Upload Your Story
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
                                Drag and drop your high-quality media here, or <span className="text-purple-400 font-semibold underline underline-offset-4">browse files</span>
                            </p>

                            <div className="flex gap-3">
                                <Badge variant="outline" className="bg-white/5 border-white/5 text-[10px] uppercase tracking-tighter px-3 py-1 text-muted-foreground">
                                    MP4 / MOV
                                </Badge>
                                <Badge variant="outline" className="bg-white/5 border-white/5 text-[10px] uppercase tracking-tighter px-3 py-1 text-muted-foreground">
                                    JPG / PNG
                                </Badge>
                                <Badge variant="outline" className="bg-white/5 border-white/5 text-[10px] uppercase tracking-tighter px-3 py-1 text-muted-foreground">
                                    9:16 Ratio
                                </Badge>
                            </div>
                        </div>

                        <div className="absolute top-4 right-4 animate-bounce">
                            <ArrowUpCircle className="w-6 h-6 text-purple-500/40" />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 border border-white/10 rounded-3xl p-6 overflow-hidden"
                    >
                        <div className="flex gap-6 items-start">
                            {/* Thumbnail Preview */}
                            <div className="relative w-40 h-72 rounded-2xl bg-black overflow-hidden border border-white/5 flex-shrink-0 shadow-2xl">
                                {file.type.startsWith("image/") ? (
                                    <img src={previewUrl!} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <video src={previewUrl!} className="w-full h-full object-cover" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                                    <Badge className="bg-purple-500/80 text-[10px] uppercase tracking-tight">
                                        {file.type.split("/")[1]}
                                    </Badge>
                                </div>
                            </div>

                            {/* Upload Details */}
                            <div className="flex-1 space-y-6 flex flex-col justify-center h-full min-h-[288px]">
                                <div className="space-y-1">
                                    <h4 className="text-lg font-bold truncate pr-8">{file.name}</h4>
                                    <p className="text-xs text-muted-foreground uppercase font-mono tracking-tighter">
                                        {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type.startsWith("image") ? "Image" : "Video"} Asset
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                                            {status === "uploading" ? "Broadcasting to Cloud..." : status === "success" ? "Ready for Snapchat" : status === "error" ? "Transmission Error" : "System Standby"}
                                        </span>
                                        <span className="text-xl font-bold font-mono text-purple-400">{progress}%</span>
                                    </div>
                                    <Progress
                                        value={progress}
                                        className={cn(
                                            "h-2 rounded-full bg-white/5",
                                            status === "success" ? "text-emerald-500" : "text-purple-500"
                                        )}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    {status === "idle" && (
                                        <Button
                                            onClick={uploadFile}
                                            className="flex-1 bg-gradient-to-r from-[#9a45ff] to-[#ff45d9] hover:opacity-90 rounded-xl text-white font-bold h-12 shadow-lg shadow-purple-500/20"
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            Initiate Upload
                                        </Button>
                                    )}
                                    {status === "uploading" && (
                                        <Button disabled className="flex-1 bg-white/5 border border-white/10 rounded-xl h-12 text-muted-foreground">
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Transmitting Data...
                                        </Button>
                                    )}
                                    {status === "success" && (
                                        <Button disabled className="flex-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl h-12 font-bold select-none cursor-default">
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            Upload Finalized
                                        </Button>
                                    )}
                                    {status === "error" && (
                                        <Button onClick={uploadFile} className="flex-1 bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl h-12 font-bold hover:bg-rose-500/30">
                                            <AlertCircle className="w-4 h-4 mr-2" />
                                            Retry Transmission
                                        </Button>
                                    )}

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={clearFile}
                                        disabled={status === "uploading"}
                                        className="h-12 w-12 rounded-xl bg-white/5 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>

                                {status === "error" && (
                                    <p className="text-[10px] text-rose-400 bg-rose-500/5 p-3 rounded-lg border border-rose-500/10">
                                        <strong>Error Diagnostic:</strong> {errorMessage}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="absolute top-4 right-4 p-2 opacity-10">
                            <ArrowUpCircle className="w-12 h-12 text-purple-400" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
