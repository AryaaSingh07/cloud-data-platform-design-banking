import React, { useState, useRef } from 'react';
import { 
  Database, 
  Cloud, 
  Layers, 
  ShieldCheck, 
  Cpu, 
  BarChart3, 
  Network, 
  Lock, 
  FileJson, 
  Zap, 
  Activity, 
  Globe, 
  Search, 
  Sparkles,
  ArrowRight,
  Download,
  Plus,
  Image as ImageIcon,
  Loader2,
  X,
  FileText,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { cn } from './lib/utils';
import { generateArchitectureImage, editArchitectureImage } from './services/gemini';

// --- Types ---
interface NodeProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  className?: string;
}

// --- Components ---
const Node = ({ title, subtitle, icon, color, className }: NodeProps) => (
  <motion.div 
    whileHover={{ scale: 1.02, translateY: -4 }}
    className={cn(
      "diagram-node p-4 rounded-xl border bg-white shadow-sm flex flex-col items-center text-center min-w-[160px]",
      className
    )}
    style={{ borderColor: color + '40' }}
  >
    <div 
      className="p-2 rounded-lg mb-3"
      style={{ backgroundColor: color + '15', color: color }}
    >
      {icon}
    </div>
    <h3 className="font-semibold text-sm text-slate-800 leading-tight">{title}</h3>
    {subtitle && <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-medium">{subtitle}</p>}
  </motion.div>
);

const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="mb-6 text-center">
    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</h2>
    {subtitle && <p className="text-[10px] text-slate-400 italic">{subtitle}</p>}
  </div>
);

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const diagramRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const img = await generateArchitectureImage(prompt);
      if (img) setGeneratedImage(img);
    } catch (err) {
      setError("Failed to generate image. Please check your API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = async () => {
    if (!prompt.trim() || !generatedImage) return;
    setIsGenerating(true);
    setError(null);
    try {
      const img = await editArchitectureImage(generatedImage, prompt);
      if (img) setGeneratedImage(img);
    } catch (err) {
      setError("Failed to edit image.");
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToPNG = async () => {
    if (!diagramRef.current) return;
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      const dataUrl = await toPng(diagramRef.current, {
        backgroundColor: '#F8F9FA',
        quality: 1,
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = 'banco-wild-west-architecture.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    if (!diagramRef.current) return;
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      const dataUrl = await toPng(diagramRef.current, {
        backgroundColor: '#F8F9FA',
        quality: 1,
        pixelRatio: 2,
      });
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [diagramRef.current.offsetWidth * 2, diagramRef.current.offsetHeight * 2]
      });
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, diagramRef.current.offsetWidth * 2, diagramRef.current.offsetHeight * 2);
      pdf.save('banco-wild-west-architecture.pdf');
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-6 flex justify-between items-center sticky top-0 z-50">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Banco Wild West</h1>
          <p className="text-sm text-slate-500 font-medium">Cloud Data Platform Architecture (Azure)</p>
        </div>
        <div className="flex gap-3 relative">
          <button 
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Sparkles size={18} />
            AI Designer
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
              className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
              Export
              <ChevronDown size={14} className={cn("transition-transform", showExportMenu && "rotate-180")} />
            </button>
            
            <AnimatePresence>
              {showExportMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50"
                >
                  <button 
                    onClick={exportToPNG}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                  >
                    <ImageIcon size={16} className="text-slate-400" />
                    Export as PNG
                  </button>
                  <button 
                    onClick={exportToPDF}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left border-t border-slate-50"
                  >
                    <FileText size={16} className="text-slate-400" />
                    Export as PDF
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-12" ref={diagramRef}>
        {/* Diagram Layout */}
        <div className="flex flex-col gap-16 relative">
          
          {/* Layer 1: Data Sources */}
          <section>
            <SectionHeader title="Data Sources" />
            <div className="grid grid-cols-5 gap-6">
              <Node title="Structured" subtitle="Core Banking • CRM" icon={<Database size={20} />} color="#64748b" />
              <Node title="Semi-structured" subtitle="JSON • Forms" icon={<FileJson size={20} />} color="#64748b" />
              <Node title="Unstructured" subtitle="Emails • Chat Logs" icon={<ImageIcon size={20} />} color="#64748b" />
              <Node title="Real-time" subtitle="ATMs • Mobile • IoT" icon={<Activity size={20} />} color="#64748b" />
              <Node title="Third-party" subtitle="Credit Bureaus • APIs" icon={<Globe size={20} />} color="#64748b" />
            </div>
          </section>

          <div className="flex justify-center -my-8"><ArrowRight className="rotate-90 text-slate-300" size={32} /></div>

          {/* Layer 2: Ingestion */}
          <section>
            <SectionHeader title="Ingestion Layer" />
            <div className="grid grid-cols-3 gap-12 max-w-4xl mx-auto">
              <Node title="Azure Data Factory" subtitle="Batch • CDC Pipelines" icon={<Layers size={20} />} color="#10b981" />
              <Node title="Event Hubs • IoT Hub" subtitle="Real-time Streaming • Kafka" icon={<Zap size={20} />} color="#10b981" />
              <Node title="API Management" subtitle="External • Third-party APIs" icon={<Network size={20} />} color="#10b981" />
            </div>
          </section>

          <div className="flex justify-center -my-8"><ArrowRight className="rotate-90 text-slate-300" size={32} /></div>

          {/* Layer 3: Storage */}
          <section className="bg-amber-50/50 p-8 rounded-3xl border border-amber-100">
            <SectionHeader title="Centralized Storage" subtitle="Azure Data Lake Gen2" />
            <div className="grid grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Node title="Bronze Zone" subtitle="Raw • Unprocessed Data" icon={<Database size={20} />} color="#f59e0b" className="border-amber-200" />
              <Node title="Silver Zone" subtitle="Cleansed • Normalised" icon={<Database size={20} />} color="#f59e0b" className="border-amber-200" />
              <Node title="Gold Zone" subtitle="Analytics-ready • ML-ready" icon={<Database size={20} />} color="#f59e0b" className="border-amber-200" />
            </div>
          </section>

          <div className="flex justify-center -my-8"><ArrowRight className="rotate-90 text-slate-300" size={32} /></div>

          {/* Layer 4: Processing */}
          <section>
            <SectionHeader title="Processing Layer" />
            <div className="grid grid-cols-3 gap-12 max-w-4xl mx-auto">
              <Node title="Azure Databricks" subtitle="Spark • ELT • Feature Eng." icon={<Cpu size={20} />} color="#8b5cf6" />
              <Node title="Azure Synapse" subtitle="SQL Pools • Orchestration" icon={<Layers size={20} />} color="#8b5cf6" />
              <Node title="Stream Analytics" subtitle="Real-time Transforms" icon={<Activity size={20} />} color="#8b5cf6" />
            </div>
          </section>

          <div className="flex justify-center -my-8"><ArrowRight className="rotate-90 text-slate-300" size={32} /></div>

          {/* Layer 5: Analytics & ML */}
          <section>
            <SectionHeader title="Analytics & ML Layer" />
            <div className="grid grid-cols-4 gap-6">
              <Node title="Power BI" subtitle="Dashboards • KPI Reports" icon={<BarChart3 size={20} />} color="#3b82f6" />
              <Node title="Azure ML + MLflow" subtitle="Fraud • Credit • Churn" icon={<Cpu size={20} />} color="#3b82f6" />
              <Node title="Analysis Services" subtitle="Semantic Model • RLS" icon={<Layers size={20} />} color="#3b82f6" />
              <Node title="Cognitive Services" subtitle="NLP • Chatbot" icon={<Sparkles size={20} />} color="#3b82f6" />
            </div>
          </section>

          <div className="flex justify-center -my-8"><ArrowRight className="rotate-90 text-slate-300" size={32} /></div>

          {/* Layer 6: Data Mesh */}
          <section className="bg-rose-50/50 p-8 rounded-3xl border border-rose-100">
            <SectionHeader title="Data Mesh" subtitle="Domain Ownership" />
            <div className="grid grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Node title="Customer Domain" subtitle="360 Profile • Segmentation" icon={<Network size={20} />} color="#e11d48" className="border-rose-200" />
              <Node title="Operations Domain" subtitle="ATMs • Branch • Logistics" icon={<Network size={20} />} color="#e11d48" className="border-rose-200" />
              <Node title="Finance Domain" subtitle="Loans • Risk • Compliance" icon={<Network size={20} />} color="#e11d48" className="border-rose-200" />
            </div>
          </section>

          {/* Layer 7: Governance & Security */}
          <section className="mt-8">
            <SectionHeader title="Governance & Security" subtitle="Horizontal Layer" />
            <div className="grid grid-cols-4 gap-6">
              <Node title="Azure Purview" subtitle="Catalog • Lineage" icon={<Search size={20} />} color="#10b981" />
              <Node title="Azure AD + RBAC" subtitle="Identity • Access" icon={<ShieldCheck size={20} />} color="#10b981" />
              <Node title="Key Vault" subtitle="Encryption • Secrets" icon={<Lock size={20} />} color="#10b981" />
              <Node title="Sentinel + Monitor" subtitle="Threats • Audit Logs" icon={<ShieldCheck size={20} />} color="#10b981" />
            </div>
          </section>

          {/* Regulatory Compliance */}
          <section className="mt-12 flex flex-wrap justify-center gap-4">
            {['NIST', 'PCI-DSS', 'GDPR', 'AML/KYC', 'IRS', 'CCPA'].map((tag) => (
              <span key={tag} className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold tracking-widest border border-slate-200">
                {tag}
              </span>
            ))}
          </section>
        </div>
      </main>

      {/* AI Modal */}
      <AnimatePresence>
        {showAIModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAIModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">AI Architecture Designer</h2>
                    <p className="text-sm text-slate-500">Generate or edit architecture diagrams with Gemini</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAIModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
                {/* Preview Area */}
                <div className="aspect-video bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
                  {isGenerating ? (
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="animate-spin text-indigo-600" size={40} />
                      <p className="text-slate-500 font-medium animate-pulse">Gemini is designing your architecture...</p>
                    </div>
                  ) : generatedImage ? (
                    <img src={generatedImage} alt="Generated Architecture" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-center p-12">
                      <ImageIcon className="mx-auto text-slate-300 mb-4" size={64} />
                      <p className="text-slate-400 font-medium">Your generated diagram will appear here</p>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-4 bg-rose-50 text-rose-600 rounded-lg text-sm font-medium border border-rose-100">
                    {error}
                  </div>
                )}

                {/* Input Area */}
                <div className="flex flex-col gap-4">
                  <label className="text-sm font-semibold text-slate-700">What would you like to build?</label>
                  <div className="flex gap-3">
                    <textarea 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., A modern data lakehouse architecture for a retail company using Azure Synapse and Databricks..."
                      className="flex-1 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none h-24 text-slate-800"
                    />
                  </div>
                  <div className="flex gap-3 justify-end">
                    {generatedImage && (
                      <button 
                        onClick={handleEdit}
                        disabled={isGenerating || !prompt}
                        className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                      >
                        Refine Current
                      </button>
                    )}
                    <button 
                      onClick={handleGenerate}
                      disabled={isGenerating || !prompt}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
                    >
                      {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                      {generatedImage ? 'Generate New' : 'Generate Diagram'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer / Legend */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 px-8 py-4 flex justify-center gap-8 z-40">
        {[
          { label: 'Sources', color: '#64748b' },
          { label: 'Ingestion', color: '#10b981' },
          { label: 'Storage', color: '#f59e0b' },
          { label: 'Processing', color: '#8b5cf6' },
          { label: 'Analytics/ML', color: '#3b82f6' },
          { label: 'Data Mesh', color: '#e11d48' },
          { label: 'Governance', color: '#10b981' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
          </div>
        ))}
      </footer>
    </div>
  );
}
