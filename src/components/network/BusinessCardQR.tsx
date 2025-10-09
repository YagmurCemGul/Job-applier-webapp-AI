/**
 * @fileoverview Business card QR code generator for vCard
 * @module components/network/BusinessCardQR
 */

import { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { buildVCard } from '@/services/events/vcard.service';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function BusinessCardQR({ open, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!open || !canvasRef.current) return;

    // Generate vCard
    const vcard = buildVCard({
      name: 'Your Name',
      email: 'you@example.com',
      phone: '+1234567890',
      title: 'Senior Engineer',
      org: 'Your Company',
      url: 'https://yoursite.com'
    });

    // Simple QR code generation (in production, use a QR library like qrcode)
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Placeholder: draw a simple grid pattern
    const size = 300;
    canvas.width = size;
    canvas.height = size;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#000';
    
    // Draw a simple pattern (replace with real QR code library)
    const cellSize = 10;
    for (let i = 0; i < size; i += cellSize * 2) {
      for (let j = 0; j < size; j += cellSize * 2) {
        ctx.fillRect(i, j, cellSize, cellSize);
      }
    }

    // Draw text below
    ctx.fillStyle = '#000';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Scan for vCard', size / 2, size - 10);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Business Card QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center py-4">
          <canvas ref={canvasRef} className="border rounded" />
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Share this QR code at events for instant contact exchange
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
