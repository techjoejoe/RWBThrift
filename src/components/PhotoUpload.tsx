'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import { Camera, Upload, X, Loader2, Check, ZoomIn, ZoomOut } from 'lucide-react';

interface PhotoUploadProps {
    currentPhoto?: string;
    name: string;
    size?: number;
    onPhotoChange: (url: string) => void;
}

// Crop modal: shows circular preview with zoom/pan controls
function CropModal({ imageUrl, onConfirm, onCancel }: {
    imageUrl: string;
    onConfirm: (blob: Blob) => void;
    onCancel: () => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imgLoaded, setImgLoaded] = useState(false);

    const CANVAS_SIZE = 280;

    // Load image
    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            imgRef.current = img;
            setImgLoaded(true);
        };
        img.src = imageUrl;
    }, [imageUrl]);

    // Draw to canvas whenever zoom/offset/imgLoaded changes
    useEffect(() => {
        if (!imgLoaded || !imgRef.current || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d')!;
        const img = imgRef.current;

        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Calculate dimensions for center-fit
        const minDim = Math.min(img.width, img.height);
        const scale = (CANVAS_SIZE / minDim) * zoom;

        const drawW = img.width * scale;
        const drawH = img.height * scale;
        const drawX = (CANVAS_SIZE - drawW) / 2 + offset.x;
        const drawY = (CANVAS_SIZE - drawH) / 2 + offset.y;

        // Draw image
        ctx.save();
        ctx.beginPath();
        ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        ctx.restore();
    }, [imgLoaded, zoom, offset]);

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        setDragging(true);
        const pos = 'touches' in e ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
        setDragStart(pos);
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!dragging) return;
        const pos = 'touches' in e ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
        setOffset(prev => ({
            x: prev.x + (pos.x - dragStart.x),
            y: prev.y + (pos.y - dragStart.y),
        }));
        setDragStart(pos);
    };

    const handleMouseUp = () => setDragging(false);

    const handleConfirm = () => {
        if (!canvasRef.current) return;
        // Export the circular crop as 300x300
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = 300;
        exportCanvas.height = 300;
        const ctx = exportCanvas.getContext('2d')!;

        // Draw circle clip
        ctx.beginPath();
        ctx.arc(150, 150, 150, 0, Math.PI * 2);
        ctx.clip();

        // Draw from preview canvas
        ctx.drawImage(canvasRef.current, 0, 0, CANVAS_SIZE, CANVAS_SIZE, 0, 0, 300, 300);

        exportCanvas.toBlob(
            (blob) => blob && onConfirm(blob),
            'image/jpeg',
            0.9
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onCancel}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative w-full max-w-sm card p-6 space-y-4 animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="text-center">
                    <h2 className="text-lg font-bold text-navy-dark">Crop Profile Photo</h2>
                    <p className="text-xs text-gray-400 mt-1">Drag to reposition · Zoom to resize</p>
                </div>

                {/* Crop Area */}
                <div className="flex justify-center">
                    <div
                        className="relative rounded-full overflow-hidden cursor-move border-4 border-navy/10 shadow-lg"
                        style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleMouseDown}
                        onTouchMove={handleMouseMove}
                        onTouchEnd={handleMouseUp}
                    >
                        <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="w-full h-full" />
                        {/* Circle guide overlay */}
                        <div className="absolute inset-0 rounded-full border-2 border-white/40 pointer-events-none" />
                    </div>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
                        className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                        <ZoomOut size={16} className="text-gray-500" />
                    </button>
                    <div className="w-32 relative">
                        <input
                            type="range"
                            min="0.5"
                            max="3"
                            step="0.05"
                            value={zoom}
                            onChange={e => setZoom(parseFloat(e.target.value))}
                            className="w-full accent-navy"
                        />
                    </div>
                    <button
                        onClick={() => setZoom(z => Math.min(3, z + 0.1))}
                        className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                        <ZoomIn size={16} className="text-gray-500" />
                    </button>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleConfirm} className="flex-1 btn btn-primary py-2.5 flex items-center justify-center gap-2">
                        <Check size={16} />
                        Save Photo
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function PhotoUpload({ currentPhoto, name, size = 80, onPhotoChange }: PhotoUploadProps) {
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const [showOptions, setShowOptions] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [cropImage, setCropImage] = useState<string | null>(null);

    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    // Upload the cropped blob to Firebase Storage
    const uploadCroppedPhoto = useCallback(async (blob: Blob) => {
        if (!user) return;
        setUploading(true);
        setCropImage(null);

        try {
            // Upload to fixed path — automatically overwrites any previous photo
            const storageRef = ref(storage, `profiles/${user.uid}/avatar.jpg`);
            await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });

            // Get the download URL (includes a token that changes on re-upload)
            const downloadURL = await getDownloadURL(storageRef);
            onPhotoChange(downloadURL);
        } catch (err) {
            console.warn('Photo upload failed:', err);
        } finally {
            setUploading(false);
        }
    }, [user, onPhotoChange]);

    // Remove photo from Storage + clear URL
    const removePhoto = useCallback(async () => {
        if (!user) return;
        setShowOptions(false);
        setUploading(true);

        try {
            const storageRef = ref(storage, `profiles/${user.uid}/avatar.jpg`);
            await deleteObject(storageRef);
        } catch (err) {
            // File may not exist — that's fine
            console.warn('Delete failed (may not exist):', err);
        }

        onPhotoChange('');
        setUploading(false);
    }, [user, onPhotoChange]);

    // Handle file selection → open crop modal
    const handleFileSelected = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            setCropImage(ev.target?.result as string);
            setShowOptions(false);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    }, []);

    const displayPhoto = currentPhoto;

    return (
        <div className="relative inline-block">
            {/* Crop Modal */}
            {cropImage && (
                <CropModal
                    imageUrl={cropImage}
                    onConfirm={uploadCroppedPhoto}
                    onCancel={() => setCropImage(null)}
                />
            )}

            {/* Avatar */}
            <button
                onClick={() => !uploading && setShowOptions(!showOptions)}
                className="relative group"
                style={{ width: size, height: size }}
                disabled={uploading}
            >
                {displayPhoto ? (
                    <img
                        src={displayPhoto}
                        alt={name}
                        className="rounded-full object-cover border-2 border-white shadow-lg"
                        style={{ width: size, height: size }}
                    />
                ) : (
                    <div
                        className="rounded-full bg-navy/10 flex items-center justify-center text-navy font-bold border-2 border-white shadow-lg"
                        style={{ width: size, height: size, fontSize: size * 0.3 }}
                    >
                        {initials}
                    </div>
                )}
                {/* Camera / Loading overlay */}
                <div className={`absolute inset-0 rounded-full flex items-center justify-center transition-colors ${uploading ? 'bg-black/40' : 'bg-black/0 group-hover:bg-black/30'}`}>
                    {uploading ? (
                        <Loader2 size={size * 0.25} className="text-white animate-spin" />
                    ) : (
                        <Camera size={size * 0.25} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                </div>
            </button>

            {/* Options Dropdown */}
            {showOptions && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 min-w-[180px] animate-scale-in">
                    <button
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-navy-dark hover:bg-gray-50 transition-colors"
                    >
                        <Camera size={16} className="text-gray-400" />
                        Take Selfie
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-navy-dark hover:bg-gray-50 transition-colors"
                    >
                        <Upload size={16} className="text-gray-400" />
                        Upload Photo
                    </button>
                    {displayPhoto && (
                        <>
                            <div className="border-t border-gray-100 my-1" />
                            <button
                                onClick={removePhoto}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-accent hover:bg-red-alert-light transition-colors"
                            >
                                <X size={16} />
                                Remove Photo
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Hidden file inputs */}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelected} className="hidden" />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="user" onChange={handleFileSelected} className="hidden" />

            {/* Backdrop */}
            {showOptions && <div className="fixed inset-0 z-40" onClick={() => setShowOptions(false)} />}
        </div>
    );
}
