import * as React from 'react';

interface ConnectionsDropdownProps {
  onClose: () => void;
  className?: string;
}

export default function ConnectionsDropdown({ onClose, className = "" }: ConnectionsDropdownProps) {
  
  const handleAction = (type: string) => {
    onClose();
    
    // Quick Intents for Productivity Apps
    if (type === 'notion') {
      window.open('https://www.notion.so/', '_blank', 'noopener,noreferrer');
    } else if (type === 'gmail') {
      const subject = encodeURIComponent("Meus Estudos da Bíblia Alpha");
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}`, '_blank', 'popup=yes,width=800,height=600');
    } else if (type === 'drive') {
      window.open('https://drive.google.com/', '_blank', 'noopener,noreferrer');
    } else if (type === 'calendar') {
      const title = encodeURIComponent("Tempo de Estudo: Bíblia Alpha");
      const details = encodeURIComponent("Momento diário de meditação e estudo na Bíblia Alpha.");
      window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`, '_blank', 'popup=yes,width=800,height=600');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className={`absolute w-60 bg-sleek-bg border border-sleek-border rounded-lg shadow-xl py-2 z-40 font-sans ${className}`}>
        <div className="px-4 py-2 text-[10px] font-bold text-sleek-text-muted uppercase tracking-wider border-b border-sleek-border mb-1">
          Nuvem e Conexões
        </div>
        <button 
          onClick={() => handleAction('notion')}
          className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-sleek-hover flex items-center gap-3 transition-colors text-sleek-text-main"
        >
          <div className="w-5 h-5 rounded flex items-center justify-center bg-sleek-hover text-black text-[10px] font-bold">N</div>
          Abrir no Notion
        </button>
        <button 
          onClick={() => handleAction('gmail')}
          className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-sleek-hover flex items-center gap-3 transition-colors text-sleek-text-main"
        >
          <div className="w-5 h-5 rounded flex items-center justify-center bg-[#EA4335] text-white text-[10px] font-bold">M</div>
          Escrever no Gmail
        </button>
        <button 
          onClick={() => handleAction('drive')}
          className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-sleek-hover flex items-center gap-3 transition-colors text-sleek-text-main"
        >
          <div className="w-5 h-5 rounded flex items-center justify-center bg-[#0F9D58] text-white text-[10px] font-bold">D</div>
          Acessar Google Drive
        </button>
        <button 
          onClick={() => handleAction('calendar')}
          className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-sleek-hover flex items-center gap-3 transition-colors text-sleek-text-main"
        >
          <div className="w-5 h-5 rounded flex items-center justify-center bg-[#4285F4] text-white text-[10px] font-bold">C</div>
          Marcar na Agenda
        </button>
      </div>
    </>
  );
}
