import { QRCodeSVG } from "qrcode.react";
import { X, Copy, Download, Share2 } from "lucide-react";
import { toast } from "sonner";

interface QRCodeModalProps {
  open: boolean;
  onClose: () => void;
  address: string;
  currency: string;
  chain: string;
  label?: string;
}

const currencyPrefixes: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "ethereum",
  USDC: "ethereum",
  LTC: "litecoin",
};

export default function QRCodeModal({ open, onClose, address, currency, chain, label }: QRCodeModalProps) {
  if (!open) return null;

  const prefix = currencyPrefixes[currency] || currency.toLowerCase();
  const qrData = `${prefix}:${address}`;

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success("Address copied!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById("qr-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(img, 0, 0, 512, 512);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${currency}_${address.slice(0, 8)}_QR.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("QR downloaded!");
      });
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const shareAddress = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${currency} Address`,
          text: `${currency} (${chain}): ${address}`,
        });
      } catch {
        copyAddress();
      }
    } else {
      copyAddress();
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-xs space-y-4 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm">{label || `${currency} (${chain})`}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="bg-foreground rounded-xl p-4 inline-block mx-auto">
          <QRCodeSVG id="qr-svg" value={qrData} size={200} level="H" />
        </div>

        <p className="text-xs text-muted-foreground font-mono break-all">{address}</p>
        <p className="text-xs text-muted-foreground">Network: {chain}</p>

        <div className="flex gap-2">
          <button onClick={copyAddress} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:brightness-110">
            <Copy size={14} /> Copy
          </button>
          <button onClick={downloadQR} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground hover:brightness-110">
            <Download size={14} /> Save
          </button>
          <button onClick={shareAddress} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground hover:brightness-110">
            <Share2 size={14} /> Share
          </button>
        </div>
      </div>
    </div>
  );
}
