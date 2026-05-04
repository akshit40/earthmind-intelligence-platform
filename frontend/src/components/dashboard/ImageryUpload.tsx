"use client";

import { useState } from "react";
import { UploadCloud, FileImage, ShieldAlert, CheckCircle, Loader2 } from "lucide-react";
import { processImagery } from "@/lib/api";
import type { CVProcessingResult } from "@/lib/types";

export function ImageryUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<CVProcessingResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsProcessing(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await processImagery(formData);
      setResult(res);
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="elite-card p-8 shadow-sm animate-entry-1">
        <h3 className="text-[10px] font-bold mb-6 uppercase tracking-[0.2em] text-muted-foreground font-tactical flex items-center gap-2">
          <UploadCloud className="h-4 w-4 text-foreground/70" />
          Neural Imagery Analysis
        </h3>
        
        <div className="upload-zone p-12 flex flex-col items-center justify-center relative overflow-hidden group">
          <input 
            type="file" 
            id="imagery-upload" 
            className="hidden" 
            accept="image/*,.tif,.tiff" 
            onChange={handleFileChange} 
          />
          <label htmlFor="imagery-upload" className="cursor-pointer flex flex-col items-center relative z-10">
            {file ? (
              <>
                <FileImage className="h-12 w-12 text-success mb-4 drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]" />
                <p className="text-[11px] font-bold font-tactical text-foreground uppercase tracking-widest">{file.name}</p>
                <p className="text-[10px] text-muted-foreground font-tactical mt-2 uppercase">Payload: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </>
            ) : (
              <>
                <UploadCloud className="h-12 w-12 text-muted-foreground/40 mb-4 group-hover:text-foreground/60 transition-colors" />
                <p className="text-[11px] font-bold font-tactical text-foreground/70 uppercase tracking-widest">Awaiting Spectral Data...</p>
                <p className="text-[10px] text-muted-foreground/50 font-tactical mt-2 uppercase">Supports GeoTIFF | PNG | JPEG</p>
              </>
            )}
          </label>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleUpload} 
            disabled={!file || isProcessing}
            className="bg-white text-black hover:bg-white/90 px-8 py-3 rounded-md font-tactical font-bold text-[11px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isProcessing ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing Sector...</>
            ) : (
              <>Execute CV Scan</>
            )}
          </button>
        </div>
      </div>

      {result && (
        <div className="elite-card elite-card-accent-green p-8 shadow-sm animate-entry-2 glow-green">
          <h3 className="text-[10px] font-bold mb-6 uppercase tracking-[0.2em] text-success font-tactical flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Intelligence Report Generated
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="p-5 rounded-lg bg-white/5 border border-white/10">
                <p className="text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-widest font-tactical">Detection Status</p>
                <p className="font-tactical text-success uppercase text-xs font-bold tracking-widest">{result.result.status}</p>
              </div>
              <div className="p-5 rounded-lg bg-white/5 border border-white/10">
                <p className="text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-widest font-tactical">Signature Count</p>
                <p className="font-tactical text-2xl font-bold tracking-tighter">{result.result.anomalies_detected}</p>
              </div>
            </div>
            
            <div className="elite-card overflow-hidden bg-black/40">
              <div className="px-6 py-3 border-b border-white/10 bg-white/5 font-bold text-[10px] uppercase tracking-[0.2em] font-tactical flex items-center gap-2">
                <ShieldAlert className="h-3 w-3" />
                Detected Signatures
              </div>
              <div className="p-6 max-h-[220px] overflow-auto custom-scrollbar">
                {result.result.anomalies.length > 0 ? (
                  <ul className="space-y-4">
                    {result.result.anomalies.map((a, i) => (
                      <li key={i} className="flex justify-between items-center text-[11px] font-tactical border-b border-white/5 pb-3 last:border-0 last:pb-0">
                        <span className="font-bold text-foreground/90 uppercase tracking-widest">{a.type}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${a.severity === 'CRITICAL' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
                          {a.severity}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[10px] text-muted-foreground italic text-center py-6 font-tactical uppercase tracking-widest">No anomalies detected in this sector.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
